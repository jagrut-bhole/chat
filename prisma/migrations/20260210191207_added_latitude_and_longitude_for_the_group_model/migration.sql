-- AlterTable
ALTER TABLE "Group" ADD COLUMN     "isJoined" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastLocation" TIMESTAMP(3),
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
