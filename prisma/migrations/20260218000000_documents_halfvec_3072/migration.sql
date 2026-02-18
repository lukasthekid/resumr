-- Migrate documents table from vector(768) to halfvec(3072).
-- No data to preserve, so we drop and recreate.

CREATE EXTENSION IF NOT EXISTS vector;

DROP TABLE IF EXISTS "documents";

CREATE TABLE "documents" (
    "id"         BIGSERIAL PRIMARY KEY,
    "text"       TEXT NOT NULL,
    "embedding"  halfvec(3072),
    "metadata"   JSONB NOT NULL DEFAULT '{}'::jsonb,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "documents_embedding_idx"
ON "documents"
USING hnsw ("embedding" halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX "idx_documents_metadata"
ON "documents"
USING gin ("metadata");
