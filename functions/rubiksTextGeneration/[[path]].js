export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  const subPath = url.pathname.replace('/rubiksTextGeneration', '') || '/';
  
  const targetUrl = `https://ryanmontville.github.io/rubiksTextGeneration${subPath}${url.search}`;

  const response = await fetch(targetUrl, {
    headers: context.request.headers,
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}