module.exports = function validateSignPayload(req, res, next) {
  const { landmarks } = req.body || {};

  if (!landmarks) {
    return res.status(400).json({ message: "Landmarks object required." });
  }

  if (!Array.isArray(landmarks.hands)) {
    return res.status(400).json({ message: "Landmarks.hands must be an array." });
  }

  next();
};