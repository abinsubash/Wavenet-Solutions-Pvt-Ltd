import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { signupSchema, loginSchema } from "../schemas/auth.schema";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../utils/jwt.util";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types/jwt.types";
import { IUser } from "../types/user.types";

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export class AuthController {
  constructor(private authService: AuthService) {}

  signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const user = await this.authService.signup(validatedData);

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await this.authService.login(validatedData);
      console.log("this is usredeedrer", user);
      const accessToken = generateAccessToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      const refreshToken = generateRefreshToken({
        id: user._id,
        email: user.email,
        role: user.role,
      });

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user,
          token: accessToken,
          refreshToken: refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users = await this.authService.getAllUsers();
      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
      });
    }
  };
  //   loginUser = async (req: Request, res: Response, next: NextFunction) => {
  //     try {
  //       const validatedData = loginSchema.parse(req.body);
  //       const user = await this.authService.loginUser(validatedData);
  //       console.log('hello434343')

  //       const token = generateAccessToken({
  //         id: user._id,
  //         email: user.email,
  //         role: user.role
  //       });
  // const refreshToken =  generateRefreshToken({
  //         id: user._id,
  //         email: user.email,
  //         role: user.role
  //       })
  //       console.log('this is refresh token',refreshToken)
  //       // Set refresh token in cookie
  //       res.cookie('refreshToken',refreshToken,{
  //         httpOnly: true,
  //         sameSite: 'strict',
  //         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  //       });

  //       res.status(200).json({
  //         success: true,
  //         message: 'Login successful',
  //         data: {
  //           user,
  //           token // This is the access token
  //         }
  //       });
  //     } catch (error) {
  //       next(error);
  //     }
  //   };

  blockUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = (await this.authService.toggleUserBlock(userId)) as IUser;

      res.status(200).json({
        success: true,
        message: `User ${
          user.isBlocked ? "blocked" : "unblocked"
        } successfully`,
        data: user,
      });
    } catch (error) {
      next(error);
    }
  };

  deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      await this.authService.deleteUser(userId);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  createUnitManager = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const currentUser = (req as AuthRequest).user;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      // Allow both admin and unit manager to create users
      if (currentUser.role !== "admin" && currentUser.role !== "unitManager") {
        res.status(403).json({
          success: false,
          message: "Only admins and unit managers can create users",
        });
        return;
      }

      // If unit manager, they can only create users with 'user' role
      if (currentUser.role === "unitManager" && validatedData.role !== "user") {
        res.status(403).json({
          success: false,
          message: "Unit managers can only create users with user role",
        });
        return;
      }

      const unitManager = await this.authService.createUnitManager({
        ...validatedData,
        createdBy: currentUser.id,
      });

      res.status(201).json({
        success: true,
        message: "User created successfully",
        data: unitManager,
      });
    } catch (error) {
      next(error);
    }
  };

  updateUserRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      const updatedUser = await this.authService.updateUserRole(userId, role);

      res.status(200).json({
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAdminCreated = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("hiihi");
      const adminId = (req as AuthRequest).user?.id;
      console.log("this is admin id", adminId);
      if (!adminId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const users = await this.authService.getAllAdminCreated(adminId);
      console.log(users);
      res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getUnitManagerCreatedUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = req.params
      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const users = await this.authService.getAllUnitManagerCreated(
        currentUser.id
      );

      res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("get admin", req.body);
      const currentUser = (req as AuthRequest).user;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const admins = await this.authService.getAllAdmins(currentUser.id);

      res.status(200).json({
        success: true,
        data: admins,
      });
    } catch (error) {
      next(error);
    }
  };

  addToGroupAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as AuthRequest).user;
      const adminToAddId = req.params.id;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const result = await this.authService.addToGroup(
        currentUser.id,
        adminToAddId
      );

      res.status(200).json({
        success: true,
        message: "Admin added to group successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getGroupedAdmins = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as AuthRequest).user;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const groupedAdmins = await this.authService.getGroupedAdmins(
        currentUser.id
      );

      res.status(200).json({
        success: true,
        data: groupedAdmins,
      });
    } catch (error) {
      next(error);
    }
  };

  removeFromGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as AuthRequest).user;
      const adminToRemoveId = req.params.id;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      await this.authService.removeFromGroup(currentUser.id, adminToRemoveId);

      res.status(200).json({
        success: true,
        message: "Admin removed from group successfully",
      });
    } catch (error) {
      next(error);
    }
  };

  getAllUnitManagers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
    const currentUser = (req as AuthRequest).user;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const unitManagers = await this.authService.getAllUnitManagers(currentUser.id);
      res.status(200).json({
        success: true,
        data: unitManagers,
      });
    } catch (error) {
      next(error);
    }
  };
  addUnitManagerToGroup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const currentUser = (req as AuthRequest).user;
      const unitManagerToAddId = req.params.id;

      if (!currentUser) {
        res.status(401).json({
          success: false,
          message: "Unauthorized access",
        });
        return;
      }

      const result = await this.authService.addUnitManagerToGroup(
        currentUser.id,
        unitManagerToAddId
      );

      res.status(200).json({
        success: true,
        message: "Unit Manager added to group successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  getGroupedUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      console.log('this is first ',userId)
      const groupedUsers = await this.authService.getGroupedUsers(userId);
      res.status(200).json({
        success: true,
        data: groupedUsers
      });
    } catch (error) {
      next(error);
    }
  }
}
