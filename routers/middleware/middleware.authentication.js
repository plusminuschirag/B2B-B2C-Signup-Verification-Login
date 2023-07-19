const validator = require('validator');

const validationCheck = function (req, res) {
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

const middleware = (req, res, next) => {
  const { studentName, schoolName, grade, state, country, email, password } =
    req.body;

  if (email && password) {
    if (studentName && schoolName && grade) {
      if (state && country) {
        const check = validationCheck(req, res);
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

module.exports = middleware;
