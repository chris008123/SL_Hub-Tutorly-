const verifiedMiddleware = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      error: "Please verify your email before posting. Check your inbox for the verification link.",
      code: "EMAIL_NOT_VERIFIED"
    });
  }
  next();
};

module.exports = verifiedMiddleware;
