import { createSpursProxy } from "@spurs-cloud/accounts/next";

// Gate the console behind the shared Spurs session. Login, the SSO handlers, the
// public API (API-key auth) and the private service API (shared secret) stay open.
// (Next 16 renamed the `middleware` convention to `proxy`.)
export const proxy = createSpursProxy({
  publicPaths: ["/login", "/auth/", "/api/v1/", "/api/private/"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
