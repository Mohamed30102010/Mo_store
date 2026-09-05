"use server";

import { getActiveAnnouncement } from "@/lib/announcements";

export async function getActiveAnnouncementAction() {
  const a = await getActiveAnnouncement();
  if (!a) return null;
  return { message: a.message, publishedAt: a.publishedAt.toISOString() };
}
