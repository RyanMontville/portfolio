export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    let response = await env.ASSETS.fetch(request);

    return response;
  },
};