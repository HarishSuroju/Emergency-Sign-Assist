function isFingerOpen(tip, pip) {
  return tip.y < pip.y;
}

function classifySign(landmarks) {
  if (!landmarks || !landmarks.hands || landmarks.hands.length === 0) {
    return {
      bestMatch: null,
      confidence: 0,
      negation: false,
      suggestions: [],
    };
  }

  const hand = landmarks.hands[0];
  if (!Array.isArray(hand) || hand.length < 21) {
    return {
      bestMatch: null,
      confidence: 0,
      negation: false,
      suggestions: [],
    };
  }

  const thumbTip = hand[4];
  const indexTip = hand[8];
  const indexPip = hand[6];
  const middleTip = hand[12];
  const middlePip = hand[10];
  const ringTip = hand[16];
  const ringPip = hand[14];
  const pinkyTip = hand[20];
  const pinkyPip = hand[18];

  const indexOpen = isFingerOpen(indexTip, indexPip);
  const middleOpen = isFingerOpen(middleTip, middlePip);
  const ringOpen = isFingerOpen(ringTip, ringPip);
  const pinkyOpen = isFingerOpen(pinkyTip, pinkyPip);

  // HELP → Open palm (all fingers open)
  if (indexOpen && middleOpen && ringOpen && pinkyOpen) {
    return {
      bestMatch: "help",
      confidence: 85,
      negation: false,
      suggestions: [],
    };
  }

  // FEVER → Index finger up only
  if (indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
    return {
      bestMatch: "fever",
      confidence: 75,
      negation: false,
      suggestions: [],
    };
  }

  // CHEST PAIN → Fist (all closed)
  if (!indexOpen && !middleOpen && !ringOpen && !pinkyOpen) {
    return {
      bestMatch: "chest pain",
      confidence: 80,
      negation: false,
      suggestions: [],
    };
  }

  return {
    bestMatch: null,
    confidence: 20,
    negation: false,
    suggestions: [],
  };
}

module.exports = { classifySign };
