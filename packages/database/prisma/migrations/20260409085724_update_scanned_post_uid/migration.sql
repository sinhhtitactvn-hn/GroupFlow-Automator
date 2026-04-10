/*
  Warnings:

  - Added the required column `uid` to the `ScannedPost` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ScannedPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_ScannedPost" ("campaignId", "createdAt", "id", "postId") SELECT "campaignId", "createdAt", "id", "postId" FROM "ScannedPost";
DROP TABLE "ScannedPost";
ALTER TABLE "new_ScannedPost" RENAME TO "ScannedPost";
CREATE UNIQUE INDEX "ScannedPost_postId_uid_key" ON "ScannedPost"("postId", "uid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
