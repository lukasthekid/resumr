-- Recreate indexes for the `documents` table.

-- Ensure pgvector is available for HNSW / halfvec ops
CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW index for fast similarity search (embedding)
CREATE INDEX IF NOT EXISTS "documents_embedding_idx"
ON "documents"
USING hnsw ("embedding" halfvec_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Supporting index for JSONB metadata queries
CREATE INDEX IF NOT EXISTS "idx_documents_metadata"
ON "documents"
USING gin ("metadata");

