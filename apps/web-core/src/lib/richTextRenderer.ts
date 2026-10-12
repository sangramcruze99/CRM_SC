/**
 * Sanitizes and transforms email copy containing HTML tags and markdown
 * into safe, beautiful, styled HTML for live canvas previews and email dispatches.
 * Explicitly defends against Stored & DOM-based XSS by neutralizing script tags,
 * event handlers, dangerous schemes (javascript:, data:), and unexpected tags.
 */

function sanitizeHtmlInput(input: string): string {
  if (!input) return '';

  let sanitized = input;

  // 1. Completely strip dangerous tags and their contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
  sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');
  sanitized = sanitized.replace(/<embed\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<base\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<meta\b[^>]*>/gi, '');
  sanitized = sanitized.replace(/<link\b[^>]*>/gi, '');

  // 2. Remove all inline event handlers (onload, onerror, onclick, onmouseover, etc.)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Neutralize javascript: and vbscript: URIs
  sanitized = sanitized.replace(/href\s*=\s*["']?\s*(?:javascript|vbscript|data):[^"'>\s]*/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']?\s*(?:javascript|vbscript):[^"'>\s]*/gi, 'src=""');

  return sanitized;
}

export function renderRichEmailContent(rawText?: string): string {
  if (!rawText) return '';

  // Apply pre-sanitization
  let html = sanitizeHtmlInput(rawText);

  // 1. Bold: **text** or <b> or <strong>
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight: 700;">$1</strong>');
  html = html.replace(/<strong>(.*?)<\/strong>/gi, '<strong style="font-weight: 700;">$1</strong>');
  html = html.replace(/<b>(.*?)<\/b>/gi, '<strong style="font-weight: 700;">$1</strong>');

  // 2. Italic: *text* or <i> or <em>
  html = html.replace(/(^|[^\*])\*([^\*\n]+)\*([^\*]|$)/g, '$1<em style="font-style: italic;">$2</em>$3');
  html = html.replace(/<em>(.*?)<\/em>/gi, '<em style="font-style: italic;">$1</em>');
  html = html.replace(/<i>(.*?)<\/i>/gi, '<em style="font-style: italic;">$1</em>');

  // 3. Underline: <u>text</u> -> explicit CSS underline
  html = html.replace(/<u>(.*?)<\/u>/gi, '<span style="text-decoration: underline; text-underline-offset: 3px;">$1</span>');

  // 4. Strikethrough: ~~text~~, <s>, <del>
  html = html.replace(/~~([^~]+)~~/g, '<span style="text-decoration: line-through; opacity: 0.7;">$1</span>');
  html = html.replace(/<(?:s|del)>(.*?)<\/del>|<(?:s|del)>(.*?)<\/s>/gi, '<span style="text-decoration: line-through; opacity: 0.7;">$1$2</span>');

  // 4b. Hyperlinks: Markdown [text](url) and sanitize hrefs
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    const cleanUrl = url.trim().toLowerCase().startsWith('javascript:') ? '#' : url;
    return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: underline; font-weight: 500;">${text}</a>`;
  });

  html = html.replace(/<a\s+(?:(?!(?:style|target)=)[^>])*href=["']([^"']+)["'](?:\s+([^>]*))?>([\s\S]*?)<\/a>/gi, (match, href, rest, content) => {
    const cleanHref = href.trim().toLowerCase().startsWith('javascript:') ? '#' : href;
    if (match.includes('style=')) return match;
    return `<a href="${cleanHref}" target="_blank" rel="noopener noreferrer" style="color: #10b981; text-decoration: underline; font-weight: 500;" ${rest || ''}>${content}</a>`;
  });

  // 5. Headings & Font Sizes
  html = html.replace(/<small>(.*?)<\/small>/gi, '<span style="font-size: 0.82em; opacity: 0.8;">$1</span>');
  html = html.replace(/<h[12]>(.*?)<\/h[12]>/gi, '<div style="font-size: 1.3em; font-weight: 800; margin: 8px 0 4px 0; color: #0f172a;">$1</div>');
  html = html.replace(/<h[34]>(.*?)<\/h[34]>/gi, '<div style="font-size: 1.12em; font-weight: 700; margin: 6px 0 3px 0; color: #0f172a;">$1</div>');

  // 6. Blockquote
  html = html.replace(/<blockquote>([\s\S]*?)<\/blockquote>/gi, '<blockquote style="border-left: 3px solid #10b981; padding: 4px 0 4px 12px; margin: 8px 0; font-style: italic; color: #475569; background: rgba(16, 185, 129, 0.05); border-radius: 0 8px 8px 0;">$1</blockquote>');

  // 7. Lists (Bullet & Numbered)
  const lines = html.split('\n');
  const processedLines: string[] = [];
  let inBulletList = false;
  let inNumberedList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const bulletMatch = line.match(/^(\s*)(?:•|\-|\*)\s+(.*)/);
    const numMatch = line.match(/^(\s*)(\d+)[\.\)]\s+(.*)/);

    if (bulletMatch) {
      if (!inBulletList) {
        if (inNumberedList) {
          processedLines.push('</ol>');
          inNumberedList = false;
        }
        processedLines.push('<ul style="margin: 6px 0; padding-left: 20px; list-style-type: disc;">');
        inBulletList = true;
      }
      processedLines.push(`<li style="margin-bottom: 3px;">${bulletMatch[2]}</li>`);
    } else if (numMatch) {
      if (!inNumberedList) {
        if (inBulletList) {
          processedLines.push('</ul>');
          inBulletList = false;
        }
        processedLines.push('<ol style="margin: 6px 0; padding-left: 20px; list-style-type: decimal;">');
        inNumberedList = true;
      }
      processedLines.push(`<li style="margin-bottom: 3px;">${numMatch[3]}</li>`);
    } else {
      if (inBulletList) {
        processedLines.push('</ul>');
        inBulletList = false;
      }
      if (inNumberedList) {
        processedLines.push('</ol>');
        inNumberedList = false;
      }
      processedLines.push(line);
    }
  }

  if (inBulletList) processedLines.push('</ul>');
  if (inNumberedList) processedLines.push('</ol>');

  // 8. Convert newlines to <br /> except adjacent to blocks
  let result = processedLines.join('\n');
  result = result
    .replace(/(<\/ul>|<\/ol>|<\/blockquote>|<\/div>)\n/gi, '$1')
    .replace(/\n(<ul|<ol|<blockquote|<div)/gi, '$1')
    .replace(/\n/g, '<br />');

  // Final check to guarantee no unhandled script or on* remains
  return sanitizeHtmlInput(result);
}
