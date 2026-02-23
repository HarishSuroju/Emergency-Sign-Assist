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

module.exports = router;
