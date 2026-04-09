import { verifyToken } from '../utils/auth.js';
import { sendError } from '../utils/http.js';

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return sendError(res, 401, 'Access denied. No token provided.');
  }

  try {
    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };
    return next();
  } catch {
    return sendError(res, 401, 'Invalid or expired token.');
  }
};

export default authMiddleware;
