// Runtime configuration for the SPA, loaded before the app bundle.
//
// In the Docker production image this file is regenerated at container
// start (see docker/entrypoint.sh) from the API_BASE_URL environment
// variable, so the API target can change without a rebuild. Locally
// (npm run dev / vite preview) this checked-in copy is served as-is:
// apiBaseUrl stays null so src/api/client.ts falls back to
// VITE_API_BASE_URL or its hardcoded default instead.
window.__APP_CONFIG__ = {
  apiBaseUrl: null,
}
