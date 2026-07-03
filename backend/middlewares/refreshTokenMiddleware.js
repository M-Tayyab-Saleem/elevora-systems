const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");
const { UnauthorizedError } = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const BlacklistedToken = require("../models/BlacklistedTokenSchema");

const refreshTokenMiddleware = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") && authHeader.split(" ")[1];

  if (!token) return next();

  const isBlacklisted = await BlacklistedToken.findOne({ token });
  if (isBlacklisted) {
    return next(new UnauthorizedError("Access token is revoked"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    req.token = token;
    return next();
  } catch (err) {
    if (err.name !== "TokenExpiredError") {
      return next(new UnauthorizedError("Invalid token"));
    }

    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return next(new UnauthorizedError("Session expired, please login again"));
    }

    const isRefreshBlacklisted = await BlacklistedToken.findOne({ token: refreshToken });
    if (isRefreshBlacklisted) {
      return next(new UnauthorizedError("Session revoked, please login again"));
    }

    try {
      const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Enhanced logging for debugging
      console.log("Decoded refresh token:", { 
        id: decodedRefresh.id, 
        exp: new Date(decodedRefresh.exp * 1000) 
      });
      
      // First, find user by ID only to check if user exists
      const userExists = await User.findById(decodedRefresh.id);
      if (!userExists) {

        return next(new UnauthorizedError("User not found, please login again"));
      }

      // Then check if refresh token matches
      if (userExists.refreshToken !== refreshToken) {



        return next(new UnauthorizedError("Session invalid, please login again"));
      }

      const user = userExists; // We already have the user

      // Standardized token payload
      const newToken = jwt.sign(
        { id: user._id, email: user.email, role: user.role, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      const newRefresh = jwt.sign(
        { id: user._id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      // Update user with new refresh token
      user.refreshToken = newRefresh;
      await user.save();

      // Set new refresh token cookie
      res.cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      req.user = { 
        id: user._id, 
        email: user.email,
        role: user.role,
        name: user.name
      };
      req.token = newToken;


      return next();
    } catch (refreshError) {
      console.error("Refresh token error:", refreshError.message);
      return next(new UnauthorizedError("Session invalid, please login again"));
    }
  }
});

module.exports = refreshTokenMiddleware;