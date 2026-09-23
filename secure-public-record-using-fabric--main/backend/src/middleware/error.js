export function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error.name === "ValidationError") {
    return res.status(400).json({ message: error.message });
  }

  if (error.message?.includes("Only PDF, JPEG, and PNG files are allowed")) {
    return res.status(400).json({ message: error.message });
  }

  if (error.code === 11000) {
    return res.status(409).json({ message: "Duplicate record detected" });
  }

  res.status(error.status || 500).json({
    message: error.message || "Internal server error"
  });
}
