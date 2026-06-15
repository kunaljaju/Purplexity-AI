import { Router } from "express";
import { handleSearch } from "../controllers/searchController.js";

const router = Router();

router.post("/", handleSearch);

export default router;
