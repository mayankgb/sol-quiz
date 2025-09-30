-- CreateEnum
CREATE TYPE "PendingPaymentsStatus" AS ENUM ('PENDING', 'FAILED', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM ('DRAFTED', 'CREATED', 'STARTED', 'ENDED');

-- CreateEnum
CREATE TYPE "CreditStatus" AS ENUM ('NO_PRIZE', 'PENDING', 'CONFIRMED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "balance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Template" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isCampaign" BOOLEAN NOT NULL,
    "logo" TEXT,
    "title" TEXT NOT NULL,
    "PromotionalLink" TEXT,
    "tagLine" TEXT,
    "BrandName" TEXT,
    "totalParticipant" INTEGER,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Template_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT,
    "question" TEXT NOT NULL,
    "correctIndex" INTEGER NOT NULL,
    "correctPercentage" TEXT,
    "templateId" TEXT NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Options" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "Options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ParticipantRank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "quizId" TEXT NOT NULL,
    "walletAddress" TEXT,
    "signature" TEXT,
    "creditStatus" "CreditStatus" NOT NULL DEFAULT 'NO_PRIZE',
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ParticipantRank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendingPayments" (
    "id" TEXT NOT NULL,
    "quizid" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "status" "PendingPaymentsStatus" NOT NULL DEFAULT 'PENDING',
    "signature" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PendingPayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "signature" TEXT,
    "isPrizePool" BOOLEAN NOT NULL,
    "amountStatus" "PendingPaymentsStatus" NOT NULL DEFAULT 'PENDING',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizStatus" "QuizStatus" NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostTransaction" (
    "id" TEXT NOT NULL,
    "TransferAddress" TEXT NOT NULL,
    "ReciverAddress" TEXT NOT NULL,
    "Amount" INTEGER NOT NULL,
    "signature" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LostTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ParticipantRank_signature_key" ON "ParticipantRank"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "PendingPayments_signature_key" ON "PendingPayments"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "Quiz_signature_key" ON "Quiz"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "LostTransaction_signature_key" ON "LostTransaction"("signature");

-- AddForeignKey
ALTER TABLE "Template" ADD CONSTRAINT "Template_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Options" ADD CONSTRAINT "Options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ParticipantRank" ADD CONSTRAINT "ParticipantRank_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingPayments" ADD CONSTRAINT "PendingPayments_quizid_fkey" FOREIGN KEY ("quizid") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PendingPayments" ADD CONSTRAINT "PendingPayments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE CASCADE ON UPDATE CASCADE;
