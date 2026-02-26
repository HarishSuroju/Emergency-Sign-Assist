module.exports = function validateSignPayload(req, res, next) {
  const { landmarks } = req.body;

  if (!landmarks) {
    return res.status(400).json({
      error: "Invalid payload",
      message: "Missing landmarks object",
    });
  }

  if (typeof landmarks !== "object") {
    return res.status(400).json({
      error: "Invalid payload",
      message: "Landmarks must be an object",
    });
  }

  if (!Array.isArray(landmarks.hands)) {
    return res.status(400).json({
      error: "Invalid payload",
      message: "Landmarks.hands must be an array",
    });
  }

  // Validate numeric coordinates (basic check)
  for (const hand of landmarks.hands) {
    if (!Array.isArray(hand)) {
      return res.status(400).json({
        error: "Invalid payload",
        message: "Each hand must be an array of points",
      });
    }

    for (const point of hand) {
      if (
        typeof point.x !== "number" ||
        typeof point.y !== "number" ||
        typeof point.z !== "number"
      ) {
        return res.status(400).json({
          error: "Invalid payload",
          message: "Landmark coordinates must be numeric",
        });
      }
    }
  }

  next();
};