const { UnauthorizedError } = require('../utils/ExpressError');

const companyScope = (req, res, next) => {
  if (!req.user || !req.user.company) {
    return next(new UnauthorizedError('No company context available.'));
  }
  req.companyId = req.user.company;
  next();
};

module.exports = companyScope;
