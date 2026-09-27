import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'faang_100_antigravity_jwt_secret_token_secure_2026';

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

/**
 * Optional token extraction middleware.
 * If Authorization: Bearer <token> is present and valid, attaches decoded user to req.user.
 * Does not block unauthenticated requests.
 */
export function extractAuthUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // Token expired or invalid - attach error indicator for debugging but do not block
      req.authError = err.message;
    }
  }
  next();
}

/**
 * Strict authentication guard.
 * Blocks requests if req.user is not populated with a valid userId.
 */
export function requireAuth(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this feature.'
    });
  }
  next();
}
