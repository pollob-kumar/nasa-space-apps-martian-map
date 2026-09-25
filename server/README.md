# server/ (OPTIONAL - phase 2 only)

Not part of the MVP (ADR-002: static client + static data). Create this only if you need (a) a proxy for NASA APIs that need
secrets/CORS help, or (b) a server-side AI assistant so no API key reaches the browser. Contract: docs/API_SPEC.md section 4.
If you do build it, follow the pattern recorded in ADR-014: one service module per data source, thin HTTP handlers, response models that mirror API_SPEC.md, and no invented fallback values.
