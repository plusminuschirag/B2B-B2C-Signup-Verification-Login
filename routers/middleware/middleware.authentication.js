const validator = require('validator');
const multer = require('multer');

const __b2cSignupvalidationCheck = function (req, res) {
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
        const check = __b2cSignupvalidationCheck(req, res);
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

const __b2bTeacherSignupvalidationCheck = function (req, res) {
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
        const check = __b2bTeacherSignupvalidationCheck(req, res);
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

module.exports = {
  b2cSignupMiddleware,
  b2bTeacherSignupMiddleware,
  b2bTeacherUploadCsv,
};
