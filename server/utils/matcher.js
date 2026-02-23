const NEGATION_WORDS = ["no", "not", "never", "without"];

// Shared matcher logic used by the API.
function calculateMatch(speechText, phrases) {
  const normalizedText = speechText.toLowerCase();
  const speechWords = normalizedText.split(" ");
  const hasNegation = NEGATION_WORDS.some((negWord) => speechWords.includes(negWord));

  let bestMatch = "";
  let bestScore = 0;
  const scoredPhrases = [];

  Object.keys(phrases).forEach((phrase) => {
    const phraseWords = phrase.split(" ");
    let matchedWords = 0;

    phraseWords.forEach((pWord) => {
      if (speechWords.includes(pWord)) {
        matchedWords++;
      }
    });

    const wordMatchScore = matchedWords / phraseWords.length;
    const fullMatchBonus = normalizedText.includes(phrase) ? 0.5 : 0;
    let totalScore = wordMatchScore + fullMatchBonus;

    // Keep negation penalty behavior identical to the frontend matcher.
    if (hasNegation && matchedWords > 0) {
      totalScore = totalScore * 0.1;
    }

    scoredPhrases.push({ phrase, score: totalScore });

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestMatch = phrase;
    }
  });

  const confidence = bestMatch ? Math.min(100, Math.floor(bestScore * 100)) : 0;

  const suggestions = scoredPhrases
    .filter((item) => item.phrase !== bestMatch && item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.phrase);

  return {
    bestMatch,
    confidence,
    negation: hasNegation,
    suggestions,
  };
}

module.exports = {
  calculateMatch,
};