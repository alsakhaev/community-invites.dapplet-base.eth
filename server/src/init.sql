-- DROP TABLE contexts;
-- DROP TABLE context_variants;

CREATE TABLE contexts (
  id VARCHAR(64) PRIMARY KEY,
  views INTEGER NOT NULL
);

CREATE TABLE context_variants (
  id VARCHAR(64) PRIMARY KEY,
  context_id VARCHAR(64) NOT NULL,
  json text NOT NULL,
  views INTEGER NOT NULL
);