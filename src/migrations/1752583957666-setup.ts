import { MigrationInterface, QueryRunner } from 'typeorm';

export class Setup1752583957666 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_updated_at() 
            RETURNS TRIGGER AS $$
            BEGIN
            NEW.updated_at = EXTRACT(EPOCH FROM CURRENT_TIMESTAMP)::BIGINT;
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

    await queryRunner.query(`
        DO $$
        DECLARE
            r RECORD;
            trigger_name TEXT;
        BEGIN
            FOR r IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            LOOP
            -- Add the updated_at column if it doesn't exist
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at BIGINT', r.table_name);

            -- Compose safe trigger name (avoid quoting it)
            trigger_name := 'set_updated_at_' || r.table_name;

            -- Create trigger only if it doesn't already exist
            EXECUTE 'CREATE TRIGGER ' || quote_ident(trigger_name) || '
                BEFORE UPDATE ON ' || quote_ident(r.table_name) || '
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at();';
            END LOOP;
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DROP FUNCTION IF EXISTS update_updated_at();
    `);
  }
}
