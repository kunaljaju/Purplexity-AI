import { Router } from "express";
import { getUserSessions, upsertUserSession, deleteUserSession } from "../controllers/sessionController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

// Apply authenticative middleware for all session operations
router.use(authenticateUser);

router.get("/", getUserSessions);
router.post("/", upsertUserSession);
router.delete("/:id", deleteUserSession);

export default router;
