const { v4: uuidv4 } = require('uuid');

const path = require('path');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const { Router } = require('express');
const {
  b2bTeacherSignupMiddleware,
  b2bTeacherUploadCsv,
} = require('./middleware/middleware.authentication');
const {
  b2bTeacherSignupModel,
  b2bTeacherLoginModel,
  b2bTeacherClassStudentModel,
  b2bStudentSignupModel,
  b2bStudentLoginModel,
} = require('../data/models/model.authentication.js');
const { getDataFromCsv } = require('../controllers/controller.csv');
const logger = require('../controllers/controller.logger.js');

const router = Router();

require('dotenv').config();
dotenv.config({ path: path.join(__dirname, '..', 'configs', '.env') });

const bcryptSalt = bcrypt.genSaltSync(parseInt(process.env.BCRYPT_SALT));

router.post('/teacher-signup', b2bTeacherSignupMiddleware, async (req, res) => {
  const { teacherName, schoolName, grade, state, country, email, password } =
    req.body;
  try {
    const teacher = await b2bTeacherLoginModel.findOne({ email: email });
    if (teacher) {
      res.status(409).json({ error: 'Teacher already exists in the db.' });
    } else {
      const verificationId = uuidv4();
      const verificationMeta = {
        verified: false,
        verificationId: verificationId,
      };

      const hashedPassword = bcrypt.hashSync(password, bcryptSalt);

      const newTeacher = await b2bTeacherSignupModel({
        teacherName,
        schoolName,
        grade,
        state,
        country,
        email,
        password: hashedPassword,
        verificationMeta: verificationMeta,
      });
      await newTeacher.save();
      logger.info(`New Teacher Saved : ${newTeacher}`);
      res.status(201).json({
        success: 'Teacher created but please verify before you move to login',
        link: `http:localhost:5000/authentication/verify/${verificationId}`,
      });
    }
  } catch (error) {
    logger.warn(
      `Error found while doing db operations: ${error.stack.toString()}`
    );
  }
});

router.post('/teacher-verify', async (req, res) => {
  const verificationId = req.query.verificationId;
  logger.info(`Verification Id : ${verificationId}`);
  try {
    const teacher = await b2bTeacherSignupModel.findOneAndUpdate(
      {
        'verificationMeta.verificationId': verificationId,
      },
      {
        'verificationMeta.verified': true,
        'verificationMeta.verifiedTimestamp': new Date(),
      },
      { new: true }
    );
    if (teacher) {
      logger.info('Teacher entry exists for the verification Id');

      try {
        const loginTeacher = b2bTeacherLoginModel({
          email: teacher.email,
          password: teacher.password,
        });
        await loginTeacher.save();
        res.status(202).json({
          success: 'Teacher Verified Successfuly, now you can login.',
        });
      } catch (error) {
        logger.error(`Error while doing db operation : ${error.toString()}`);
        res.status(400).json({ error: 'Login Credentials failed...' });
      }
    } else {
      res.status(409).json({
        error: 'No Teacher found against the provided verification URL.',
      });
    }
  } catch (error) {
    logger.error(`Error while doing db operation : ${error.stack.toString()}`);
  }
});

router.post('/teacher-login', async (req, res) => {
  const { email, password } = req.body;
  const teacher = await b2bTeacherLoginModel.findOne({ email: email });
  const passwordMatch = bcrypt.compareSync(password, teacher.password);
  if (!teacher) {
    res.status(400).json({ error: 'Email not present in the database.' });
  }
  if (!passwordMatch) {
    res
      .status(400)
      .json({ error: 'Teacher found but password is not matching.' });
  }
  logger.info(`Teacher found: ${teacher}`);
  res.status(200).json({ success: 'Logged In' });
});

router.post(
  '/upload-students',
  b2bTeacherUploadCsv.single('csvFile'),
  async (req, res) => {
    const csvPath = req.file.path;
    const csvData = await getDataFromCsv(csvPath);
  }
);

router.post('/student-signup', async (req, res) => {});

router.post('/student-verification', async (req, res) => {});

router.post('/student-login', async (req, res) => {});

module.exports = router;
