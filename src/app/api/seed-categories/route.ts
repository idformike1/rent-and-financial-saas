import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    return NextResponse.json({ 
       success: false, 
       message: 'Protocol Alert: Legacy seeder deactivated.' 
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
