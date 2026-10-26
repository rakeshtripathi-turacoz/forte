-- Convert every boolean column in the public schema to smallint (1/0).
-- The API compares flags with 1/0 (e.g. is_active = 1), matching the schema
-- produced by mysql-to-postgres.js. Databases imported by other tools may
-- have boolean columns instead, which fails with
-- "operator does not exist: boolean = integer".
--
-- Usage: psql -U <user> -d <db> -f fix-boolean-columns.sql

BEGIN;

DO $$
DECLARE
  col record;
  def text;
BEGIN
  FOR col IN
    SELECT table_name, column_name, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND data_type = 'boolean'
  LOOP
    def := CASE
      WHEN col.column_default ILIKE 'true%' THEN '1'
      WHEN col.column_default ILIKE 'false%' THEN '0'
    END;

    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I DROP DEFAULT',
                   col.table_name, col.column_name);
    EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I TYPE smallint USING %I::int',
                   col.table_name, col.column_name, col.column_name);
    IF def IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.%I ALTER COLUMN %I SET DEFAULT %s',
                     col.table_name, col.column_name, def);
    END IF;

    RAISE NOTICE 'Converted %.%', col.table_name, col.column_name;
  END LOOP;
END $$;

COMMIT;
