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

  return context.next();
}
