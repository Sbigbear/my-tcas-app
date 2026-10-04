-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `teacherId` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `role` ENUM('ADMIN', 'OFFICER') NOT NULL DEFAULT 'OFFICER',
    `universityId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_teacherId_key`(`teacherId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `School` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `School_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Student` (
    `id` VARCHAR(191) NOT NULL,
    `schoolId` VARCHAR(191) NULL,
    `studentCode` VARCHAR(191) NULL,
    `nationalId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `gpax` DOUBLE NULL,
    `mathGpa` DOUBLE NULL,
    `sciGpa` DOUBLE NULL,
    `engGpa` DOUBLE NULL,
    `thaiGpa` DOUBLE NULL,
    `socialGpa` DOUBLE NULL,
    `healthGpa` DOUBLE NULL,
    `artGpa` DOUBLE NULL,
    `careerGpa` DOUBLE NULL,
    `verificationStatus` ENUM('PENDING', 'VERIFIED', 'FLAGGED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Student_nationalId_key`(`nationalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TcasScore` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `tgat` DOUBLE NULL,
    `tpat1` DOUBLE NULL,
    `tpat2` DOUBLE NULL,
    `tpat3` DOUBLE NULL,
    `tpat4` DOUBLE NULL,
    `tpat5` DOUBLE NULL,
    `alevelMath1` DOUBLE NULL,
    `alevelMath2` DOUBLE NULL,
    `alevelSci` DOUBLE NULL,
    `alevelPhy` DOUBLE NULL,
    `alevelChem` DOUBLE NULL,
    `alevelBio` DOUBLE NULL,
    `alevelSoc` DOUBLE NULL,
    `alevelThai` DOUBLE NULL,
    `alevelEng` DOUBLE NULL,
    `alevelForeign` DOUBLE NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TcasScore_studentId_key`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `University` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `campus` VARCHAR(191) NOT NULL,
    `faculty` VARCHAR(191) NOT NULL,
    `department` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProgramCriteria` (
    `id` VARCHAR(191) NOT NULL,
    `universityId` VARCHAR(191) NOT NULL,
    `programName` VARCHAR(191) NOT NULL,
    `minGpax` DOUBLE NULL,
    `minMathGpa` DOUBLE NULL,
    `minSciGpa` DOUBLE NULL,
    `minEngGpa` DOUBLE NULL,
    `minThaiGpa` DOUBLE NULL,
    `minSocialGpa` DOUBLE NULL,
    `minHealthGpa` DOUBLE NULL,
    `minArtGpa` DOUBLE NULL,
    `minCareerGpa` DOUBLE NULL,
    `minTgat` DOUBLE NULL,
    `minTpat1` DOUBLE NULL,
    `minTpat2` DOUBLE NULL,
    `minTpat3` DOUBLE NULL,
    `minTpat4` DOUBLE NULL,
    `minTpat5` DOUBLE NULL,
    `minAlevelMath1` DOUBLE NULL,
    `minAlevelMath2` DOUBLE NULL,
    `minAlevelSci` DOUBLE NULL,
    `minAlevelPhy` DOUBLE NULL,
    `minAlevelChem` DOUBLE NULL,
    `minAlevelBio` DOUBLE NULL,
    `minAlevelSoc` DOUBLE NULL,
    `minAlevelThai` DOUBLE NULL,
    `minAlevelEng` DOUBLE NULL,
    `minAlevelForeign` DOUBLE NULL,
    `capacity` INTEGER NOT NULL,
    `additionals` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Application` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` VARCHAR(191) NOT NULL,
    `criteriaId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ELIGIBLE', 'INELIGIBLE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `remark` TEXT NULL,
    `evaluatedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Application_studentId_criteriaId_key`(`studentId`, `criteriaId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `studentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Student` ADD CONSTRAINT `Student_schoolId_fkey` FOREIGN KEY (`schoolId`) REFERENCES `School`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TcasScore` ADD CONSTRAINT `TcasScore_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProgramCriteria` ADD CONSTRAINT `ProgramCriteria_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Application` ADD CONSTRAINT `Application_criteriaId_fkey` FOREIGN KEY (`criteriaId`) REFERENCES `ProgramCriteria`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
