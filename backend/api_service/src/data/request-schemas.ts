import Joi from "joi";

const user = {
  username: Joi.string().min(1).max(255).required().trim().messages({
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 1 character long",
    "string.max": "Username must be at most 255 characters long",
    "any.required": "Username is required",
  }),
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
  firstName: Joi.string()
    .allow(null)
    .optional()
    .max(255)
    .empty("")
    .trim()
    .messages({
      "string.max": "First name must be at most 255 characters long",
    }),
  lastName: Joi.string()
    .allow(null)
    .optional()
    .max(255)
    .empty("")
    .trim()
    .messages({
      "string.max": "Last name must be at most 255 characters long",
    }),
  avatar: Joi.string().uri().allow(null).optional().messages({
    "string.uri": "Avatar must be a valid URI",
  }),
  totalScore: Joi.number().integer().min(0).optional().default(0).messages({
    "number.base": "Total score must be a number",
    "number.integer": "Total score must be an integer",
    "number.min": "Total score must be at least 0",
  }),
};

export const createUserSchema = Joi.object(user);
export const updateUserSchema = Joi.object({
  username: Joi.string().min(1).max(255).optional().trim().messages({
    "string.empty": "Username cannot be empty",
    "string.min": "Username must be at least 1 character long",
    "string.max": "Username must be at most 255 characters long",
  }),
  email: Joi.string().email().optional().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
  }),
  firstName: user.firstName,
  lastName: user.lastName,
  avatar: user.avatar,
  totalScore: user.totalScore,
  password: Joi.string().min(8).optional().messages({
    "string.min": "Password must be at least 8 characters long",
    "string.empty": "Password cannot be empty",
  }),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const createLoginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Email must be a valid email address",
    "string.empty": "Email cannot be empty",
    "any.required": "Email is required",
  }),
  password: Joi.string().min(6).required().messages({
    "string.min": "Password must be at least 6 characters long",
    "string.empty": "Password cannot be empty",
    "any.required": "Password is required",
  }),
}).messages({
  "object.unknown": "Invalid fields provided",
  "object.base": "Invalid login request format",
});

export const createRefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Refresh token cannot be empty",
    "any.required": "Refresh token is required",
  }),
}).messages({
  "object.unknown": "Invalid fields provided",
  "object.base": "Invalid refresh token request format",
});
