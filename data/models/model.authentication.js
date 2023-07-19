const mongoose = require('mongoose');

const signupSchema = mongoose.Schema({
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

const loginSchema = mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

const SignUpModel = mongoose.model('user.authentication.signup', signupSchema);
const LoginModel = mongoose.model('user.authentication.login', loginSchema);

module.exports = { SignUpModel, LoginModel };
