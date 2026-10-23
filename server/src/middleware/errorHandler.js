function notFound(req, res) {
  res.status(404).json({ error: "Route not found." });
}

function errorHandler(err, req, res, _next) {
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Receipt must be 2 MB or smaller." });
  }
  if (err.message === "INVALID_RECEIPT_TYPE") {
    return res.status(400).json({ error: "Receipt must be a JPG, PNG, or WEBP image." });
  }

  console.error(err);
  return res.status(500).json({ error: "Something went wrong. Please try again." });
}

module.exports = {
  notFound,
  errorHandler,
};
