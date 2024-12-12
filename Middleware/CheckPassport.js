const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
 
  if (!token) return res.status(401).json({ message: 'Access Token Required' });

  jwt.verify(token, 'your_jwt_secret_key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid Token' });
    req.user = user; // تخزين بيانات المستخدم في الطلب
    next();
  });
};

module.exports = authenticateToken;
