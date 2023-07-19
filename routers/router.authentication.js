const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { Router } = require('express');
const signupMiddleware = require('./middleware/middleware.authentication');
const {
  SignUpModel,
  LoginModel,
} = require('../data/models/model.authentication.js');
const logger = require('../controllers/controller.logger.js');

const router = Router();

require('dotenv').config();
dotenv.config({ path: path.join(__dirname, '..', 'configs', '.env') });

const bcryptSalt = bcrypt.genSaltSync(process.env.BCRYPT_SALT);

router.post('/sign-up', signupMiddleware, async (req, res) => {
  const { studentName, schoolName, grade, state, country, email, password } =
    req.body;

  try {
    const user = await LoginModel.findOne({ email: email });
    if (user) {
      res.status(409).json({ error: 'User already exists in the db.' });
    } else {
      const verificationId = uuidv4();
      const verificationMeta = {
        verified: false,
        verificationId: verificationId,
      };

      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

      const newUser = await SignUpModel({
        studentName,
        schoolName,
        grade,
        state,
        country,
        email,
        hashedPassword,
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
  }
});

router.post('/verify', async (req, res) => {
  const verificationId = req.query.verificationId;
  logger.info(`Verification Id : ${verificationId}`);
  try {
    const user = await SignUpModel.findOneAndUpdate(
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
        const loginUser = LoginModel({
          email: user.email,
          password: user.password,
        });
        await loginUser.save();
        res
          .status(202)
          .json({ success: 'User Verified Successfuly, now you can login.' });
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
  const user = await LoginModel.findOne({ email: email });
  const passwordMatch = bcrypt.compareSync(password, hashedPassword);
  logger.info(`User found: ${user}`);
  if (!user) {
    res.status(400).json({ error: 'Email not present in the database.' });
  }
  if (!passwordMatch) {
    res.status(400).json({ error: 'User found but password is not matching.' });
  }
  res.status(200).json({ success: 'Logged In' });
});

module.exports = router;
