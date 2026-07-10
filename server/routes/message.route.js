import { Router } from "express";

import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
} from "../controllers/message.controller.js";

import { protectRoute } from "../middlewares/auth.middleware.js"; // this is verifyJWT function

const router = Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.get("/:id", protectRoute, getMessages);

router.put("/mark/:id", protectRoute, markMessageAsSeen);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
