import { afterEach, describe, expect, it, vi } from "vitest";
import app from "./index";

describe("Worker request guards", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects arbitrary AI proxy endpoints", async () => {
    const response = await app.request("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "test",
        model: "test",
        content: "test",
        apiEndpoint: "https://example.com/v1",
      }),
    });

    expect(response.status).toBe(400);
  });

  it.each([
    ["OpenAI", "https://api.openai.com/v1", "https://api.openai.com/v1/chat/completions"],
    ["DeepSeek", "https://api.deepseek.com/v1", "https://api.deepseek.com/chat/completions"],
    ["Moonshot China", "https://api.moonshot.cn/v1", "https://api.moonshot.cn/v1/chat/completions"],
    ["Moonshot global", "https://api.moonshot.ai/v1", "https://api.moonshot.ai/v1/chat/completions"],
    ["MiniMax China", "https://api.minimaxi.com/v1", "https://api.minimaxi.com/v1/chat/completions"],
    ["MiniMax global", "https://api.minimax.io/v1", "https://api.minimax.io/v1/chat/completions"],
  ])("allows the %s API endpoint", async (_provider, apiEndpoint, expectedUrl) => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ errors: [] }), {
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    const response = await app.request("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "test",
        model: "test",
        content: "test",
        apiEndpoint,
      }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledWith(expectedUrl, expect.any(Object));
  });

  it("uses MiniMax-compatible reasoning and JSON options", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ choices: [] }), {
        headers: { "Content-Type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", fetchMock);

    await app.request("/api/grammar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: "test",
        model: "MiniMax-M2.7",
        content: "test",
        apiEndpoint: "https://api.minimax.io/v1",
      }),
    });

    const requestInit = fetchMock.mock.calls[0][1] as RequestInit;
    const requestBody = JSON.parse(requestInit.body as string) as Record<
      string,
      unknown
    >;
    expect(requestBody.reasoning_split).toBe(true);
    expect(requestBody).not.toHaveProperty("response_format");
  });

  it("rejects private and non-HTTPS image URLs", async () => {
    const response = await app.request(
      "/api/proxy/image?url=http%3A%2F%2F127.0.0.1%2Fsecret"
    );

    expect(response.status).toBe(400);
  });

  it("rejects oversized AI request bodies", async () => {
    const response = await app.request("/api/polish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "x".repeat(300 * 1024),
    });

    expect(response.status).toBe(413);
  });
});
