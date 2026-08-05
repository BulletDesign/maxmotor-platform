const PRODUCTION_HOST = "maxmotor4x4.com";
const PAGES_HOST_SUFFIX = ".maxmotor-platform.pages.dev";

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const isTechnicalHost = url.hostname === "maxmotor-platform.pages.dev"
    || url.hostname.endsWith(PAGES_HOST_SUFFIX);

  if (isTechnicalHost) {
    url.protocol = "https:";
    url.hostname = PRODUCTION_HOST;
    url.port = "";
    return Response.redirect(url.toString(), 308);
  }

  if (["/portal", "/portal.html", "/MiMaxmotor.html"].includes(url.pathname)) {
    url.pathname = "/MiMaxmotor";
    return Response.redirect(url.toString(), 308);
  }

  if (["/portal-admin", "/portal-admin.html", "/portal-maxmotor.html"].includes(url.pathname)) {
    url.pathname = "/portal-maxmotor";
    return Response.redirect(url.toString(), 308);
  }

  if (url.pathname === "/console.html") {
    url.pathname = "/console";
    return Response.redirect(url.toString(), 308);
  }

  if (["/portal-superadmin", "/portal-superadmin.html"].includes(url.pathname)) {
    return new Response("Not Found", { status: 404, headers: { "cache-control": "no-store" } });
  }

  return context.next();
}
