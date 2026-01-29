-- Restore indexes Prisma dropped in a previous migration.
-- Safe to run multiple times.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS "documents_embedding_idx"
ON "documents"
USING hnsw ("embedding" halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS "idx_documents_metadata"
ON "documents"
USING gin ("metadata");

