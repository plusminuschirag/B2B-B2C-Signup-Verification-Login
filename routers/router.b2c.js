const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { Router } = require('express');
const {
  b2cSignupMiddleware,
} = require('./middleware/middleware.authentication');
const {
  b2cSignUpModel,
  b2cLoginModel,
} = require('../data/models/model.authentication.js');
const logger = require('../controllers/controller.logger.js');

require('dotenv').config();
dotenv.config({ path: path.join(__dirname, '..', 'configs', '.env') });

const bcryptSalt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));

const router = Router();

router.post('/sign-up', b2cSignupMiddleware, async (req, res) => {
  const { userName, schoolName, grade, state, country, email, password } =
    req.body;

  try {
    const user = await b2cLoginModel.findOne({ email: email });
    if (user) {
      res.status(409).json({ error: 'User already exists in the db.' });
    } else {
      const verificationId = uuidv4();
      const verificationMeta = {
        verified: false,
        verificationId: verificationId,
      };

      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
      const userId = uuidv4();
      const newUser = await b2cSignUpModel({
        userId,
        userName,
        schoolName,
        grade,
        state,
        country,
        email,
        password: hashedPassword,
        verificationMeta: verificationMeta,
      });
      await newUser.save();
      logger.info(`New User Saved : ${newUser}`);
      res.status(201).json({
        success: 'User created but please verify before you move to login',
        link: `http:localhost:5000/authentication/verify/${verificationId}`,
      });
    }
  } catch (error) {
    logger.warn(
      `Error found while doing db operations: ${error.stack.toString()}`
    );
    res.status(400).json({
      error: 'Error while doing db operation',
      trace: error.stack.toString(),
    });
  }
});

router.post('/verify', async (req, res) => {
  const verificationId = req.query.verificationId;
  logger.info(`Verification Id : ${verificationId}`);
  try {
    const user = await b2cSignUpModel.findOneAndUpdate(
      {
        'verificationMeta.verificationId': verificationId,
      },
      {
        'verificationMeta.verified': true,
        'verificationMeta.verifiedTimestamp': new Date(),
      },
      { new: true }
    );
    if (user) {
      logger.info('User entry exists for the verification Id');

      try {
        const loginUser = b2cLoginModel({
          userId: user.userId,
          email: user.email,
          password: user.password,
        });
        await loginUser.save();
        res
          .status(202)
          .json({ success: 'User Verified Successfully, now you can login.' });
      } catch (error) {
        logger.error(`Error while doing db operation : ${error.toString()}`);
        res.status(400).json({ error: 'Login Credentials failed...' });
      }
    } else {
      res.status(409).json({
        error: 'No User found against the provided verification URL.',
      });
    }
  } catch (error) {
    logger.error(`Error while doing db operation : ${error.stack.toString()}`);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await b2cLoginModel.findOne({ email: email });
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!user) {
    res.status(400).json({ error: 'Email not present in the database.' });
  }
  if (!passwordMatch) {
    res.status(400).json({ error: 'User found but password is not matching.' });
  }
  logger.info(`User found: ${user}`);
  res.status(200).json({ success: 'Logged In' });
});

module.exports = router;
