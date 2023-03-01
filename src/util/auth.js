const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded._id, authToken: token });
    if (!user) {
      throw new Error('Invalid token');
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Not authorized to access this resource' });
  }
};

module.exports = authMiddleware;