import site from "./assets/config/site.json" with { type: "json" };

export default {
  fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "awz-renovation.jf-seignemorte.workers.dev") {
      return Response.redirect(site.siteUrl + url.pathname + url.search, 301);
    }
    return env.ASSETS.fetch(request);
  },
};
