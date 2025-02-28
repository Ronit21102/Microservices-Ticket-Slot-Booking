import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/user";
import { RequestValidationError } from "../errors/request-validation-error";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { BadRequestError } from "../errors/bad-request-error";
const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Email must be valid"),
    body("password")
      .isLength({ min: 4, max: 20 })
      .withMessage("Password must be between 4 and 20 characters"),
  ],
  async (req: Request, res: Response, next: any): Promise<void> => {
    // ✅ Add `next`
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new RequestValidationError(errors.array())); // ✅ Pass error to `next()`
      }

      const { email, password } = req.body;
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        console.log("Email in use");
        return next(new BadRequestError("Email in use")); // ✅ Pass error to `next()`
      }

      const user = User.build({ email, password });
      await user.save();

      res.status(201).send(user);
    } catch (error) {
      next(error); // ✅ Catch unexpected errors and pass them to errorHandler
    }
  }
);

export { router as signupRouter };
