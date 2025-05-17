import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AuthService } from "../services/auth.service";
import { AuthRepository } from "../repositories/auth.repository";
import validate from "../middleware/validate.middleware";
import {
  loginSchema,
  signupSchema,
  updateRoleSchema,
} from "../schemas/auth.schema";
import { verifyJWT } from "../middleware/jwt.middleware";

const router = Router();

const authRepository = new AuthRepository();
const authService = new AuthService(authRepository);
const authController = new AuthController(authService);

// Public routes
router.post("/auth/signup", validate(signupSchema), authController.signup);
router.post("/auth/login", validate(loginSchema), authController.login);
// router.post('/auth/user/login', validate(loginSchema), authController.loginUser);
router.post(
  "/auth/admin/create-unit-manager",
  validate(signupSchema),
  verifyJWT,
  authController.createUnitManager
);

// Protected routes
router.delete('/admin/group/:id', verifyJWT, authController.removeFromGroup);
router.get("/auth/users", verifyJWT, authController.getAllUsers); 
router.get("/auth/admin/users", verifyJWT, authController.getAllAdminCreated); 
router.get(
  "/users/unit-manager/created",
  verifyJWT,
  authController.getUnitManagerCreatedUsers
);
router.get('/admin/grouped',verifyJWT,authController.getGroupedAdmins)
router.get("/admin/allAdmin", verifyJWT, authController.getAllAdmins);
router.post('/admin/addToGroup/:id',verifyJWT,authController.addToGroupAdmin)
router.patch("/auth/users/:userId/block", authController.blockUser);
router.patch(
  "/auth/users/:userId/role",
  verifyJWT,
  validate(updateRoleSchema),
  authController.updateUserRole
);
router.get('/unit-manager/:id', verifyJWT, authController.getUnitManagerCreatedUsers);
router.delete("/auth/users/:userId", authController.deleteUser);
router.get('/users/getAllUnitManager', verifyJWT, authController.getAllUnitManagers);
router.post('/unit-manager/addToGroup/:id',verifyJWT,authController.addUnitManagerToGroup)
router.get('/users/grouped/:id', verifyJWT, authController.getGroupedUsers);
export default router;
