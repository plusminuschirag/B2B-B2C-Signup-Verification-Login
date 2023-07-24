const { v4: uuidv4 } = require('uuid');
const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { Router } = require('express');
const {
  adminSignupMiddleware,
} = require('./middleware/middleware.authentication');
const {
  adminJWTGenerateMiddleware,
  adminJWTVerifyMiddleware,
} = require('./middleware/middleware.authorization');
const {
  adminSignupModel,
  adminLoginModel,
  b2bTeacherSignupModel,
} = require('../data/models/model.authentication.js');
const logger = require('../controllers/controller.logger.js');

require('dotenv').config();
dotenv.config({ path: path.join(__dirname, '..', 'configs', '.env') });

const bcryptSalt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));

const router = Router();

router.post('/sign-up', adminSignupMiddleware, async (req, res) => {
  logger.info(JSON.stringify(req.body));
  const { email, password } = req.body;

  try {
    const admin = await adminLoginModel.findOne({ email: email });
    if (admin) {
      a;
      res.status(409).json({ error: 'Admin already exists in the db.' });
    } else {
      const verificationId = uuidv4();
      const verificationMeta = {
        verified: false,
        verificationId: verificationId,
      };

      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
      const adminId = uuidv4();
      const newAdmin = await adminSignupModel({
        adminId,
        email,
        password: hashedPassword,
        verificationMeta: verificationMeta,
      });
      await newAdmin.save();
      logger.info(`New Admin Saved : ${newAdmin}`);
      res.status(201).json({
        success: 'Admin created but please verify before you move to login',
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
    const admin = await adminSignupModel.findOneAndUpdate(
      {
        'verificationMeta.verificationId': verificationId,
      },
      {
        'verificationMeta.verified': true,
        'verificationMeta.verifiedTimestamp': new Date(),
      },
      { new: true }
    );
    if (admin) {
      logger.info('admin entry exists for the verification Id');

      try {
        const loginAdmin = adminLoginModel({
          adminId: admin.adminId,
          email: admin.email,
          password: admin.password,
        });
        await loginAdmin.save();
        res
          .status(202)
          .json({ success: 'Admin Verified Successfully, now you can login.' });
      } catch (error) {
        logger.error(`Error while doing db operation : ${error.toString()}`);
        res.status(400).json({ error: 'Login Credentials failed...' });
      }
    } else {
      res.status(409).json({
        error: 'No Admin found against the provided verification URL.',
      });
    }
  } catch (error) {
    logger.error(`Error while doing db operation : ${error.stack.toString()}`);
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const admin = await adminLoginModel.findOne({ email: email });
  const passwordMatch = bcrypt.compareSync(password, admin.password);

  if (!admin) {
    res.status(400).json({ error: 'Email not present in the database.' });
  }
  if (!passwordMatch) {
    res
      .status(400)
      .json({ error: 'admin found but password is not matching.' });
  }
  logger.info(`Admin found: ${admin}`);
  const jwtToken = await adminJWTGenerateMiddleware(admin.adminId);
  res.status(200).json({
    success: 'Logged In, Use JWT in following admin requests',
    jwtToken: jwtToken,
  });
});

router.get('/teachers-list', adminJWTVerifyMiddleware, async (req, res) => {
  logger.info('JWT Verified.');
  const { id, role } = req.user;
  const admin = await adminLoginModel.findOne({ adminId: id });
  console.log(admin);

  const allTeachers = await b2bTeacherSignupModel.find({});
  res.status(201).json({ records: allTeachers });
});

module.exports = router;
