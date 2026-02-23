// Validates the incoming phrase payload before matching.
function validatePhrase(req, res, next) {
  const { phrase } = req.body || {};

  if (phrase === undefined || phrase === null) {
    return res.status(400).json({ message: '"phrase" is required.' });
  }

  if (typeof phrase !== "string") {
    return res.status(400).json({ message: '"phrase" must be a string.' });
  }

  if (phrase.trim().length <= 1) {
    return res.status(400).json({ message: '"phrase" length must be greater than 1.' });
  }

  return next();
}

module.exports = validatePhrase;
