import { NextRequest, NextResponse } from 'next/server';
import { generateRentAccrual } from '@/src/services/billing.services';
import { prisma } from '@/src/lib/prisma'; // Base client to get all leases across orgs

/**
 * Vercel Cron Job: Autonomous Monthly Accrual Protocol
 * Frequency: Monthly (1st of each month)
 * Target: Active Leases for Non-Decommissioned Units
 */
export async function GET(req: NextRequest) {
  // 1. Authorization: Secure the hook using secret-level parity
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Optional: Allow dev mode bypass for testing
    if (process.env.NODE_ENV !== 'development') {
      return new NextResponse('UNAUTHORIZED: CRON_SECRET_MISMATCH', { status: 401 });
    }
  }

  // 2. Execution: Core Batch Protocol for Accruals
  try {
    const now = new Date();
    
    // Fetch active leases system-wide to generate accruals
    const activeLeases = await prisma.lease.findMany({
      where: {
        isActive: true,
        unit: {
          maintenanceStatus: { not: 'DECOMMISSIONED' }
        }
      },
      include: {
        unit: true
      }
    });

    const results = [];
    for (const lease of activeLeases) {
      try {
        // Run sovereign zero-sum transaction per organization context
        const tx = await generateRentAccrual(lease.id, now, lease.organizationId);
        results.push({ leaseId: lease.id, status: 'success', transactionId: tx.id });
      } catch (error: any) {
        results.push({ leaseId: lease.id, status: 'error', message: error.message });
      }
    }

    return NextResponse.json({
      success: true,
      protocol: 'MONTHLY_ACCRUAL_BATCH',
      timestamp: now.toISOString(),
      processed: activeLeases.length,
      details: results
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
}
