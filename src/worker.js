export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    let response = await env.ASSETS.fetch(request);

    if (response.status === 404 && !url.pathname.includes('.')) {
      return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    }

    return response;
  },
};