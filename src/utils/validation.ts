import { body } from "express-validator";

export const validateNewUser = [
  body("name")
    .isLength({ min:3 , max: 180 })
    .withMessage("name must be at least 180 characters long"),
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 8 characters long"),
  body("role")
    .isIn(["ADMIN", "USER"])
    .withMessage("Role must be Admin or User"),
];

export const validateUpdateUser = [
  body("name")
    .isLength({ min:3 , max: 180 })
    .withMessage("name must be at least 180 characters long"),
  body("email").isEmail().withMessage("Email must be valid"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 8 characters long"),
];

export const validateUpdateUserRole = [
  body("role")
    .isIn(["ADMIN", "USER"])
    .withMessage("Role must be Admin or User"),
];
