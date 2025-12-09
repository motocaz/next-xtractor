import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/db/user';
import { getUserBillingHistory } from '@/lib/db/billing';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await getUserByClerkId(userId);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 404 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const rawLimit = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const billingHistory = await getUserBillingHistory(user.id, limit);

    return NextResponse.json({
      billingHistory: billingHistory.map((item) => ({
        id: item.id,
        amount: item.amount.toString(),
        currency: item.currency,
        status: item.status,
        description: item.description,
        billingDate: item.billingDate,
        createdAt: item.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

