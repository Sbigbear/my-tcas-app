/*
  Warnings:

  - You are about to drop the column `password` on the `student` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[teacherId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `programcriteria` ADD COLUMN `minAlevelMath1` DOUBLE NULL,
    ADD COLUMN `minAlevelSci` DOUBLE NULL;

-- AlterTable
ALTER TABLE `student` DROP COLUMN `password`;

-- AlterTable
ALTER TABLE `university` ADD COLUMN `department` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `teacherId` VARCHAR(191) NULL,
    ADD COLUMN `universityId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_teacherId_key` ON `User`(`teacherId`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
