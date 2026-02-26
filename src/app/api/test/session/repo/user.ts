import { prisma } from "@/lib/prisma";

const USER_DAILY_SUBMITTED_SELECT = {
  dailySubmittedCount: true,
  dailySubmittedCountDate: true,
} as const;

function toUtcDayStart(value: Date): Date {
  return new Date(Date.UTC(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate(),
  ));
}

function isSameUtcDayStart(value: Date | null, utcDayStart: Date): boolean {
  return value?.getTime() === utcDayStart.getTime();
}

async function readUserDailySubmittedFields(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: USER_DAILY_SUBMITTED_SELECT,
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
}

export async function readUserDailySubmittedCount(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  const user = await readUserDailySubmittedFields(userId);
  const utcDayStart = toUtcDayStart(now);

  if (isSameUtcDayStart(user.dailySubmittedCountDate, utcDayStart)) {
    return user.dailySubmittedCount;
  }

  const reset = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      dailySubmittedCount: 0,
      dailySubmittedCountDate: utcDayStart,
    },
    select: {
      dailySubmittedCount: true,
    },
  });

  return reset.dailySubmittedCount;
}

export async function incrementUserDailySubmittedCount(
  userId: string,
  now: Date = new Date(),
): Promise<number> {
  await readUserDailySubmittedCount(userId, now);

  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      dailySubmittedCount: {
        increment: 1,
      },
    },
    select: {
      dailySubmittedCount: true,
    },
  });

  return user.dailySubmittedCount;
}
