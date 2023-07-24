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
      const teacherId = uuidv4();
      const newTeacher = await b2bTeacherSignupModel({
        teacherId,
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
          teacherId: teacher.teacherId,
          email: teacher.email,
          password: teacher.password,
        });
        await loginTeacher.save();
        res.status(202).json({
          success: 'Teacher Verified Successfully, now you can login.',
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
    const { teacherId } = req.body;

    const csvData = await getDataFromCsv(csvPath);
    const teacher = await b2bTeacherSignupModel.findOne({
      teacherId: teacherId,
    });
    const classId = uuidv4();

    const teacherClassStudentDocs = {
      teacherId: teacherId,
      classId: classId,
      studentIds: [],
    };
    const studentUser = [];
    csvData.forEach((dataPoint) => {
      const studentId = uuidv4();

      teacherClassStudentDocs.studentIds.push({
        studentId: studentId,
        studentName: dataPoint['Student Name'],
      });

      const verificationId = uuidv4();
      const verificationMeta = {
        verified: false,
        verificationId: verificationId,
      };
      studentUser.push({
        studentId: studentId,
        classId: classId,
        studentName: dataPoint['Student Name'],
        schoolName: teacher.schoolName,
        grade: teacher.grade,
        state: teacher.state,
        country: teacher.country,
        email: dataPoint['Student Email'],
        password: studentId,
        verificationMeta: verificationMeta,
      });
    });

    logger.info('Manipulation Finished..');

    try {
      const teacherClassStudent = await b2bTeacherClassStudentModel(
        teacherClassStudentDocs
      );
      await teacherClassStudent.save();
    } catch (error) {
      logger.error(
        `Error Found while creating teacher-class-student mapping. ${error.stack.toString()}`
      );
    }

    const studentInsert = await b2bStudentSignupModel.insertMany(studentUser);
    res.status(201).json({
      success: 'Uploaded and sent.',
      verificationIds: teacherClassStudentDocs.studentIds,
    });
  }
);

// router.post('/student-signup', async (req, res) => {

// });

router.post('/student-verify', async (req, res) => {
  const verificationId = req.query.verificationId;
  logger.info(`Student Verification Id : ${verificationId}`);
  try {
    const student = await b2bStudentSignupModel.findOneAndUpdate(
      {
        'verificationMeta.verificationId': verificationId,
      },
      {
        'verificationMeta.verified': true,
        'verificationMeta.verifiedTimestamp': new Date(),
      },
      { new: true }
    );
    if (student) {
      logger.info('Student entry exists for the verification Id');

      try {
        const loginStudent = b2bStudentLoginModel({
          studentId: student.studentId,
          email: student.email,
          password: student.password,
        });
        await loginStudent.save();
        res.status(202).json({
          success: 'Student Verified Successfully, now you can login.',
        });
      } catch (error) {
        logger.error(`Error while doing db operation : ${error.toString()}`);
        res.status(400).json({ error: 'Login Credentials failed...' });
      }
    } else {
      res.status(409).json({
        error: 'No Student found against the provided verification URL.',
      });
    }
  } catch (error) {
    logger.error(`Error while doing db operation : ${error.stack.toString()}`);
  }
});

router.post('/student-login', async (req, res) => {
  const { email, password } = req.body;
  const student = await b2bStudentLoginModel.findOne({ email: email });
  const passwordMatch = bcrypt.compareSync(password, student.password);
  if (!student) {
    res.status(400).json({ error: 'Email not present in the database.' });
  }
  if (!passwordMatch) {
    res
      .status(400)
      .json({ error: 'Student found but password is not matching.' });
  }
  logger.info(`Teacher found: ${teacher}`);
  res.status(200).json({ success: 'Logged In' });
});

module.exports = router;
