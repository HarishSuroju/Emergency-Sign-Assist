# Deployment Guide

## 1) Install dependencies

```bash
npm run install:all
```

Note: `npm install` at repo root also installs both app folders automatically via `postinstall`.

## 2) Build frontend

```bash
npm run build
```

This creates `client/dist`, which the Express server serves in production.

## 3) Configure environment variables

Server (`server/.env`):

- `PORT` (default: `5000`)
- `CORS_ORIGIN` (comma-separated origins if needed)
- `SIGN_ANALYZER_FALLBACK_TEXT` (optional fallback response text for `/api/analyze-sign`)

Client (`client/.env`):

- `VITE_API_BASE_URL` (optional)
  - Leave empty in production when frontend and backend are served from the same domain.

## 4) Start production server

```bash
npm start
```

## Notes

- The backend now accepts larger JSON payloads (`10mb`) for base64 image analysis requests.
- `/api/analyze-sign` has a placeholder implementation for deployment stability until full model integration is added.
