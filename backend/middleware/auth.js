const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerk = createClerkClient({ 
  secretKey: process.env.CLERK_SECRET_KEY || '' 
});

/**
 * Middleware to verify Clerk JWT and attach userId to req
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the session token with Clerk
    const payload = await clerk.verifyToken(token);

    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token: No user ID found' });
    }

    req.userId = payload.sub;
    next();
  } catch (err) {
    console.error('❌ Auth middleware error:', err);
    return res.status(401).json({ 
      error: 'Authentication failed', 
      details: err.message,
      hint: 'Check if CLERK_SECRET_KEY is correct in backend/.env.local' 
    });
  }
}

module.exports = { requireAuth };
