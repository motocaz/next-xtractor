import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import {
  createUserFromClerk,
  updateUserFromClerk,
  getUserByClerkId,
} from "@/lib/db/user";
import {
  createSubscriptionFromClerk,
  updateSubscriptionFromClerk,
  cancelSubscription,
  getSubscriptionByClerkId,
} from "@/lib/db/subscription";
import { createBillingHistory } from "@/lib/db/billing";
import { clerkClient } from "@clerk/nextjs/server";

interface WebhookEvent {
  type: string;
  data: {
    id?: string;
    user_id?: string;
    plan?: {
      name?: string;
    };
    status?: string;
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
    canceled_at?: number;
    invoice_id?: string;
    amount_total?: number;
    currency?: string;
    payment_status?: string;
    description?: string;
    created?: number;
  };
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "CLERK_WEBHOOK_SECRET is not configured" },
      { status: 500 },
    );
  }

  const headerPayload = await headers();
  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Error occurred -- no svix headers" },
      { status: 400 },
    );
  }

  const payload = await request.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return NextResponse.json({ error: "Error occurred" }, { status: 400 });
  }

  const eventType = evt.type;
  const eventData = evt.data;

  try {
    const client = await clerkClient();

    if (eventType === "user.created" && eventData.id) {
      const clerkUser = await client.users.getUser(eventData.id);
      const existingUser = await getUserByClerkId(clerkUser.id);

      if (!existingUser) {
        await createUserFromClerk(clerkUser);
        console.log(`User created in database: ${clerkUser.id}`);
      }
    }

    if (eventType === "user.updated" && eventData.id) {
      const clerkUser = await client.users.getUser(eventData.id);
      const existingUser = await getUserByClerkId(clerkUser.id);

      if (existingUser) {
        await updateUserFromClerk(clerkUser.id, {
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        });
        console.log(`User updated in database: ${clerkUser.id}`);
      } else {
        await createUserFromClerk(clerkUser);
        console.log(
          `User created in database (from update event): ${clerkUser.id}`,
        );
      }
    }

    if (eventType === "subscription.created") {
      const userId = eventData.user_id;
      const subscriptionId = eventData.id;

      if (!userId || !subscriptionId) {
        console.error(
          "Missing user_id or subscription id in subscription.created event",
        );
        return NextResponse.json({ received: true });
      }

      const existingSubscription =
        await getSubscriptionByClerkId(subscriptionId);
      if (existingSubscription) {
        console.log(`Subscription already exists: ${subscriptionId}`);
        return NextResponse.json({ received: true });
      }

      const user = await getUserByClerkId(userId);
      if (!user) {
        console.error(`User not found for subscription: ${userId}`);
        return NextResponse.json({ received: true });
      }

      const statusMap: Record<
        string,
        "ACTIVE" | "CANCELED" | "EXPIRED" | "PAST_DUE" | "TRIALING"
      > = {
        active: "ACTIVE",
        canceled: "CANCELED",
        expired: "EXPIRED",
        past_due: "PAST_DUE",
        trialing: "TRIALING",
      };

      const status = eventData.status
        ? statusMap[eventData.status.toLowerCase()] || "ACTIVE"
        : "ACTIVE";
      const currentPeriodStart = eventData.current_period_start
        ? new Date(eventData.current_period_start * 1000)
        : new Date();
      const currentPeriodEnd = eventData.current_period_end
        ? new Date(eventData.current_period_end * 1000)
        : new Date();

      await createSubscriptionFromClerk({
        userId: user.id,
        clerkSubscriptionId: subscriptionId,
        plan: eventData.plan?.name || "unknown",
        status,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: eventData.cancel_at_period_end || false,
        canceledAt: eventData.canceled_at
          ? new Date(eventData.canceled_at * 1000)
          : null,
      });
      console.log(`Subscription created in database: ${subscriptionId}`);
    }

    if (eventType === "subscription.updated") {
      const subscriptionId = eventData.id;

      if (!subscriptionId) {
        console.error("Missing subscription id in subscription.updated event");
        return NextResponse.json({ received: true });
      }

      const existingSubscription =
        await getSubscriptionByClerkId(subscriptionId);

      if (existingSubscription) {
        const statusMap: Record<
          string,
          "ACTIVE" | "CANCELED" | "EXPIRED" | "PAST_DUE" | "TRIALING"
        > = {
          active: "ACTIVE",
          canceled: "CANCELED",
          expired: "EXPIRED",
          past_due: "PAST_DUE",
          trialing: "TRIALING",
        };

        const status = eventData.status
          ? statusMap[eventData.status.toLowerCase()]
          : undefined;

        await updateSubscriptionFromClerk(subscriptionId, {
          plan: eventData.plan?.name,
          status,
          currentPeriodStart: eventData.current_period_start
            ? new Date(eventData.current_period_start * 1000)
            : undefined,
          currentPeriodEnd: eventData.current_period_end
            ? new Date(eventData.current_period_end * 1000)
            : undefined,
          cancelAtPeriodEnd: eventData.cancel_at_period_end,
          canceledAt: eventData.canceled_at
            ? new Date(eventData.canceled_at * 1000)
            : null,
        });
        console.log(`Subscription updated in database: ${subscriptionId}`);
      }
    }

    if (eventType === "subscription.deleted") {
      const subscriptionId = eventData.id;

      if (!subscriptionId) {
        console.error("Missing subscription id in subscription.deleted event");
        return NextResponse.json({ received: true });
      }

      await cancelSubscription(subscriptionId);
      console.log(`Subscription canceled in database: ${subscriptionId}`);
    }

    if (eventType === "checkout.session.completed") {
      const userId = eventData.user_id;
      const sessionId = eventData.id;

      if (!userId || !sessionId) {
        console.error(
          "Missing user_id or session id in checkout.session.completed event",
        );
        return NextResponse.json({ received: true });
      }

      const user = await getUserByClerkId(userId);
      if (!user) {
        console.error(`User not found for checkout session: ${userId}`);
        return NextResponse.json(
          { error: "Webhook processing failed" },
          { status: 500 },
        );
      }

      const statusMap: Record<
        string,
        "PAID" | "PENDING" | "FAILED" | "REFUNDED"
      > = {
        paid: "PAID",
        pending: "PENDING",
        failed: "FAILED",
        refunded: "REFUNDED",
      };

      const paymentStatus = eventData.payment_status
        ? statusMap[eventData.payment_status.toLowerCase()] || "PAID"
        : "PAID";
      const billingDate = eventData.created
        ? new Date(eventData.created * 1000)
        : new Date();

      await createBillingHistory({
        userId: user.id,
        clerkInvoiceId: eventData.invoice_id || null,
        amount: (eventData.amount_total || 0) / 100, // Convert from cents to dollars
        currency: eventData.currency?.toUpperCase() || "USD",
        status: paymentStatus,
        description: eventData.description || `Checkout session ${sessionId}`,
        billingDate,
      });
      console.log(`Billing history created for checkout: ${sessionId}`);
    }
  } catch (error) {
    console.error("Error processing webhook event:", error);
  }

  return NextResponse.json({ received: true });
}
