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

export const createQuizSchema = Joi.object({
  title: Joi.string().min(3).max(255).required().messages({
    "string.empty": "Title cannot be empty",
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title must be at most 255 characters long",
    "any.required": "Title is required",
  }),
  description: Joi.string().allow(null, "").max(2000).optional().messages({
    "string.max": "Description must be at most 2000 characters long",
  }),
  categoryId: Joi.string().required().messages({
    "string.empty": "Category ID cannot be empty",
    "any.required": "Category ID is required",
  }),
  difficulty: Joi.string()
    .valid("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")
    .required()
    .messages({
      "string.empty": "Difficulty cannot be empty",
      "any.required": "Difficulty is required",
      "any.only":
        "Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT",
    }),
  privacy: Joi.string()
    .valid("PUBLIC", "PRIVATE", "GROUP_ONLY")
    .default("PUBLIC")
    .messages({
      "any.only": "Privacy must be one of: PUBLIC, PRIVATE, GROUP_ONLY",
    }),
  timeLimit: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Time limit must be a number",
    "number.integer": "Time limit must be an integer",
    "number.min": "Time limit cannot be negative",
  }),
  passingScore: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow(null)
    .optional()
    .messages({
      "number.base": "Passing score must be a number",
      "number.integer": "Passing score must be an integer",
      "number.min": "Passing score cannot be negative",
      "number.max": "Passing score cannot exceed 100",
    }),
  maxAttempts: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Max attempts must be a number",
    "number.integer": "Max attempts must be an integer",
    "number.min": "Max attempts cannot be negative",
  }),
  isShuffled: Joi.boolean().default(false).optional(),
  showAnswers: Joi.boolean().default(true).optional(),
  status: Joi.string()
    .valid("DRAFT", "PUBLISHED", "ARCHIVED")
    .default("DRAFT")
    .optional(),
});

export const updateQuizSchema = Joi.object({
  title: Joi.string().min(3).max(255).optional().messages({
    "string.min": "Title must be at least 3 characters long",
    "string.max": "Title must be at most 255 characters long",
  }),
  description: Joi.string().allow(null, "").max(2000).optional().messages({
    "string.max": "Description must be at most 2000 characters long",
  }),
  categoryId: Joi.string().optional(),
  difficulty: Joi.string()
    .valid("BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT")
    .optional()
    .messages({
      "any.only":
        "Difficulty must be one of: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT",
    }),
  privacy: Joi.string()
    .valid("PUBLIC", "PRIVATE", "GROUP_ONLY")
    .optional()
    .messages({
      "any.only": "Privacy must be one of: PUBLIC, PRIVATE, GROUP_ONLY",
    }),
  timeLimit: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Time limit must be a number",
    "number.integer": "Time limit must be an integer",
    "number.min": "Time limit cannot be negative",
  }),
  passingScore: Joi.number()
    .integer()
    .min(0)
    .max(100)
    .allow(null)
    .optional()
    .messages({
      "number.base": "Passing score must be a number",
      "number.integer": "Passing score must be an integer",
      "number.min": "Passing score cannot be negative",
      "number.max": "Passing score cannot exceed 100",
    }),
  maxAttempts: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Max attempts must be a number",
    "number.integer": "Max attempts must be an integer",
    "number.min": "Max attempts cannot be negative",
  }),
  isShuffled: Joi.boolean().optional(),
  showAnswers: Joi.boolean().optional(),
  status: Joi.string()
    .valid("DRAFT", "PUBLISHED", "ARCHIVED")
    .optional()
    .messages({
      "any.only": "Status must be one of: DRAFT, PUBLISHED, ARCHIVED",
    }),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const quizTagsSchema = Joi.object({
  tagIds: Joi.array().items(Joi.string()).min(1).required().messages({
    "array.base": "Tag IDs must be an array",
    "array.min": "At least one tag ID is required",
    "any.required": "Tag IDs are required",
  }),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    "string.empty": "Category name cannot be empty",
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name must be at most 100 characters long",
    "any.required": "Category name is required",
  }),
  description: Joi.string().allow(null, "").max(1000).optional().messages({
    "string.max": "Description must be at most 1000 characters long",
  }),
  parentId: Joi.string().allow(null).optional().messages({
    "string.empty": "Parent category ID cannot be empty",
  }),
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().min(2).max(100).optional().messages({
    "string.empty": "Category name cannot be empty",
    "string.min": "Category name must be at least 2 characters long",
    "string.max": "Category name must be at most 100 characters long",
  }),
  description: Joi.string().allow(null, "").max(1000).optional().messages({
    "string.max": "Description must be at most 1000 characters long",
  }),
  parentId: Joi.string().allow(null).optional().messages({
    "string.empty": "Parent category ID cannot be empty",
  }),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const createTagSchema = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Tag name cannot be empty",
    "string.min": "Tag name must be at least 2 characters long",
    "string.max": "Tag name must be at most 50 characters long",
    "any.required": "Tag name is required",
  }),
  color: Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base":
        "Color must be a valid hex color code (e.g., #FF5733)",
    }),
});

export const updateTagSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional().messages({
    "string.empty": "Tag name cannot be empty",
    "string.min": "Tag name must be at least 2 characters long",
    "string.max": "Tag name must be at most 50 characters long",
  }),
  color: Joi.string()
    .pattern(/^#[0-9a-fA-F]{6}$/)
    .allow(null)
    .optional()
    .messages({
      "string.pattern.base":
        "Color must be a valid hex color code (e.g., #FF5733)",
    }),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const answerSchema = Joi.object({
  id: Joi.string().optional(),
  text: Joi.string().required().messages({
    "string.empty": "Answer text cannot be empty",
    "any.required": "Answer text is required",
  }),
  isCorrect: Joi.boolean().required().messages({
    "any.required": "You must specify whether the answer is correct",
  }),
  order: Joi.number().integer().min(1).optional().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 1",
  }),
});

export const createQuestionSchema = Joi.object({
  quizId: Joi.string().required().messages({
    "string.empty": "Quiz ID cannot be empty",
    "any.required": "Quiz ID is required",
  }),
  type: Joi.string()
    .valid(
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "OPEN_TEXT",
      "FILL_BLANK",
    )
    .required()
    .messages({
      "any.only":
        "Question type must be one of: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, OPEN_TEXT, FILL_BLANK",
      "any.required": "Question type is required",
    }),
  question: Joi.string().required().messages({
    "string.empty": "Question text cannot be empty",
    "any.required": "Question text is required",
  }),
  explanation: Joi.string().allow(null, "").optional(),
  points: Joi.number().integer().min(1).default(1).optional().messages({
    "number.base": "Points must be a number",
    "number.integer": "Points must be an integer",
    "number.min": "Points must be at least 1",
  }),
  timeLimit: Joi.number().integer().min(5).allow(null).optional().messages({
    "number.base": "Time limit must be a number",
    "number.integer": "Time limit must be an integer",
    "number.min": "Time limit must be at least 5 seconds",
  }),
  order: Joi.number().integer().min(1).optional().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 1",
  }),
  isRequired: Joi.boolean().default(true).optional(),
  answers: Joi.array().items(answerSchema).required().messages({
    "any.required": "Answers are required",
  }),
}).messages({
  "object.unknown": "Invalid fields provided",
});

export const updateQuestionSchema = Joi.object({
  type: Joi.string()
    .valid(
      "SINGLE_CHOICE",
      "MULTIPLE_CHOICE",
      "TRUE_FALSE",
      "OPEN_TEXT",
      "FILL_BLANK",
    )
    .optional()
    .messages({
      "any.only":
        "Question type must be one of: SINGLE_CHOICE, MULTIPLE_CHOICE, TRUE_FALSE, OPEN_TEXT, FILL_BLANK",
    }),
  question: Joi.string().optional().messages({
    "string.empty": "Question text cannot be empty",
  }),
  explanation: Joi.string().allow(null, "").optional(),
  points: Joi.number().integer().min(1).optional().messages({
    "number.base": "Points must be a number",
    "number.integer": "Points must be an integer",
    "number.min": "Points must be at least 1",
  }),
  timeLimit: Joi.number().integer().min(5).allow(null).optional().messages({
    "number.base": "Time limit must be a number",
    "number.integer": "Time limit must be an integer",
    "number.min": "Time limit must be at least 5 seconds",
  }),
  order: Joi.number().integer().min(1).optional().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order must be at least 1",
  }),
  isRequired: Joi.boolean().optional(),
  answers: Joi.array().items(answerSchema).optional(),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
    "object.unknown": "Invalid fields provided",
  });

export const reorderQuestionsSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        id: Joi.string().required(),
        order: Joi.number().integer().min(1).required(),
      }),
    )
    .min(1)
    .required()
    .messages({
      "array.base": "Questions must be an array",
      "array.min": "At least one question order must be provided",
      "any.required": "Questions are required",
    }),
}).messages({
  "object.unknown": "Invalid fields provided",
});

export const submitAnswerSchema = Joi.object({
  questionId: Joi.string().required().messages({
    "string.empty": "Question ID cannot be empty",
    "any.required": "Question ID is required",
  }),
  answerId: Joi.string().allow(null).optional(),
  answerIds: Joi.array().items(Joi.string()).allow(null).optional(),
  textAnswer: Joi.string().allow(null, "").optional(),
  timeSpent: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Time spent must be a number",
    "number.integer": "Time spent must be an integer",
    "number.min": "Time spent cannot be negative",
  }),
}).custom((value, helpers) => {
  // At least one of answerId, answerIds, or textAnswer must be provided
  if (!value.answerId && !value.answerIds?.length && !value.textAnswer) {
    return helpers.error("object.missing", {
      message:
        "At least one of answerId, answerIds, or textAnswer must be provided",
    });
  }
  return value;
});

export const updateAttemptStatusSchema = Joi.object({
  timeSpent: Joi.number().integer().min(0).allow(null).optional().messages({
    "number.base": "Time spent must be a number",
    "number.integer": "Time spent must be an integer",
    "number.min": "Time spent cannot be negative",
  }),
});

export const createAchievementSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 100 characters long",
    "any.required": "Name is required",
  }),
  description: Joi.string().min(5).max(500).required().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 5 characters long",
    "string.max": "Description must be at most 500 characters long",
    "any.required": "Description is required",
  }),
  type: Joi.string()
    .valid(
      "QUIZ_COMPLETION",
      "SCORE_MILESTONE",
      "STREAK",
      "CATEGORY_MASTER",
      "TIME_CHALLENGE",
    )
    .required()
    .messages({
      "any.only": "Type must be one of the allowed values",
      "any.required": "Type is required",
    }),
  icon: Joi.string().allow(null, "").optional(),
  points: Joi.number().integer().min(0).default(0).optional().messages({
    "number.base": "Points must be a number",
    "number.integer": "Points must be an integer",
    "number.min": "Points cannot be negative",
  }),
  requirement: Joi.object().required().messages({
    "any.required": "Requirement object is required",
  }),
  isActive: Joi.boolean().default(true).optional(),
});

export const updateAchievementSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 100 characters long",
  }),
  description: Joi.string().min(5).max(500).optional().messages({
    "string.empty": "Description cannot be empty",
    "string.min": "Description must be at least 5 characters long",
    "string.max": "Description must be at most 500 characters long",
  }),
  type: Joi.string()
    .valid(
      "QUIZ_COMPLETION",
      "SCORE_MILESTONE",
      "STREAK",
      "CATEGORY_MASTER",
      "TIME_CHALLENGE",
    )
    .optional()
    .messages({
      "any.only": "Type must be one of the allowed values",
    }),
  icon: Joi.string().allow(null, "").optional(),
  points: Joi.number().integer().min(0).optional().messages({
    "number.base": "Points must be a number",
    "number.integer": "Points must be an integer",
    "number.min": "Points cannot be negative",
  }),
  requirement: Joi.object().optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  });

export const createLeaderboardSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 100 characters long",
    "any.required": "Name is required",
  }),
  type: Joi.string()
    .valid("GLOBAL", "CATEGORY", "WEEKLY", "MONTHLY")
    .required()
    .messages({
      "any.only": "Type must be one of: GLOBAL, CATEGORY, WEEKLY, MONTHLY",
      "any.required": "Type is required",
    }),
  period: Joi.string().allow(null, "").optional(),
  categoryId: Joi.string().allow(null).optional(),
  isActive: Joi.boolean().default(true).optional(),
}).custom((value, helpers) => {
  if (value.type === "CATEGORY" && !value.categoryId) {
    return helpers.error("any.custom", {
      message: "Category ID is required for category leaderboards",
    });
  }
  return value;
});

export const updateLeaderboardSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional().messages({
    "string.empty": "Name cannot be empty",
    "string.min": "Name must be at least 3 characters long",
    "string.max": "Name must be at most 100 characters long",
  }),
  type: Joi.string()
    .valid("GLOBAL", "CATEGORY", "WEEKLY", "MONTHLY")
    .optional()
    .messages({
      "any.only": "Type must be one of: GLOBAL, CATEGORY, WEEKLY, MONTHLY",
    }),
  period: Joi.string().allow(null, "").optional(),
  categoryId: Joi.string().allow(null).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field must be provided for update",
  })
  .custom((value, helpers) => {
    // If type is CATEGORY, categoryId is required
    if (value.type === "CATEGORY" && value.categoryId === undefined) {
      // Check if categoryId is explicitly set to null
      if (value.categoryId === null) {
        return helpers.error("any.custom", {
          message: "Category ID is required for category leaderboards",
        });
      }
    }
    return value;
  });
