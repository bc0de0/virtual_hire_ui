#!/bin/sh
# Runs as part of nginx's /docker-entrypoint.d/ startup sequence.
# Regenerates env-config.js from the container's environment so the API
# target is a deploy-time choice, not a build-time one.
set -eu

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__APP_CONFIG__ = {
  apiBaseUrl: "${API_BASE_URL:-http://10.10.24.196:8000}",
};
EOF
