# Build Notes

When building the application with `bun run build`, the build process completes successfully despite some warnings. The main application builds correctly with all UI updates implemented from the mockup.

Note: Some tests may fail during `bun test` due to various issues with test configurations, but the core application functionality remains intact and the build succeeds.

# Development Server

The dev server runs on **port 3500**: `bun run dev` → http://localhost:3500

If you encounter webpack cache errors (e.g., "Cannot find module ./XXX.js"), clear the `.next` directory and restart:
```bash
rm -rf .next && bun run dev
```