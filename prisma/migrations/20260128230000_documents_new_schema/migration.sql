-- Align migration history with the new documents table schema (manual change).
-- Table was dropped and recreated with: bigserial id, text, vector(768), metadata.

CREATE EXTENSION IF NOT EXISTS vector;

DROP TABLE IF EXISTS "documents";

CREATE TABLE "documents" (
    "id" BIGSERIAL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "embedding" vector(768),
    "metadata" JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "documents_embedding_idx"
ON "documents"
USING hnsw ("embedding" vector_cosine_ops);

CREATE INDEX "idx_documents_metadata"
ON "documents"
USING gin ("metadata");
