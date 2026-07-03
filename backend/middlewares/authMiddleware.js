const User = require('../models/userSchema');
const { UnauthorizedError, ForbiddenError } = require('../utils/ExpressError');
const jwt = require('jsonwebtoken');

const isLoggedIn = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(" ")[1] || req.query.token;

  if (!token) {
    return next(new UnauthorizedError("No token provided."));
  }

  try {
    let role = token;
    let userId = null;
    let email = "";

    // If it's a real JWT structure, verify it
    if (token.split('.').length === 3) {
      try {
        // Assuming JWT_SECRET is used for signing in this app
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret');
        if (decoded) {
          role = decoded.role;
          userId = decoded._id || decoded.id;
          email = decoded.email;
        }
      } catch (e) {
        // If verify fails, and we are NOT in demo mode, throw error
        if (process.env.DEMO_MODE !== 'true') {
          return next(new UnauthorizedError("Invalid or expired token."));
        }
      }
    } else if (process.env.DEMO_MODE !== 'true') {
      return next(new UnauthorizedError("Invalid token format."));
    }

    // Determine target user based on role or fall back to an admin
    let user;
    if (userId) {
      user = await User.findById(userId);
    } 
    
    // Demo mode bypass fallback
    if (!user && process.env.DEMO_MODE === 'true') {
      user = await User.findOne({ role: role || 'Super Admin' });
      if (!user) {
        user = await User.findOne({});
      }
    }

    if (!user) {
      return next(new UnauthorizedError("User not found or authentication failed."));
    }

    // Attach user to request
    req.user = {
      id: user.id,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      company: user.company,
      department: user.department,
      isTechnician: user.isTechnician,
      avatar: user.avatar
    };

    req.token = token;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return next(new UnauthorizedError("Authentication failed"));
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }

    // Normalize user role and allowed roles (remove spaces, lowercase)
    const userRole = req.user.role.replace(/\s+/g, '').toLowerCase();
    const allowedRoles = roles.map(role => role.replace(/\s+/g, '').toLowerCase());

    if (!allowedRoles.includes(userRole)) {
      return next(new ForbiddenError("You do not have permission to perform this action"));
    }
    next();
  };
};

module.exports = { isLoggedIn, restrictTo };