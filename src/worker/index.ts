import { Hono, type Context } from "hono";

const app = new Hono();

const MAX_AI_BODY_BYTES = 256 * 1024;
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const AI_API_BASE_URLS = new Map([
  ["https://api.openai.com", "https://api.openai.com/v1"],
  ["https://api.deepseek.com", "https://api.deepseek.com"],
  ["https://api.moonshot.cn", "https://api.moonshot.cn/v1"],
  ["https://api.moonshot.ai", "https://api.moonshot.ai/v1"],
  ["https://api.minimaxi.com", "https://api.minimaxi.com/v1"],
  ["https://api.minimax.io", "https://api.minimax.io/v1"],
]);
const MINIMAX_API_BASE_URLS = new Set([
  "https://api.minimaxi.com/v1",
  "https://api.minimax.io/v1",
]);

interface AIRequestBody {
  apiKey: string;
  model: string;
  content: string;
  apiEndpoint: string;
}

function jsonError(message: string, status: 400 | 413 | 502 | 500) {
  return { message, status } as const;
}

async function readLimitedJson(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_AI_BODY_BYTES) {
    throw jsonError("Request body is too large", 413);
  }

  if (!request.body) throw jsonError("Request body is required", 400);

  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0;
  let text = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_AI_BODY_BYTES) {
      await reader.cancel();
      throw jsonError("Request body is too large", 413);
    }
    text += decoder.decode(value, { stream: true });
  }

  text += decoder.decode();
  try {
    return JSON.parse(text);
  } catch {
    throw jsonError("Invalid JSON body", 400);
  }
}

function parseAIRequest(value: unknown): AIRequestBody {
  if (!value || typeof value !== "object") {
    throw jsonError("Invalid request body", 400);
  }

  const body = value as Record<string, unknown>;
  const required = ["apiKey", "model", "content", "apiEndpoint"] as const;
  for (const field of required) {
    if (typeof body[field] !== "string" || body[field].length === 0) {
      throw jsonError(`${field} is required`, 400);
    }
  }

  let endpoint: URL;
  try {
    endpoint = new URL(body.apiEndpoint as string);
  } catch {
    throw jsonError("Invalid AI API endpoint", 400);
  }
  const apiEndpoint = AI_API_BASE_URLS.get(endpoint.origin);
  if (!apiEndpoint || endpoint.username || endpoint.password) {
    throw jsonError("Unsupported AI API endpoint", 400);
  }

  return {
    apiKey: body.apiKey as string,
    model: body.model as string,
    content: body.content as string,
    apiEndpoint,
  };
}

function openAIRequest(body: AIRequestBody, payload: Record<string, unknown>) {
  const requestPayload = { ...payload };
  if (MINIMAX_API_BASE_URLS.has(body.apiEndpoint)) {
    // MiniMax separates reasoning from content with this provider-specific flag.
    requestPayload.reasoning_split = true;
    delete requestPayload.response_format;
  }

  return fetch(`${body.apiEndpoint}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${body.apiKey}`,
    },
    body: JSON.stringify({ model: body.model, ...requestPayload }),
  });
}

function streamOpenAIText(body: ReadableStream<Uint8Array>) {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffered = "";

  const emitLine = (
    line: string,
    controller: TransformStreamDefaultController<Uint8Array>
  ) => {
    if (!line.startsWith("data:") || line.includes("[DONE]")) return;
    try {
      const data = JSON.parse(line.slice(5).trim()) as {
        choices?: Array<{ delta?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.delta?.content;
      if (content) controller.enqueue(encoder.encode(content));
    } catch {
      // Ignore non-JSON SSE metadata while preserving incomplete lines in buffered.
    }
  };

  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffered += decoder.decode(chunk, { stream: true });
        const lines = buffered.split(/\r?\n/);
        buffered = lines.pop() ?? "";
        for (const line of lines) emitLine(line, controller);
      },
      flush(controller) {
        buffered += decoder.decode();
        if (buffered) emitLine(buffered, controller);
      },
    })
  );
}

app.post("/api/grammar", async (c) => {
  try {
    const body = parseAIRequest(await readLimitedJson(c.req.raw));
    const response = await openAIRequest(body, {
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `你是一个专业的中文简历错别字检查助手。完整检查输入文本中的拼写、语法、语境用词和专业术语错误。返回 JSON：{"errors":[{"text":"错误文本","message":"说明","type":"spelling或grammar","suggestions":["建议"]}]}`,
        },
        { role: "user", content: body.content },
      ],
    });

    if (!response.ok) {
      return c.json({ error: "AI provider request failed" }, 502);
    }

    return new Response(response.body, {
      status: response.status,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (error) {
    const known = error as { message?: string; status?: number };
    console.error(JSON.stringify({ event: "grammar_error", message: known.message }));
    const status = known.status === 413 ? 413 : known.status === 400 ? 400 : 500;
    return c.json({ error: known.message ?? "Failed to check grammar" }, status);
  }
});

app.post("/api/polish", async (c) => {
  try {
    const body = parseAIRequest(await readLimitedJson(c.req.raw));
    const response = await openAIRequest(body, {
      messages: [
        {
          role: "system",
          content: "你是专业的简历优化助手。使用专业、简洁、主动的表达，突出成就，保持原有信息和格式。只返回优化后的文本。",
        },
        { role: "user", content: body.content },
      ],
      stream: true,
    });

    if (!response.ok || !response.body) {
      return c.json({ error: "AI provider request failed" }, 502);
    }

    return new Response(streamOpenAIText(response.body), {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const known = error as { message?: string; status?: number };
    console.error(JSON.stringify({ event: "polish_error", message: known.message }));
    const status = known.status === 413 ? 413 : known.status === 400 ? 400 : 500;
    return c.json({ error: known.message ?? "Failed to polish content" }, status);
  }
});

function isPrivateImageHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host === "::1" || host.startsWith("fe80:") || host.startsWith("fc") || host.startsWith("fd")) {
    return true;
  }

  const parts = host.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) return false;
  const [a, b] = parts;
  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function parseImageUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw jsonError("Invalid image URL", 400);
  }
  if (url.protocol !== "https:" || url.username || url.password || isPrivateImageHost(url.hostname)) {
    throw jsonError("Only public HTTPS image URLs are allowed", 400);
  }
  return url;
}

async function fetchImage(url: URL, method: "GET" | "HEAD"): Promise<Response> {
  let current = url;
  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects += 1) {
    const response = await fetch(current, {
      method,
      redirect: "manual",
      headers: { Accept: "image/avif,image/webp,image/png,image/jpeg,image/gif" },
    });
    if (response.status < 300 || response.status >= 400) return response;
    const location = response.headers.get("location");
    if (!location || redirects === MAX_REDIRECTS) {
      throw jsonError("Too many image redirects", 400);
    }
    current = parseImageUrl(new URL(location, current).href);
  }
  throw jsonError("Image request failed", 502);
}

function limitedImageStream(body: ReadableStream<Uint8Array>) {
  let received = 0;
  return body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength;
        if (received > MAX_IMAGE_BYTES) {
          controller.error(new Error("Image exceeds the 2 MB limit"));
          return;
        }
        controller.enqueue(chunk);
      },
    })
  );
}

async function imageProxy(c: Context) {
  try {
    const rawUrl = c.req.query("url");
    if (!rawUrl) return c.json({ error: "Missing image URL" }, 400);

    const method = c.req.method === "HEAD" ? "HEAD" : "GET";
    const response = await fetchImage(parseImageUrl(rawUrl), method);
    if (!response.ok) return c.json({ error: "Failed to fetch image" }, 502);

    const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
    if (!contentType.startsWith("image/") || contentType === "image/svg+xml") {
      return c.json({ error: "Unsupported image type" }, 400);
    }

    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      return c.json({ error: "Image exceeds the 2 MB limit" }, 413);
    }

    const headers = new Headers({
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=86400",
      "X-Content-Type-Options": "nosniff",
    });
    if (contentLength > 0) headers.set("Content-Length", String(contentLength));

    if (method === "HEAD") return new Response(null, { headers });
    if (!response.body) return c.json({ error: "Image response was empty" }, 502);
    return new Response(limitedImageStream(response.body), { headers });
  } catch (error) {
    const known = error as { message?: string; status?: number };
    console.error(JSON.stringify({ event: "image_proxy_error", message: known.message }));
    const status = known.status === 413 ? 413 : known.status === 400 ? 400 : 500;
    return c.json({ error: known.message ?? "Image proxy failed" }, status);
  }
}

app.get("/api/proxy/image", imageProxy);
app.on("HEAD", "/api/proxy/image", imageProxy);

export default app;
