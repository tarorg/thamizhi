export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Serve static assets from the bucket
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status !== 404) {
        return response;
      }
    } catch (e) {
      // Fall through to the default handling
    }
    
    // For all other routes, serve the index.html
    return env.ASSETS.fetch(`${url.origin}/index.html`);
  }
}; 