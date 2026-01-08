import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { getUserByClerkId, createUserFromClerk } from "@/lib/db/user";
import { hasActiveSubscription } from "@/lib/db/subscription";
import type { Subscription } from "../../generated/prisma/client";

export interface SubscriptionAccessResult {
  hasAccess: boolean;
  subscription: Subscription | null;
  reason?: string;
}

export const checkSubscriptionAccess = async (
  userId: string,
): Promise<SubscriptionAccessResult> => {
  try {
    const { has } = await auth();
    const hasClerkPlan = has({ plan: "*" });

    let clerkSubscription = null;
    let planName: string | null = null;
    try {
      const client = await clerkClient();
      clerkSubscription =
        await client.billing.getUserBillingSubscription(userId);
      const subscriptionData = clerkSubscription as {
        plan?: { name?: string };
        planName?: string;
        subscriptionItems?: Array<{ plan?: { name?: string } }>;
      } | null;

      planName =
        subscriptionData?.subscriptionItems?.[0]?.plan?.name ||
        subscriptionData?.plan?.name ||
        subscriptionData?.planName ||
        null;
    } catch {}

    const isActive = clerkSubscription?.status === "active";
    const isFreePlan = planName?.toLowerCase() === "free";
    const hasActiveClerkSubscription = isActive && !isFreePlan;

    if (isFreePlan) {
      return {
        hasAccess: false,
        subscription: null,
        reason:
          "Free plan does not have access to tools. Please upgrade to a paid plan.",
      };
    }

    if (hasClerkPlan && planName && !isFreePlan) {
      return {
        hasAccess: true,
        subscription: null,
      };
    }

    if (hasActiveClerkSubscription) {
      return {
        hasAccess: true,
        subscription: null,
      };
    }

    let user = await getUserByClerkId(userId);

    if (!user) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          await createUserFromClerk(clerkUser);
          user = await getUserByClerkId(userId);
        }
      } catch (createError) {
        console.error("Error auto-creating user:", createError);
      }
    }

    if (!user) {
      return {
        hasAccess: false,
        subscription: null,
        reason: "User not found in database and could not be created",
      };
    }

    const hasDbSubscription = await hasActiveSubscription(user.id);
    const subscription = user.subscriptions?.[0] || null;

    if (subscription) {
      const isFreePlan = subscription.plan?.toLowerCase() === "free";

      if (isFreePlan) {
        return {
          hasAccess: false,
          subscription,
          reason:
            "Free plan does not have access to tools. Please upgrade to a paid plan.",
        };
      }

      const now = new Date();
      const periodEnd = new Date(subscription.currentPeriodEnd);

      if (periodEnd < now) {
        return {
          hasAccess: false,
          subscription,
          reason: "Subscription period has expired",
        };
      }
    }

    const hasAccess =
      hasDbSubscription &&
      subscription &&
      subscription.plan?.toLowerCase() !== "free";

    if (!hasAccess) {
      let reason: string;
      if (!subscription) {
        reason = "No active subscription found";
      } else if (subscription.plan?.toLowerCase() === "free") {
        reason =
          "Free plan does not have access to tools. Please upgrade to a paid plan.";
      } else {
        reason = `Subscription status: ${subscription.status}`;
      }

      return {
        hasAccess: false,
        subscription,
        reason,
      };
    }

    return {
      hasAccess: true,
      subscription,
    };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return {
      hasAccess: false,
      subscription: null,
      reason: "Error checking subscription status",
    };
  }
};
