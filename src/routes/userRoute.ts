import * as express from "express";
import * as userController from "../controllers/userController";
import {
  userAuthMiddleware,
  adminAuthMiddleware,
} from "../middlewares/userMiddleware";
import * as Validation from "../utils/validation";
const UserRoutes = express.Router();

UserRoutes.get("/:id", [userAuthMiddleware], userController.getUser);
UserRoutes.post("/", Validation.validateNewUser, userController.createUser);

UserRoutes.put(
  "/:id",
  [...Validation.validateUpdateUser, userAuthMiddleware],
  userController.updateUser
);

// Admin Only Scope
UserRoutes.get("/", adminAuthMiddleware, userController.getUsers);

UserRoutes.post(
  "/:id/role",
  [...Validation.validateUpdateUserRole, adminAuthMiddleware],
  userController.updateUserRole
);

UserRoutes.delete("/:id", adminAuthMiddleware, userController.deleteUser);

export default UserRoutes;
