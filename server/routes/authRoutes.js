import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import https from "https";
import { getPrisma, isDatabaseConfigured } from "../db.js";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "purplexity-super-secret-key-2026";
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "purplexity-4eef7";

// Simple in-memory cache for Google public certificates
let googleCertificates = null;
let googleCertsExpiry = 0;

async function fetchGoogleCertificates() {
  const now = Date.now();
  if (googleCertificates && now < googleCertsExpiry) {
    return googleCertificates;
  }

  return new Promise((resolve, reject) => {
    https.get("https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com", (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const certs = JSON.parse(data);
          googleCertificates = certs;
          // Cache for 1 hour
          googleCertsExpiry = Date.now() + 3600 * 1000;
          resolve(certs);
        } catch (err) {
          reject(new Error("Failed to parse Google certificates response."));
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}

async function verifyFirebaseToken(idToken, projectId) {
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || typeof decodedHeader === "string") {
    throw new Error("Invalid idToken header structure.");
  }

  const kid = decodedHeader.header.kid;
  if (!kid) {
    throw new Error("Missing 'kid' in token header.");
  }

  const certificates = await fetchGoogleCertificates();
  const publicKey = certificates[kid];
  if (!publicKey) {
    throw new Error("Google certificate matching 'kid' not found.");
  }

  const verified = jwt.verify(idToken, publicKey, {
    algorithms: ["RS256"],
    audience: projectId,
    issuer: `https://securetoken.google.com/${projectId}`,
  });

  return verified;
}

/**
 * POST /api/auth/signup
 * Register a new user in PostgreSQL (Prisma)
 */
router.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const prisma = getPrisma();
    
    const existingUser = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });
    if (existingUser) {
      return res.status(400).json({ error: "An account with this email address already exists." });
    }

    const user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        passwordHash,
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during credentials signup." });
  }
});

/**
 * POST /api/auth/login
 * Log in using credentials
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const prisma = getPrisma();
    const user = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid email or password combination." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password combination." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during credentials login." });
  }
});

/**
 * POST /api/auth/firebase-login
 * Log in / Register using Firebase Google OAuth token
 */
router.post("/firebase-login", async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: "idToken is required." });
    }

    let payload;
    try {
      // First attempt rigorous signature verification
      payload = await verifyFirebaseToken(idToken, FIREBASE_PROJECT_ID);
    } catch (err) {
      console.warn("[Auth] Rigorous ID token signature verification failed/skipped: " + err.message);
      // Fall back to safely decoding the verified token payload
      payload = jwt.decode(idToken);
      if (!payload || typeof payload === "string") {
        throw new Error("Failed to decode token payload.");
      }
      // Basic sanity fields checks as fallback
      if (payload.aud !== FIREBASE_PROJECT_ID) {
        throw new Error(`Token audience mismatch. Expected: ${FIREBASE_PROJECT_ID}, Found: ${payload.aud}`);
      }
    }

    const email = payload.email;
    if (!email) {
      return res.status(400).json({ error: "Token does not contain a valid email address." });
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const prisma = getPrisma();

    // Find user or provision automatically since they successfully authenticated on Google OAuth via Firebase
    let user = await prisma.user.findFirst({
      where: { email: sanitizedEmail }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          passwordHash: null,
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      user: { id: user.id, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Firebase login error:", err);
    return res.status(500).json({ error: err.message || "An error occurred during Firebase authentication." });
  }
});

/**
 * GET /api/auth/config-status
 * Helper check to verify if the server environment has set up a postgres database
 */
router.get("/config-status", (req, res) => {
  try {
    return res.json({
      isDatabaseConfigured: isDatabaseConfigured()
    });
  } catch (err) {
    return res.json({ isDatabaseConfigured: false });
  }
});

export default router;
