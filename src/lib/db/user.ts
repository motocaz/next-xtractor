import prisma from "@/lib/prisma";
import type { User as ClerkUser } from "@clerk/nextjs/server";

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export interface UpdateUserData {
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
}

export const getUserByClerkId = async (clerkId: string) => {
  return prisma.user.findUnique({
    where: { clerkId },
    include: {
      subscriptions: {
        where: {
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
        take: 1,
      },
    },
  });
};

export const createUserFromClerk = async (clerkUser: ClerkUser | null) => {
  if (!clerkUser) {
    throw new Error("Clerk user is required");
  }
  const userData: CreateUserData = {
    clerkId: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
  };

  if (!userData.email) {
    throw new Error("User email is required");
  }

  return prisma.user.create({
    data: userData,
  });
};

export const updateUserFromClerk = async (
  clerkId: string,
  data: UpdateUserData,
) => {
  return prisma.user.update({
    where: { clerkId },
    data: {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      imageUrl: data.imageUrl,
    },
  });
};

export const getUserById = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        orderBy: {
          createdAt: "desc",
        },
      },
      billingHistory: {
        orderBy: {
          billingDate: "desc",
        },
        take: 10,
      },
    },
  });
};
