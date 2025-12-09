import prisma from '@/lib/prisma';
import type { BillingStatus } from '../../generated/prisma/client';
import { Prisma } from '../../generated/prisma/client';

export interface BillingHistoryData {
  userId: string;
  clerkInvoiceId?: string | null;
  amount: number | Prisma.Decimal;
  currency?: string;
  status: BillingStatus;
  description?: string | null;
  billingDate: Date;
}

export const createBillingHistory = async (data: BillingHistoryData) => {
  return prisma.billingHistory.create({
    data: {
      userId: data.userId,
      clerkInvoiceId: data.clerkInvoiceId,
      amount: new Prisma.Decimal(data.amount),
      currency: data.currency || 'USD',
      status: data.status,
      description: data.description,
      billingDate: data.billingDate,
    },
  });
};

export const getUserBillingHistory = async (
  userId: string,
  limit: number = 50
) => {
  return prisma.billingHistory.findMany({
    where: { userId },
    orderBy: {
      billingDate: 'desc',
    },
    take: limit,
  });
};

export const getBillingHistoryByClerkInvoiceId = async (
  clerkInvoiceId: string
) => {
  return prisma.billingHistory.findFirst({
    where: { clerkInvoiceId },
    include: {
      user: true,
    },
  });
};

