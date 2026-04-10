-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Campaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "groupIds" TEXT NOT NULL,
    "mediaPaths" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "accountCount" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_Campaign" ("content", "createdAt", "groupIds", "id", "mediaPaths", "scheduledAt", "status", "updatedAt") SELECT "content", "createdAt", "groupIds", "id", "mediaPaths", "scheduledAt", "status", "updatedAt" FROM "Campaign";
DROP TABLE "Campaign";
ALTER TABLE "new_Campaign" RENAME TO "Campaign";
CREATE TABLE "new_CommentCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupIds" TEXT NOT NULL,
    "keywords" TEXT,
    "postIds" TEXT,
    "commentText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountCount" INTEGER NOT NULL DEFAULT 1
);
INSERT INTO "new_CommentCampaign" ("commentText", "createdAt", "groupIds", "id", "keywords", "postIds", "status") SELECT "commentText", "createdAt", "groupIds", "id", "keywords", "postIds", "status" FROM "CommentCampaign";
DROP TABLE "CommentCampaign";
ALTER TABLE "new_CommentCampaign" RENAME TO "CommentCampaign";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
