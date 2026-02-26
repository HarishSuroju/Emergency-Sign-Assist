function isFist(hand) {
  // Simple rule: fingertips close to wrist
  const wrist = hand[0];

  const fingertipIndexes = [8, 12, 16, 20]; // MediaPipe tip indexes

  let foldedCount = 0;

  for (const index of fingertipIndexes) {
    const tip = hand[index];

    const distance = Math.sqrt(
      Math.pow(tip.x - wrist.x, 2) +
      Math.pow(tip.y - wrist.y, 2)
    );

    if (distance < 0.1) {
      foldedCount++;
    }
  }

  return foldedCount >= 3;
}

function isOpenPalm(hand) {
  const wrist = hand[0];
  const fingertipIndexes = [8, 12, 16, 20];

  let extendedCount = 0;

  for (const index of fingertipIndexes) {
    const tip = hand[index];

    const distance = Math.sqrt(
      Math.pow(tip.x - wrist.x, 2) +
      Math.pow(tip.y - wrist.y, 2)
    );

    if (distance > 0.2) {
      extendedCount++;
    }
  }

  return extendedCount >= 3;
}

function classifySign(landmarks) {
  if (!landmarks.hands || landmarks.hands.length === 0) {
    return {
      bestMatch: null,
      confidence: 0,
      negation: false,
      suggestions: [],
    };
  }

  const primaryHand = landmarks.hands[0];

  if (isFist(primaryHand)) {
    return {
      bestMatch: "help",
      confidence: 85,
      negation: false,
      suggestions: [],
    };
  }

  if (isOpenPalm(primaryHand)) {
    return {
      bestMatch: "stop",
      confidence: 80,
      negation: false,
      suggestions: [],
    };
  }

  return {
    bestMatch: null,
    confidence: 30,
    negation: false,
    suggestions: [],
  };
}

module.exports = { classifySign };