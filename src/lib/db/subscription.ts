import prisma from "@/lib/prisma";
import type { SubscriptionStatus } from "../../generated/prisma/client";

export interface SubscriptionData {
  userId: string;
  clerkSubscriptionId: string;
  plan: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}

export interface UpdateSubscriptionData {
  plan?: string;
  status?: SubscriptionStatus;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: Date | null;
}

export const getUserSubscription = async (userId: string) => {
  return prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "TRIALING"],
      },
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const createSubscriptionFromClerk = async (data: SubscriptionData) => {
  return prisma.subscription.create({
    data: {
      userId: data.userId,
      clerkSubscriptionId: data.clerkSubscriptionId,
      plan: data.plan,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      canceledAt: data.canceledAt,
    },
  });
};

export const updateSubscriptionFromClerk = async (
  clerkSubscriptionId: string,
  data: UpdateSubscriptionData,
) => {
  return prisma.subscription.update({
    where: { clerkSubscriptionId },
    data: {
      plan: data.plan,
      status: data.status,
      currentPeriodStart: data.currentPeriodStart,
      currentPeriodEnd: data.currentPeriodEnd,
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      canceledAt: data.canceledAt,
    },
  });
};

export const cancelSubscription = async (clerkSubscriptionId: string) => {
  return prisma.subscription.update({
    where: { clerkSubscriptionId },
    data: {
      status: "CANCELED",
      canceledAt: new Date(),
    },
  });
};

export const getSubscriptionByClerkId = async (clerkSubscriptionId: string) => {
  return prisma.subscription.findUnique({
    where: { clerkSubscriptionId },
    include: {
      user: true,
    },
  });
};

export const hasActiveSubscription = async (
  userId: string,
): Promise<boolean> => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: {
        in: ["ACTIVE", "TRIALING"],
      },
      currentPeriodEnd: {
        gte: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return !!subscription;
};
