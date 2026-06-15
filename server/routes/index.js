import { Router } from "express";
import authRoutes from "./authRoutes.js";
import searchRoutes from "./searchRoutes.js";
import sessionRoutes from "./sessionRoutes.js";
import bookmarkRoutes from "./bookmarkRoutes.js";

const router = Router();

// Mount individual domain route modules
router.use("/auth", authRoutes);
router.use("/search", searchRoutes);
router.use("/me/sessions", sessionRoutes);
router.use("/me/bookmarks", bookmarkRoutes);

export default router;
