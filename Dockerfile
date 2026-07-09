# Build the static bundle with Bun, then serve it with nginx.
FROM oven/bun:1 AS build
WORKDIR /app
COPY . .
RUN bun build.ts

FROM nginx:alpine
# Serve under /encore/ so the site works at ds-design.uk/encore with its
# relative asset paths intact (nginx 301-redirects /encore -> /encore/, and
# /encore/assets/... maps straight to disk). Traefik routes the /encore prefix
# WITHOUT stripping it, so the on-disk path and the URL path line up.
COPY --from=build /app/dist /usr/share/nginx/html/encore
# nginx serves static files (with native HTTP range support for video seeking) on :80
EXPOSE 80
