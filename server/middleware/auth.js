import jwt from "jsonwebtoken";
import { getPrisma } from "../db.js";

const JWT_SECRET = process.env.JWT_SECRET || "purplexity-super-secret-key-2026";

/**
 * Production-ready JWT authentication middleware for PostgreSQL via Prisma.
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing or invalid authorization token." });
    }

    const token = authHeader.split(" ")[1];

    try {
      // Decode and verify target user token
      const decodedUser = jwt.verify(token, JWT_SECRET);
      if (!decodedUser || !decodedUser.id) {
        return res.status(401).json({ error: "Invalid or expired authentication token." });
      }

      // Verify that user exists in database
      const prisma = getPrisma();
      const userRecord = await prisma.user.findUnique({
        where: { id: decodedUser.id },
      });

      if (!userRecord) {
        return res.status(401).json({ error: "User account not found on server." });
      }

      req.user = userRecord;
      return next();
    } catch (jwtErr) {
      return res.status(401).json({ error: "Invalid or expired authentication token." });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message || "Authentication failed on the server." });
  }
}
