/*
  Warnings:

  - You are about to drop the column `trackingType` on the `Exercise` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[scope,normalizedName]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `normalizedName` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scope` to the `Exercise` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseSource" AS ENUM ('SYSTEM', 'CUSTOM');

-- DropIndex
DROP INDEX "Exercise_userId_name_key";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "trackingType",
ADD COLUMN     "normalizedName" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT NOT NULL,
ADD COLUMN     "source" "ExerciseSource" NOT NULL DEFAULT 'CUSTOM',
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Exercise_source_idx" ON "Exercise"("source");

-- CreateIndex
CREATE INDEX "Exercise_normalizedName_idx" ON "Exercise"("normalizedName");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_scope_normalizedName_key" ON "Exercise"("scope", "normalizedName");
