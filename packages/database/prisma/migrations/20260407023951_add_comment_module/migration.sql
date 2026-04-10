-- CreateTable
CREATE TABLE "CommentCampaign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "groupIds" TEXT NOT NULL,
    "keywords" TEXT,
    "postIds" TEXT,
    "commentText" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScannedPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ScannedPost_postId_key" ON "ScannedPost"("postId");
