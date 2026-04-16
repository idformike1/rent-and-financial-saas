import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // This seed script is legacy and does not comply with the multi-tenant mandate.
    // It is preserved but deactivated to ensure build stability.
    return NextResponse.json({ 
       success: false, 
       message: 'Protocol Alert: Legacy seeder deactivated. Use /api/seed-master for Axiom 2026 initialization.' 
    })

  } catch (error: any) {
    console.error(error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
