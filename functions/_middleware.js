const GONE_PREFIXES = [
  "/sample-page",
  "/talk",
  "/topics",
  "/tryluck",
  "/分类查看",
  "/%e5%88%86%e7%b1%bb%e6%9f%a5%e7%9c%8b",
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const decodedLower = decodeURIComponent(url.pathname).toLowerCase();
  const rawLower = url.pathname.toLowerCase();

  for (const p of GONE_PREFIXES) {
    if (
      rawLower === p ||
      rawLower.startsWith(p + "/") ||
      decodedLower === p ||
      decodedLower.startsWith(p + "/")
    ) {
      return new Response("410 Gone", {
        status: 410,
        headers: { "content-type": "text/plain; charset=utf-8" },
      });
    }
  }

  // Serve /ads.txt, /robots.txt, /.well-known/* directly with HTTP 200 on both apex & www
  if (
    url.hostname === "vooqqqm.com" &&
    url.pathname !== "/ads.txt" &&
    url.pathname !== "/robots.txt" &&
    !url.pathname.startsWith("/.well-known/")
  ) {
    url.hostname = "www.vooqqqm.com";
    return Response.redirect(url.toString(), 301);
  }

  return context.next();
}
