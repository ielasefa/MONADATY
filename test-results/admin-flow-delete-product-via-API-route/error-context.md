# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> delete product via API route
- Location: e2e/admin-flow.spec.ts:214:5

# Error details

```
Error: Channel closed
```

```
Error: page.goto: net::ERR_ABORTED at http://localhost:3458/admin/login
Call log:
  - navigating to "http://localhost:3458/admin/login", waiting until "load"

```

```
Error: browserContext.close: Target page, context or browser has been closed
```