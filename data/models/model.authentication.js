const mongoose = require('mongoose');

const b2cSignupSchema = mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  schoolName: { type: String, required: true },
  grade: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verificationMeta: {
    verificationId: { type: String },
    verified: { type: Boolean },
    verificationStartTimestamp: { type: Date, default: Date.now },
    verifiedTimestamp: { type: Date },
  },
});

const b2cLoginSchema = mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const b2bTeacherSignupSchema = mongoose.Schema({
  teacherId: { type: String, required: true },
  teacherName: { type: String, required: true },
  schoolName: { type: String, required: true },
  grade: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verificationMeta: {
    verificationId: { type: String },
    verified: { type: Boolean },
    verificationStartTimestamp: { type: Date, default: Date.now },
    verifiedTimestamp: { type: Date },
  },
});

const b2bTeacherLoginSchema = mongoose.Schema({
  teacherId: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const b2bTCSSchema = mongoose.Schema({
  teacherId: { type: String, required: true },
  classId: { type: String, required: true },
  studentIds: { type: Object, required: true },
});

const b2bStudentSignupSchema = mongoose.Schema({
  studentId: { type: String, required: true },
  classId: { type: String, required: true },
  studentName: { type: String, required: true },
  schoolName: { type: String, required: true },
  grade: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: { type: Date, default: Date.now },
  verificationMeta: {
    verificationId: { type: String },
    verified: { type: Boolean },
    verificationStartTimestamp: { type: Date, default: Date.now },
    verifiedTimestamp: { type: Date },
  },
});

const b2bStudentLoginSchema = mongoose.Schema({
  studentId: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const b2cSignUpModel = mongoose.model(
  'b2c.authentication.signup',
  b2cSignupSchema
);
const b2cLoginModel = mongoose.model(
  'b2c.authentication.login',
  b2cLoginSchema
);

const b2bTeacherSignupModel = mongoose.model(
  'b2b.authentication.teacher.signup',
  b2bTeacherSignupSchema
);

const b2bTeacherLoginModel = mongoose.model(
  'b2b.authentication.teacher.login',
  b2bTeacherLoginSchema
);

const b2bTeacherClassStudentModel = mongoose.model(
  'b2b.teacherClassStudent.mapping',
  b2bTCSSchema
);

const b2bStudentSignupModel = mongoose.model(
  'b2b.authentication.student.signup',
  b2bStudentSignupSchema
);

const b2bStudentLoginModel = mongoose.model(
  'b2b.authentication.student.login',
  b2bStudentLoginSchema
);

module.exports = {
  b2cSignUpModel,
  b2cLoginModel,
  b2bTeacherSignupModel,
  b2bTeacherLoginModel,
  b2bTeacherClassStudentModel,
  b2bStudentSignupModel,
  b2bStudentLoginModel,
};
