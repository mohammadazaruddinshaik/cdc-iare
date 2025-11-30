const jwt = require("jsonwebtoken");

function verifyAccess(req, res, next) {
  // ✅ Support both header and cookie
  const header = req.headers.authorization || "";
  let token = header.startsWith("Bearer ") ? header.slice(7) : null;

  // If no header token, try cookies
  if (!token && req.cookies && req.cookies.webToken) {
    token = req.cookies.webToken;
  }

  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Attach payload to request for later use
    req.user = {
      id: payload.id,
      role: payload.role,
      username: payload.username,
      rollno: payload.rollno, // ✅ include rollno in token payload at login time
    };

    // ✅ Check if rollno is being passed in params, query, or body
    const incomingRollno =
      req.params.rollno || req.query.rollno || req.body.rollno;

    if (incomingRollno && incomingRollno !== String(payload.rollno)) {
      return res
        .status(403)
        .json({ error: "Access denied: roll number mismatch" });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
}

module.exports = { verifyAccess, authorize };
