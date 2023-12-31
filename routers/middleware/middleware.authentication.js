const validator = require('validator');
const multer = require('multer');
const logger = require('../../controllers/controller.logger.js');

const __b2cSignupValidationCheck = function (req, res) {
  const { studentName, schoolName, grade, state, country, email, password } =
    req.body;

  // Validate studentName (Real life name)
  if (!validator.isAlpha(studentName)) {
    return res.status(400).json({ error: 'Invalid student name' });
  }

  // Validate schoolName (Real life school name)
  if (!validator.matches(schoolName, /^[a-zA-Z\s]+$/)) {
    return res.status(400).json({ error: 'Invalid school name' });
  }

  if (!grade || !state || !country) {
    return res
      .status(400)
      .json({ error: "Grade, State or Country shouldn't be missing" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (
    !validator.isLength(password, { min: 8, max: 12 }) ||
    !validator.isStrongPassword(password)
  ) {
    return res.status(400).json({ error: 'Invalid password' });
  }
};

const b2cSignupMiddleware = (req, res, next) => {
  const { studentName, schoolName, grade, state, country, email, password } =
    req.body;

  if (email && password) {
    if (studentName && schoolName && grade) {
      if (state && country) {
        const check = __b2cSignupValidationCheck(req, res);
        if (check) {
          return check;
        }
        next();
      } else {
        res.status(400).json({ error: 'Geographic Details Missing' });
      }
    } else {
      res.status(400).json({ error: 'School Details Missing!' });
    }
  } else {
    res
      .status(400)
      .json({ error: 'Credentials combination : email and password Missing!' });
  }
};

const __b2bTeacherSignupValidationCheck = function (req, res) {
  const { teacherName, schoolName, grade, state, country, email, password } =
    req.body;

  // Validate teacherName (Real life name)
  if (!validator.isAlpha(teacherName)) {
    return res.status(400).json({ error: 'Invalid teacher name' });
  }

  // Validate schoolName (Real life school name)
  if (!validator.matches(schoolName, /^[a-zA-Z\s]+$/)) {
    return res.status(400).json({ error: 'Invalid school name' });
  }

  if (!grade || !state || !country) {
    return res
      .status(400)
      .json({ error: "Grade, State or Country shouldn't be missing" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (
    !validator.isLength(password, { min: 8, max: 12 }) ||
    !validator.isStrongPassword(password)
  ) {
    return res.status(400).json({ error: 'Invalid password' });
  }
};

const b2bTeacherSignupMiddleware = (req, res, next) => {
  const { teacherName, schoolName, grade, state, country, email, password } =
    req.body;
  if (email && password) {
    if (teacherName && schoolName && grade) {
      if (state && country) {
        const check = __b2bTeacherSignupValidationCheck(req, res);
        if (check) {
          return check;
        }
        next();
      } else {
        res.status(400).json({ error: 'Geographic Details Missing' });
      }
    } else {
      res.status(400).json({ error: 'School Details Missing!' });
    }
  } else {
    res
      .status(400)
      .json({ error: 'Credentials combination : email and password Missing!' });
  }
};

const b2bTeacherUploadCsv = multer({ dest: 'uploads/' });

const adminSignupMiddleware = (req, res, next) => {
  const { email, password } = req.body;
  if (email && password) {
    logger.info('admin Signup Middleware passed...');
    next();
  } else {
    logger.error(JSON.stringify(req.body));
    res
      .status(400)
      .json({ error: 'Email and Password Combination not present.' });
  }
};

module.exports = {
  b2cSignupMiddleware,
  b2bTeacherSignupMiddleware,
  b2bTeacherUploadCsv,
  adminSignupMiddleware,
};
