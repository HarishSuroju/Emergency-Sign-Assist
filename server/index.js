const express = require("express");
const cors = require("cors");
const matcherApi = require("./matcherApi");
const apiLogger = require("./middleware/apiLogger");
const path = require("path");
const fs = require("fs");

const app = express();
const clientBuildPath = path.join(__dirname, "..", "client", "dist");
const hasClientBuild = fs.existsSync(path.join(clientBuildPath, "index.html"));

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : ["http://localhost:5173"];

app.use(cors({ origin: allowedOrigins }));

app.use(express.json({ limit: "10mb" }));
app.use("/signs", express.static(path.join(__dirname, "public/signs")));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Mount matcher endpoints under /api.
app.use("/api", apiLogger, matcherApi);
app.use("/api", (_req, res) => {
  res.status(404).json({
    error: "Not found.",
    message: "API route does not exist.",
  });
});

if (hasClientBuild) {
  app.use(express.static(clientBuildPath));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/signs")) return next();
    return res.sendFile(path.join(clientBuildPath, "index.html"));
  });
} else {
  // Fallback for unknown routes when frontend bundle is not present.
  app.use((_req, res) => {
    res.status(404).json({
      error: "Not found.",
      message: "Route does not exist.",
    });
  });
}

// Global error handler.
app.use((err, _req, res, _next) => {
  const statusCode = err.status || err.statusCode || 500;

  if (err.type === "entity.too.large") {
    return res.status(413).json({ message: "Payload too large." });
  }

  console.error(err);
  return res.status(statusCode).json({
    message: statusCode === 500 ? "Internal server error" : err.message,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
