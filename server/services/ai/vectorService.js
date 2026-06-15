import { getPrisma } from "../../db.js";

let isVectorTableEnsured = false;

/**
 * Validates, registers pgvector extension and initializes SearchEmbedding table if it does not exist.
 * Built resiliently to avoid breaking operations if database connectivity or permissions lack vector support.
 */
export async function ensureVectorTable() {
  if (isVectorTableEnsured) return;
  const prisma = getPrisma();
  try {
    // Register the pgvector extension if not present
    await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
    
    // Create vector table mapping message id, original query, synthesized content and embedding vector
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SearchEmbedding" (
        id VARCHAR(255) PRIMARY KEY,
        "messageId" VARCHAR(255),
        "query" TEXT,
        "content" TEXT,
        "embedding" vector(768),
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    isVectorTableEnsured = true;
    console.log("[Vector Service] Database schema confirmed and pgvector 'SearchEmbedding' is active.");
  } catch (err) {
    console.warn(
      "[Vector Service] Resilient DB Warning: Could not setup pgvector extension or table. Proceeding gracefully list:",
      err.message
    );
  }
}

/**
 * Computes a dummy 768-dimensional embedding vector for the synthesized response text and indexes it in PostgreSQL.
 */
export async function vectorizeAndStoreAnswer(query, answer, messageId) {
  try {
    console.log("[Vector Service] Generating 768-dimensional dummy vector...");
    
    const embeddingValues = Array(768).fill(0);
    
    await ensureVectorTable();
    const prisma = getPrisma();
    
    const vectorStr = `[${embeddingValues.join(",")}]`;
    const embeddingRecordId = `embed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SearchEmbedding" (id, "messageId", "query", "content", "embedding") VALUES ($1, $2, $3, $4, $5::vector)`,
      embeddingRecordId,
      messageId,
      query,
      answer,
      vectorStr
    );
    
    console.log(
      `[Vector Service] Successfully serialized 768-dimensional response dummy vector. DB Record identifier: ${embeddingRecordId}`
    );
  } catch (vectorErr) {
    console.warn(
      "[Vector Service] Skipping DB vector storage gracefully to preserve request continuity:",
      vectorErr.message
    );
  }
}
