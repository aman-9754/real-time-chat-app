import { Router } from "express";

import {
  singup,
  login,
  checkAuth,
  updateProfile,
} from "../controllers/user.controller.js";

import { protectRoute } from "../middlewares/auth.middleware.js"; // this is verifyJWT function

const router = Router();

router.post("/signup", singup);
router.post("/login", login);

router.put("/update-profile", protectRoute, updateProfile);
router.get("/check", protectRoute, checkAuth);

export default router;
