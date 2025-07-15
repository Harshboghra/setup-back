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
        BEGIN
        -- Loop over all tables in the public schema
        FOR r IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        LOOP
            -- Add the updated_at column if it doesn't exist
            EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at BIGINT', r.table_name);
            
            -- Create the trigger if it doesn't already exist
            EXECUTE format('
            CREATE TRIGGER set_updated_at_%I
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
            ', r.table_name, r.table_name);
        END LOOP;
        END;
        $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        DO $$
        DECLARE
        r RECORD;
        BEGIN
        -- Loop over all tables in the public schema
        FOR r IN
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        LOOP
            -- Drop the updated_at column if it exists
            EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS updated_at', r.table_name);
            
            -- Drop the trigger if it exists
            EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at_%I ON %I', r.table_name, r.table_name);
        END LOOP;
        END;
        $$;
    `);

    await queryRunner.query(`
        DROP FUNCTION IF EXISTS update_updated_at();
    `);
  }
}
