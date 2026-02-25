const express = require("express");
const { calculateMatch } = require("./utils/matcher");
const validatePhrase = require("./middleware/validatePhrase");

const router = express.Router();

// Phrase catalog used for matching; keep in sync with client phrase keys.
const PHRASES = {
  "chest pain": "/signs/chest_pain.mp4",
  fever: "/signs/fever.mp4",
  help: "/signs/help.mp4",
};

// POST /api/match
router.post("/match", validatePhrase, (req, res, next) => {
  try {
    const trimmedPhrase = req.body.phrase.trim();

    const result = calculateMatch(trimmedPhrase, PHRASES);

    return res.status(200).json({
      bestMatch: result.bestMatch,
      confidence: result.confidence,
      negation: result.negation,
      suggestions: result.suggestions,
      // Frontend now receives the exact video path from backend.
      videoPath: result.bestMatch ? PHRASES[result.bestMatch] || "" : "",
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/analyze-sign", (req, res) => {
  return res.status(200).json({
    bestMatch: null,
    confidence: 0,
    negation: false,
    suggestions: [],
  });
});

// Placeholder implementation for deployment: validates payload and returns
// configurable fallback text until a real sign model is integrated.
router.post("/analyze-sign", (req, res) => {
  const { image } = req.body || {};

  if (!image || typeof image !== "string") {
    return res.status(400).json({ message: '"image" is required and must be a base64 string.' });
  }

  if (!image.startsWith("data:image/")) {
    return res.status(400).json({ message: '"image" must be a data URL image payload.' });
  }

  const detectedText = process.env.SIGN_ANALYZER_FALLBACK_TEXT || "";

  return res.status(200).json({ detectedText });
});

module.exports = router;
