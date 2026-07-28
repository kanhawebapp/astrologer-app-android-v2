import * as Yup from 'yup';
import { ERROR_MESSAGES, REGEX } from './constants';

export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .matches(REGEX.EMAIL, ERROR_MESSAGES.INVALID_EMAIL)
    .required(ERROR_MESSAGES.REQUIRED),
  password: Yup.string()
    .min(8, ERROR_MESSAGES.PASSWORD_MIN)
    .required(ERROR_MESSAGES.REQUIRED),
});

export const phoneSchema = Yup.object().shape({
  contactNo: Yup.string()
    .matches(REGEX.PHONE, ERROR_MESSAGES.INVALID_PHONE)
    .required(ERROR_MESSAGES.REQUIRED),
});

export const otpSchema = Yup.object().shape({
  otp: Yup.string()
    .matches(/^\d{4}$/, 'OTP must be 4 digits')
    .required(ERROR_MESSAGES.REQUIRED),
});
// export const otpSchema = Yup.object().shape({
//   otp: Yup.string()
//     .matches(/^\d{4,6}$/, 'OTP must be 4 to 6 digits')
//     .required(ERROR_MESSAGES.REQUIRED),
// });

export const profileSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required(ERROR_MESSAGES.REQUIRED),
  phone: Yup.string()
    .matches(REGEX.PHONE, ERROR_MESSAGES.INVALID_PHONE)
    .optional(),
});
