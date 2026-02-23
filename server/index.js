const express = require("express");
const cors = require("cors");
const matcherApi = require("./matcherApi");
const apiLogger = require("./middleware/apiLogger");
const path = require("path");

const app = express();

// Allow frontend dev server calls.
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use("/signs", express.static(path.join(__dirname, "public/signs")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount matcher endpoints under /api.
app.use("/api", apiLogger, matcherApi);

// Fallback for unknown routes.
app.use((_req, res) => {
  res.status(404).json({
    error: "Not found.",
    message: "Route does not exist.",
  });
});

// Global error handler.
app.use((err, _req, res, _next) => {
  // Log full error for diagnostics.
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Matcher API running on port ${PORT}`);
});
