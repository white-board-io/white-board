-- Drop foreign key constraints first
ALTER TABLE "account" DROP CONSTRAINT IF EXISTS "account_user_id_user_id_fk";
ALTER TABLE "session" DROP CONSTRAINT IF EXISTS "session_user_id_user_id_fk";
ALTER TABLE "member" DROP CONSTRAINT IF EXISTS "member_user_id_user_id_fk";
ALTER TABLE "invitation" DROP CONSTRAINT IF EXISTS "invitation_inviter_id_user_id_fk";

-- Now alter the user table id column
ALTER TABLE "user" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "user" ALTER COLUMN "id" DROP DEFAULT;

-- Alter related columns in other tables
ALTER TABLE "account" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "account" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "account" ALTER COLUMN "user_id" SET DATA TYPE text;

ALTER TABLE "session" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "session" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "session" ALTER COLUMN "user_id" SET DATA TYPE text;

ALTER TABLE "member" ALTER COLUMN "user_id" SET DATA TYPE text;

ALTER TABLE "invitation" ALTER COLUMN "inviter_id" SET DATA TYPE text;

ALTER TABLE "verification" ALTER COLUMN "id" SET DATA TYPE text;
ALTER TABLE "verification" ALTER COLUMN "id" DROP DEFAULT;

-- Recreate foreign key constraints
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "member" ADD CONSTRAINT "member_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_inviter_id_user_id_fk" FOREIGN KEY ("inviter_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION;