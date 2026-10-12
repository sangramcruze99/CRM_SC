#!/usr/bin/env node
/**
 * Business OS — Production Ingress Reverse Proxy
 * High-performance TLS 1.3 reverse proxy with automated HTTP->HTTPS redirection,
 * strict enterprise security headers, distributed X-Correlation-ID tracing,
 * and deep /readyz & /healthz infrastructure readiness probes.
 */

import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CERTS_DIR = path.resolve(ROOT_DIR, 'certs');
const KEY_PATH = path.resolve(CERTS_DIR, 'tls.key');
const CERT_PATH = path.resolve(CERTS_DIR, 'tls.crt');

const HTTPS_PORT = parseInt(process.env.INGRESS_HTTPS_PORT || '8443', 10);
const HTTP_PORT = parseInt(process.env.INGRESS_HTTP_PORT || '8080', 10);

const UPSTREAMS = {
  gateway: { host: '127.0.0.1', port: 3000 },
  webcore: { host: '127.0.0.1', port: 4000 },
  storage: { host: '127.0.0.1', port: 9000 },
  redis:   { host: '127.0.0.1', port: 6379 },
  db:      { host: '127.0.0.1', port: 5432 },
  chatWs:  { host: '127.0.0.1', port: 3014 },
};

// Security headers applied to all ingress responses
const SECURITY_HEADERS = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob: ws: wss:; frame-ancestors 'self';",
  'X-Ingress-Proxy': 'BusinessOS-Production-Ingress/1.0',
};

// Verify TLS Certificates Exist
if (!fs.existsSync(KEY_PATH) || !fs.existsSync(CERT_PATH)) {
  console.error(`[INGRESS ERROR] Missing TLS certificates at ${KEY_PATH} or ${CERT_PATH}. Run 'node scripts/generate-tls-certs.mjs' first.`);
  process.exit(1);
}

const tlsOptions = {
  key: fs.readFileSync(KEY_PATH),
  cert: fs.readFileSync(CERT_PATH),
  minVersion: 'TLSv1.2',
  maxVersion: 'TLSv1.3',
  ciphers: [
    'ECDHE-ECDSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-ECDSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES256-GCM-SHA384',
    'DHE-RSA-AES128-GCM-SHA256',
    'DHE-RSA-AES256-GCM-SHA384',
  ].join(':'),
  honorCipherOrder: true,
};

function checkPort(host, port, timeoutMs = 1500) {
  return new Promise((resolve) => {
    const sock = new net.Socket();
    let resolved = false;
    sock.setTimeout(timeoutMs);
    sock.on('connect', () => {
      if (!resolved) {
        resolved = true;
        sock.destroy();
        resolve(true);
      }
    });
    sock.on('timeout', () => {
      if (!resolved) {
        resolved = true;
        sock.destroy();
        resolve(false);
      }
    });
    sock.on('error', () => {
      if (!resolved) {
        resolved = true;
        sock.destroy();
        resolve(false);
      }
    });
    sock.connect(port, host);
  });
}

// Resolve Upstream Target from URL Path
function resolveUpstream(urlPath) {
  if (urlPath.startsWith('/api/') || urlPath.startsWith('/api/v1/') || urlPath.startsWith('/gateway/')) {
    return { target: UPSTREAMS.gateway, stripPrefix: false };
  }
  if (urlPath.startsWith('/vault/') || urlPath.startsWith('/storage/')) {
    return { target: UPSTREAMS.storage, stripPrefix: false };
  }
  return { target: UPSTREAMS.webcore, stripPrefix: false };
}

// 1. HTTP Server (Port 80 / 8080) — Mandatory HTTPS Redirect
const httpServer = http.createServer((req, res) => {
  const hostHeader = req.headers.host || 'localhost';
  const hostname = hostHeader.split(':')[0];
  const redirectUrl = `https://${hostname}:${HTTPS_PORT}${req.url}`;

  res.writeHead(301, {
    Location: redirectUrl,
    'Content-Type': 'text/plain',
    'X-Ingress-Redirect': 'HTTP-to-HTTPS',
  });
  res.end(`Redirecting to secure endpoint: ${redirectUrl}\n`);
});

// 2. HTTPS Server (Port 443 / 8443) — TLS 1.3 Reverse Proxy
const httpsServer = https.createServer(tlsOptions, async (req, res) => {
  const startTime = Date.now();
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

  // Attach correlation ID to client response headers
  res.setHeader('x-correlation-id', correlationId);

  // A. Liveness probe (/healthz)
  if (req.url === '/healthz') {
    res.writeHead(200, {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
    });
    res.end(
      JSON.stringify({
        status: 'UP',
        ingress: 'BusinessOS-TLS1.3-Ingress',
        tlsVersion: req.socket.getProtocol ? req.socket.getProtocol() : 'TLSv1.3',
        cipher: req.socket.getCipher ? req.socket.getCipher().name : 'AES-GCM',
        timestamp: new Date().toISOString(),
        correlationId,
      })
    );
    return;
  }

  // B. Deep Readiness probe (/readyz)
  if (req.url === '/readyz') {
    const checks = {
      ingress: 'UP',
      database: 'DOWN',
      redis: 'DOWN',
      objectStorage: 'DOWN',
      gateway: 'DOWN',
      webcore: 'DOWN',
    };

    const [dbOk, redisOk, storageOk, gatewayOk, webcoreOk] = await Promise.all([
      checkPort(UPSTREAMS.db.host, UPSTREAMS.db.port),
      checkPort(UPSTREAMS.redis.host, UPSTREAMS.redis.port),
      checkPort(UPSTREAMS.storage.host, UPSTREAMS.storage.port),
      checkPort(UPSTREAMS.gateway.host, UPSTREAMS.gateway.port),
      checkPort(UPSTREAMS.webcore.host, UPSTREAMS.webcore.port),
    ]);

    checks.database = dbOk ? 'UP' : 'DOWN';
    checks.redis = redisOk ? 'UP' : 'DOWN';
    checks.objectStorage = storageOk ? 'UP' : 'DOWN';
    checks.gateway = gatewayOk ? 'UP' : 'DOWN';
    checks.webcore = webcoreOk ? 'UP' : 'DOWN';

    const isAllReady = Object.values(checks).every((c) => c === 'UP');
    const latencyMs = Date.now() - startTime;

    res.writeHead(isAllReady ? 200 : 503, {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
    });
    res.end(
      JSON.stringify({
        status: isAllReady ? 'READY' : 'NOT_READY',
        checks,
        latencyMs,
        timestamp: new Date().toISOString(),
        correlationId,
      })
    );
    return;
  }

  const { target } = resolveUpstream(req.url);

  // Prepare upstream proxy headers
  const upstreamHeaders = { ...req.headers };
  upstreamHeaders['x-forwarded-for'] = req.socket.remoteAddress || '127.0.0.1';
  upstreamHeaders['x-forwarded-proto'] = 'https';
  upstreamHeaders['x-forwarded-host'] = req.headers.host || 'localhost';
  upstreamHeaders['x-ingress-token'] = 'businessos-internal-verified-ingress';
  upstreamHeaders['x-correlation-id'] = correlationId;

  const proxyReq = http.request(
    {
      host: target.host,
      port: target.port,
      path: req.url,
      method: req.method,
      headers: upstreamHeaders,
    },
    (proxyRes) => {
      // Inject mandatory security headers onto outgoing response
      const mergedHeaders = {
        ...proxyRes.headers,
        ...SECURITY_HEADERS,
        'x-correlation-id': correlationId,
      };

      res.writeHead(proxyRes.statusCode || 200, mergedHeaders);
      proxyRes.pipe(res);

      res.on('finish', () => {
        const durationMs = Date.now() - startTime;
        const logEntry = {
          timestamp: new Date().toISOString(),
          level: (proxyRes.statusCode || 200) >= 500 ? 'ERROR' : (proxyRes.statusCode || 200) >= 400 ? 'WARN' : 'INFO',
          service: 'ingress',
          correlationId,
          clientIp: req.socket.remoteAddress || '127.0.0.1',
          method: req.method,
          path: req.url,
          upstream: `${target.host}:${target.port}`,
          statusCode: proxyRes.statusCode || 200,
          durationMs,
        };
        console.log(JSON.stringify(logEntry));
      });
    }
  );

  proxyReq.on('error', (err) => {
    res.writeHead(502, {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
      'x-correlation-id': correlationId,
    });
    res.end(
      JSON.stringify({
        error: 'Bad Gateway',
        message: `Upstream service ${target.host}:${target.port} unavailable: ${err.message}`,
        correlationId,
      })
    );
  });

  // Stream client request body to upstream
  req.pipe(proxyReq);
});

// 3. WebSocket Upgrade Handler
httpsServer.on('upgrade', (req, socket, head) => {
  const target = req.url.startsWith('/socket.io/') ? UPSTREAMS.chatWs : UPSTREAMS.webcore;

  const proxyReq = http.request({
    host: target.host,
    port: target.port,
    path: req.url,
    method: req.method,
    headers: req.headers,
  });

  proxyReq.on('upgrade', (proxyRes, proxySocket, proxyHead) => {
    socket.write(
      `HTTP/1.1 101 Switching Protocols\r\n` +
      `Upgrade: ${proxyRes.headers['upgrade']}\r\n` +
      `Connection: Upgrade\r\n\r\n`
    );
    proxySocket.pipe(socket);
    socket.pipe(proxySocket);
  });

  proxyReq.on('error', () => {
    socket.destroy();
  });

  proxyReq.end();
});

// Start both listeners
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`\x1b[36m[INGRESS HTTP]\x1b[0m  Listening on http://0.0.0.0:${HTTP_PORT} (Redirects to HTTPS on ${HTTPS_PORT})`);
});

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
  console.log(`\x1b[32m[INGRESS HTTPS]\x1b[0m Listening on https://0.0.0.0:${HTTPS_PORT} (TLS 1.2/1.3 Active)`);
  console.log(`  Routes:`);
  console.log(`    /api/*    -> API Gateway (${UPSTREAMS.gateway.host}:${UPSTREAMS.gateway.port})`);
  console.log(`    /vault/*  -> Object Storage (${UPSTREAMS.storage.host}:${UPSTREAMS.storage.port})`);
  console.log(`    /*        -> Web Core (${UPSTREAMS.webcore.host}:${UPSTREAMS.webcore.port})`);
});
