-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('newPosts', 'newComments', 'newFollowers', 'reply', 'heartOnPost', 'heartOnComment', 'heartOnReply');

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('Typescript', 'Javascript', 'Rust', 'Go', 'Python', 'Cpp');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
