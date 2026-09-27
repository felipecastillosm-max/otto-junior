const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const appsScriptUrl = env.APPS_SCRIPT_URL;
    const incoming = new URL(request.url);
    const target = new URL(appsScriptUrl);
    target.search = incoming.search;

    const init = {
      method: request.method,
      redirect: "follow"
    };

    if (request.method === "POST") {
      init.headers = { "Content-Type": "application/json" };
      init.body = await request.text();
    }

    const response = await fetch(target.toString(), init);
    const body = await response.text();

    return new Response(body, {
      status: response.status,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
};
