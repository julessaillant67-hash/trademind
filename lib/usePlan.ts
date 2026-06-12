import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePlan() {
  const [plan, setPlan] = useState<'free' | 'starter' | 'pro' | 'elite'>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getPlan() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

      if (data?.plan) setPlan(data.plan as any)
      setLoading(false)
    }
    getPlan()
  }, [])

  const canAccess = {
    journal: true,
    dashboard: true,
    analyse: plan !== 'free',
    rapport: plan !== 'free',
    calendrier: plan !== 'free',
    marches: plan !== 'free',
    calendrierEco: plan === 'pro' || plan === 'elite',
    chatbot: plan === 'pro' || plan === 'elite',
    import: plan === 'starter' || plan === 'pro' || plan === 'elite',
  }

  return { plan, loading, canAccess }
}