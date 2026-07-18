# syntax=docker/dockerfile:1

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# --- deps: install once, reused by both the dev and build stages ----------
FROM base AS deps
RUN npm ci

# --- dev: hot-reload Vite dev server against a bind-mounted source tree ---
FROM deps AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- build: production static bundle ---------------------------------------
FROM deps AS build
COPY . .
RUN npm run build

# --- runtime: nginx serving the static bundle, non-root ---------------------
FROM nginx:1.27-alpine AS runtime

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/entrypoint.sh /docker-entrypoint.d/40-env-config.sh
RUN chmod +x /docker-entrypoint.d/40-env-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
