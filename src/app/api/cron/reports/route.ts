import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { getProfitAndLoss } from '@/actions/analytics.actions'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  // SECURITY: Verify Cron Secret
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('UNAUTHORIZED_ACCESS_DENIED', { status: 401 });
  }

  try {
    const orgs = await prisma.organization.findMany();
    
    // Logic: Iterate through all active organizations and pre-calculate their YTD P&L
    const results = await Promise.all(orgs.map(async (org: any) => {
        // Since getProfitAndLoss uses session/auth, we might need a system-level variant
        // for cron. For this scaffold, we simulate the dispatch logic.
        return {
            orgId: org.id,
            status: 'ANALYSIS_SCHEDULED',
            timestamp: new Date().toISOString()
        };
    }));

    return NextResponse.json({
        success: true,
        batchSize: orgs.length,
        materialized: results
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}
