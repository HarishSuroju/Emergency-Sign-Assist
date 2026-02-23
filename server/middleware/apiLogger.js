// Logs request timestamp, phrase payload, and response duration for API routes.
function apiLogger(req, res, next) {
  const startedAt = Date.now();
  const requestTime = new Date(startedAt).toISOString();
  const phrase = typeof req.body?.phrase === "string" ? req.body.phrase : "N/A";

  res.on("finish", () => {
    const responseTime = Date.now() - startedAt;
    console.log(
      `[${requestTime}] ${req.method} ${req.originalUrl} phrase="${phrase}" responseTime=${responseTime}ms status=${res.statusCode}`
    );
  });

  next();
}

module.exports = apiLogger;
