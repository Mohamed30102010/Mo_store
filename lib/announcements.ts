import "server-only";
import { prisma } from "@/lib/prisma";

export async function getActiveAnnouncement() {
  return prisma.announcement.findFirst({
    where: { active: true, publishedAt: { lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
}

export async function getAllAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createAnnouncement(message: string, publishedAt: Date) {
  return prisma.announcement.create({
    data: { message, publishedAt, active: true },
  });
}

export async function updateAnnouncement(
  id: string,
  data: { message?: string; publishedAt?: Date }
) {
  return prisma.announcement.update({ where: { id }, data });
}

export async function setAnnouncementActive(id: string, active: boolean) {
  return prisma.announcement.update({ where: { id }, data: { active } });
}

export async function deleteAnnouncement(id: string) {
  return prisma.announcement.delete({ where: { id } });
           }
