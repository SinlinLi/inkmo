# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@10.32.1 --activate

# Install deps separately to cache them
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod=false

# Copy the rest and build
COPY . .
RUN pnpm run build

# Stage 2: serve via nginx
FROM nginx:1.27-alpine AS runtime

# Replace default site config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Static assets
COPY --from=build /app/dist /usr/share/nginx/html

# Bundled third-party license texts (MIT/Apache/MPL attribution requirements).
COPY --from=build /app/LICENSE /usr/share/doc/markdown-editor/LICENSE
COPY --from=build /app/NOTICES.md /usr/share/doc/markdown-editor/NOTICES.md

EXPOSE 80

# nginx default CMD already runs in foreground via daemon off
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
