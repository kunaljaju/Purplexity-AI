import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import apiRoutes from "./server/routes/index.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : (process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3000);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Mount modular API routes under /api
app.use("/api", apiRoutes);

// Setup Vite Dev Middleware in local container or static asset delivery in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware for development");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Mounted static file serving for production");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Purplexity running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
