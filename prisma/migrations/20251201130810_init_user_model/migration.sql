/*
  Warnings:

  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Booking` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomPilgrimage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DomesticPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HajjPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InternationalTour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Knowledge` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SliderImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Testimonial` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trip` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UmrahPackage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UmrahService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhyChooseUsItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_tripId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Booking" DROP CONSTRAINT "Booking_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceImage" DROP CONSTRAINT "ServiceImage_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SliderImage" DROP CONSTRAINT "SliderImage_tourId_fkey";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- DropTable
DROP TABLE "public"."Booking";

-- DropTable
DROP TABLE "public"."CustomPilgrimage";

-- DropTable
DROP TABLE "public"."DomesticPackage";

-- DropTable
DROP TABLE "public"."HajjPackage";

-- DropTable
DROP TABLE "public"."InternationalTour";

-- DropTable
DROP TABLE "public"."Knowledge";

-- DropTable
DROP TABLE "public"."ServiceImage";

-- DropTable
DROP TABLE "public"."SliderImage";

-- DropTable
DROP TABLE "public"."Testimonial";

-- DropTable
DROP TABLE "public"."Trip";

-- DropTable
DROP TABLE "public"."UmrahPackage";

-- DropTable
DROP TABLE "public"."UmrahService";

-- DropTable
DROP TABLE "public"."Video";

-- DropTable
DROP TABLE "public"."WhyChooseUsItem";
