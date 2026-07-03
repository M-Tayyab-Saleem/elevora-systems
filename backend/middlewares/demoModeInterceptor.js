const { ApiResponse } = require("../utils/ApiResponse");

const demoModeInterceptor = (req, res, next) => {
  // If DEMO_MODE is true, prevent destructive actions
  if (process.env.DEMO_MODE === 'true') {
    // Only block DELETE requests to prevent destructive actions, but allow PUT/PATCH for interactive demo
    if (req.method === 'DELETE') {
      return res.status(200).json({
        success: true,
        message: "Action simulated successfully. Data deletion is disabled in Demo Mode."
      });
    }
  }
  next();
};

module.exports = demoModeInterceptor;
