import jwt from "jsonwebtoken";

// ── AUTH MIDDLEWARE ──────────────────────────────────
export const auth = (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token   = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
    req.user      = decoded;
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// ── PROTECT ADMIN ────────────────────────────────────
export const protectAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  next();
};

// ── ADMIN AUTH ───────────────────────────────────────
export const adminAuth = (req, res, next) => {
  auth(req, res, (err) => {
    if (err) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    protectAdmin(req, res, next);
  });
};

export default auth;