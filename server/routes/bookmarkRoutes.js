import { Router } from "express";
import { getUserBookmarks, upsertUserBookmark, deleteUserBookmark } from "../controllers/bookmarkController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = Router();

// Secure bookmark endpoints
router.use(authenticateUser);

router.get("/", getUserBookmarks);
router.post("/", upsertUserBookmark);
router.delete("/:id", deleteUserBookmark);

export default router;
