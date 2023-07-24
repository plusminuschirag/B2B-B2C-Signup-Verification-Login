const jwt = require('jsonwebtoken');
const logger = require('../../controllers/controller.logger.js');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '..', 'configs', '.env') });

const adminJWTGenerateMiddleware = async (adminId) => {
  logger.info('Generating JWT for adminId: ', adminId);
  const jwtPayload = {
    id: adminId,
    role: 'admin',
  };

  const token = await jwt.sign(jwtPayload, process.env.JWT_SECRET_TOKEN);
  return token;
  j;
};

const adminJWTVerifyMiddleware = async (req, res, next) => {
  logger.info(JSON.stringify(req.headers));
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res
      .status(403)
      .json({ message: 'Access Denied, token missing or wrong token passed.' });
  }

  const jwtToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await jwt.verify(
      jwtToken,
      process.env.JWT_SECRET_TOKEN
    );
    const { id, role } = decodedToken;
    if (role !== 'admin') {
      res.status(403).json({ message: 'Invalid Role' });
    } else {
      req.user = decodedToken;
      next();
    }
  } catch (err) {
    res.status(401).json({ message: 'Invalid Token' });
    logger.error(`JWT decoding error: ${err.toString()}`);
  }
};

module.exports = { adminJWTGenerateMiddleware, adminJWTVerifyMiddleware };
