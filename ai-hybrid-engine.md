# Hybrid AI Engine Integration Plan (Groq + OpenRouter)

## Objective
Seamlessly integrate **Groq** (sub-second ultra-fast inference) and **OpenRouter** (GPT-4o multimodal vision and deep reasoning) into the Business OS monorepo, empowering the AI Copilot, AI Studio, Document OCR, and CRM automation with zero mock responses.

## Architecture
- **Environment**: Add `GROQ_API_KEY` and `OPENROUTER_API_KEY` to root `.env`.
- **Backend (`apps/ai-engine`)**:
  - `PromptsService`: Hybrid multi-provider client supporting Groq (`https://api.groq.com/openai/v1`) and OpenRouter (`https://openrouter.ai/api/v1`) with contextual tenant metadata injection and automatic failover.
  - `OcrService`: Vision-enabled document OCR using OpenRouter's `openai/gpt-4o`.
- **API Gateway (`apps/web-core`)**:
  - Direct proxying for `/api/ai/ask` and `/api/ai/prompts/ask` to `ai-engine` (port 3010).
- **Frontend UI (`apps/web-core`)**:
  - `AskAICopilot.tsx`: Provider/model toggle (`⚡ Groq Turbo` vs `🧠 OpenRouter GPT-4o`), live latency display, and intelligent action chips.
  - `AiStudioClient.tsx`: Real AI execution for contact enrichment, lead scoring, and email generation.

## Verification
- Live end-to-end HTTP completions for Groq and OpenRouter.
- Security and lint verification scripts.
