import type { SupabaseClient } from '@supabase/supabase-js'
import type { AutomaticSavingsPlanItem } from './savings-utils'

async function deleteDeposit(supabase: SupabaseClient, userId: string, depositId: string) {
  const result = await supabase.from('savings_deposits').delete().eq('id', depositId).eq('user_id', userId)
  if (result.error) throw result.error
}

async function syncAutomaticDeposit(
  supabase: SupabaseClient,
  userId: string,
  item: AutomaticSavingsPlanItem,
  currentMonth: string,
) {
  let changed = false
  for (const duplicate of item.duplicateDeposits) {
    await deleteDeposit(supabase, userId, duplicate.id)
    changed = true
  }

  const { primaryDeposit, amount, goal } = item
  if (primaryDeposit && amount <= 0) {
    await deleteDeposit(supabase, userId, primaryDeposit.id)
    return true
  }
  if (primaryDeposit && Math.abs(amount - primaryDeposit.amount) >= 0.01) {
    const result = await supabase
      .from('savings_deposits')
      .update({ amount })
      .eq('id', primaryDeposit.id)
      .eq('user_id', userId)
    if (result.error) throw result.error
    return true
  }
  if (!primaryDeposit && amount > 0) {
    const result = await supabase.from('savings_deposits').insert({
      user_id: userId,
      goal_id: goal.id,
      amount,
      occurred_at: new Date().toISOString(),
      source: 'automatic',
      month_key: currentMonth,
      note: 'Monthly remainder',
    })
    if (result.error) throw result.error
    return true
  }
  return changed
}

async function syncGoalAmount(supabase: SupabaseClient, userId: string, item: AutomaticSavingsPlanItem) {
  if (Math.abs(item.nextSavedAmount - item.goal.savedAmount) < 0.01) return false
  const result = await supabase
    .from('savings_goals')
    .update({ saved_amount: item.nextSavedAmount })
    .eq('id', item.goal.id)
    .eq('user_id', userId)
  if (result.error) throw result.error
  return true
}

export async function applyAutomaticSavingsPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: AutomaticSavingsPlanItem[],
  currentMonth: string,
) {
  let changed = false
  for (const item of plan) {
    changed = (await syncAutomaticDeposit(supabase, userId, item, currentMonth)) || changed
    changed = (await syncGoalAmount(supabase, userId, item)) || changed
  }
  return changed
}
