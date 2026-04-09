-- Add profile fields to User so profile updates can change only name/image.
ALTER TABLE "User"
ADD COLUMN "name" TEXT,
ADD COLUMN "profileImageFileId" TEXT;

ALTER TABLE "User"
ADD CONSTRAINT "User_profileImageFileId_fkey"
FOREIGN KEY ("profileImageFileId") REFERENCES "File"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
