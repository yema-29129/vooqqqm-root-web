const GONE_PREFIXES = [
  "/sample-page",
  "/talk",
  "/topics",
  "/tryluck",
  "/分类查看",
  "/%e5%88%86%e7%b1%bb%e6%9f%a5%e7%9c%8b",
  "/投资策略",
  "/美股市场",
  "/go",
  "/wp-admin",
  "/wp-content",
  "/wp-includes",
  "/wp-login.php",
  "/xmlrpc.php",
];

const LEGACY_REDIRECTS = new Map([
  ["/出国旅游", "/categories/travel"],
  ["/银行开户", "/categories/cross-border"],
  ["/银行开户/跨境汇款", "/categories/cross-border"],
  ["/articlearchive", "/guides/"],
  ["/blogmap", "/guides/"],
  ["/recommended", "/guides/"],
  ["/计算器", "/tools/"],
  ["/定投复利计算器", "/tools/compound-calculator"],
  ["/计算器/定投复利计算器", "/tools/compound-calculator"],
  ["/单利计算器", "/tools/simple-interest-calculator"],
  ["/关于我们（about-us）", "/about"],
  ["/友情链接", "/about"],
  ["/links", "/about"],
  ["/隐私政策（privacy-policy）", "/privacy"],
  ["/免责声明（disclaimer）", "/disclaimer"],
  ["/跨境支付通和跨境转账，有什么不一样？", "/guides/cross-border-payment-connect-vs-wire-transfer"],
  ["/汇丰蓝狮子的必要性（附申请流程及注意事项）", "/guides/hk-multicurrency-debit-card-usage-guide"],
  ["/香港汇丰账户", "/guides/hk-bank-account-maintenance-and-compliance"],
  ["/香港国际机场离境税退税", "/guides/hk-airport-departure-tax-refund-guide"],
  ["/日本旅游｜从广州到香港国际机场乘机", "/guides/guangzhou-shenzhen-to-hk-airport-transit-guide"],
  ["/日本旅游｜日本旅游签证-手机卡流量-衣食住行", "/guides/japan-ic-cards-suica-icoca-payment-guide"],
]);

const NOINDEX_FEED_PATHS = new Set([
  "/rss.xml",
  "/llms.txt",
  "/.well-known/llms.txt",
  "/llms-full.txt",
  "/guides/feed.json",
  "/openapi.json",
  "/.well-known/ai-plugin.json",
]);

export async function onRequest(context) {
  const url = new URL(context.request.url);
  let decodedPath = url.pathname;
  try {
    decodedPath = decodeURIComponent(url.pathname);
  } catch (_) {}
  const decodedTrimmed = decodedPath.length > 1 ? decodedPath.replace(/\/+$/, "") : decodedPath;
  const decodedLower = decodedTrimmed.toLowerCase();
  const rawLower = url.pathname.toLowerCase();

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

  // Legacy WordPress paths -> 301 permanent redirect to clean canonical guide/category
  const mapped = LEGACY_REDIRECTS.get(decodedTrimmed);
  if (mapped) {
    return Response.redirect(`https://www.vooqqqm.com${mapped}`, 301);
  }
  if (decodedTrimmed.startsWith("/出国旅游/")) {
    return Response.redirect("https://www.vooqqqm.com/categories/travel", 301);
  }
  if (decodedTrimmed.startsWith("/银行开户/")) {
    return Response.redirect("https://www.vooqqqm.com/categories/cross-border", 301);
  }

  // Obsolete WordPress system/stock paths -> 410 Gone
  if (/^\/wp-[a-z0-9_-]*\.php$/i.test(rawLower)) {
    return new Response("410 Gone", {
      status: 410,
      headers: { "content-type": "text/plain; charset=utf-8" },
    });
  }
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

  const response = await context.next();
  if (NOINDEX_FEED_PATHS.has(url.pathname)) {
    const nextRes = new Response(response.body, response);
    nextRes.headers.set("X-Robots-Tag", "noindex");
    return nextRes;
  }
  return response;
}
