'use client'

/**
 * SOVEREIGN BLOODSTREAM: WORKSPACE-AWARE DATA ABSTRACTION
 * 
 * Optimized with client-side caching to prevent redundant telemetry re-fetches
 * during rapid workspace toggling.
 */

import { useState, useEffect } from 'react'
import { getActiveWorkspaceId, getUserOrganizations } from '@/src/actions/workspace.actions'
import { getGlobalPortfolioTelemetry, getMasterLedger } from '@/actions/analytics.actions'

export type OrgType = 'PROPERTY' | 'WEALTH'

// Global Bloodstream Cache (Volatile In-Memory)
const BLOODSTREAM_CACHE: Record<string, any> = {
  telemetry: {},
  ledger: {}
}

export function useWorkspaceData() {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [orgType, setOrgType] = useState<OrgType>('PROPERTY')
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(true)

  useEffect(() => {
    async function resolveContext() {
      try {
        const [id, orgs] = await Promise.all([
          getActiveWorkspaceId(),
          getUserOrganizations()
        ])
        setWorkspaceId(id)
        
        const activeOrg = orgs.find(o => o.id === id)
        if (activeOrg?.name === 'Personal Wealth') {
          setOrgType('WEALTH')
        } else {
          setOrgType('PROPERTY')
        }
      } catch (err) {
        console.error('[BLOODSTREAM_CONTEXT_FAILURE]', err)
      } finally {
        setIsWorkspaceLoading(false)
      }
    }
    resolveContext()
  }, [])

  return {
    workspaceId,
    orgType,
    isWorkspaceLoading,
  }
}

/**
 * HOOK: useFinancialMetrics
 * Features passive hydration from cache for sub-second workspace switching.
 */
export function useFinancialMetrics() {
  const { workspaceId, isWorkspaceLoading } = useWorkspaceData()
  const [data, setData] = useState<any>(workspaceId ? BLOODSTREAM_CACHE.telemetry[workspaceId] : null)
  const [isLoading, setIsLoading] = useState(!data)

  useEffect(() => {
    if (isWorkspaceLoading || !workspaceId) return
    const activeId = workspaceId as string

    async function fetchTelemetry() {
      // Check cache first
      if (BLOODSTREAM_CACHE.telemetry[activeId]) {
        setData(BLOODSTREAM_CACHE.telemetry[activeId])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const res = await getGlobalPortfolioTelemetry()
      if (res.success) {
        BLOODSTREAM_CACHE.telemetry[activeId] = res.data
        setData(res.data)
      }
      setIsLoading(false)
    }

    fetchTelemetry()
  }, [workspaceId, isWorkspaceLoading])

  return { data, isLoading }
}

/**
 * HOOK: useTransactions
 * Domain-specific alias for ledger entries.
 */
export function useTransactions(filters: any = {}) {
  return useLedgerEntries(filters)
}

/**
 * HOOK: useLedgerEntries
 * Now with memoized filter hashing to optimize re-renders.
 */
export function useLedgerEntries(filters: any = {}) {
  const { workspaceId, isWorkspaceLoading } = useWorkspaceData()
  const filterKey = JSON.stringify(filters)
  const cacheKey = `${workspaceId}-${filterKey}`
  
  const [data, setData] = useState<any[]>(workspaceId ? (BLOODSTREAM_CACHE.ledger[cacheKey] || []) : [])
  const [isLoading, setIsLoading] = useState(!BLOODSTREAM_CACHE.ledger[cacheKey])

  useEffect(() => {
    if (isWorkspaceLoading || !workspaceId) return
    const activeId = workspaceId as string
    const cacheKey = `${activeId}-${filterKey}`

    async function fetchLedger() {
      if (BLOODSTREAM_CACHE.ledger[cacheKey]) {
        setData(BLOODSTREAM_CACHE.ledger[cacheKey])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const entries = await getMasterLedger(filters)
      BLOODSTREAM_CACHE.ledger[cacheKey] = entries
      setData(entries as any[])
      setIsLoading(false)
    }

    fetchLedger()
  }, [workspaceId, isWorkspaceLoading, filterKey])

  return { data, isLoading }
}
