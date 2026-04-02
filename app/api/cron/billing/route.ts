import { NextRequest, NextResponse } from 'next/server';
import { runMonthlyBillingCycle } from '@/actions/billing-automation.actions';

/**
 * Vercel Cron Job: Autonomous Monthly Billing Protocol
 * Frequency: Monthly (1st of each month)
 * Target: Active Leases for Non-Decommissioned Units
 */
export async function GET(req: NextRequest) {
  // 1. Authorization: Secure the hook using secret-level parity
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('UNAUTHORIZED: CRON_SECRET_MISMATCH', { status: 401 });
  }

  // 2. Execution: Core Batch Protocol
  try {
    const today = new Date().toISOString();
    const result: any = await runMonthlyBillingCycle(today);

    if (result.success) {
      return NextResponse.json({
        success: true,
        protocol: 'MONTHLY_BILLING_BATCH',
        timestamp: new Date().toISOString(),
        details: result.message
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message
      }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
