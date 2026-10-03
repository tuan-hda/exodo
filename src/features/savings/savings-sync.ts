import type { SupabaseClient } from '@supabase/supabase-js'
import { buildAutomaticSavingsPlan, roundSavingsAmount, type AutomaticSavingsPlanItem } from './savings-utils'
import type { SavingsDeposit, SavingsGoal } from './types'

export async function deleteSavingsContribution(
  supabase: SupabaseClient,
  userId: string,
  deposit: SavingsDeposit,
  goal: SavingsGoal,
) {
  const savedAmount = Math.max(0, roundSavingsAmount(goal.savedAmount - deposit.amount))
  const goalResult = await supabase
    .from('savings_goals')
    .update({ saved_amount: savedAmount })
    .eq('id', goal.id)
    .eq('user_id', userId)
  if (goalResult.error) throw goalResult.error

  const depositResult = await supabase
    .from('savings_deposits')
    .delete()
    .eq('id', deposit.id)
    .eq('goal_id', goal.id)
    .eq('user_id', userId)
  if (depositResult.error) {
    const restored = await supabase
      .from('savings_goals')
      .update({ saved_amount: goal.savedAmount })
      .eq('id', goal.id)
      .eq('user_id', userId)
    if (restored.error) throw restored.error
    throw depositResult.error
  }
  return savedAmount
}

export async function applyAutomaticSavingsPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: AutomaticSavingsPlanItem[],
  calculationMonth: string,
) {
  for (const { goal, amount, nextSavedAmount } of plan) {
    const depositResult = await supabase.from('savings_deposits').insert({
      user_id: userId,
      goal_id: goal.id,
      amount,
      occurred_at: new Date().toISOString(),
      source: 'automatic',
      month_key: calculationMonth,
      note: 'Monthly remainder',
    })
    if (depositResult.error) throw depositResult.error

    const goalResult = await supabase
      .from('savings_goals')
      .update({ saved_amount: nextSavedAmount })
      .eq('id', goal.id)
      .eq('user_id', userId)
    if (goalResult.error) throw goalResult.error
  }
  return plan.length > 0
}

export async function calculateSavingsOncePerMonth(
  supabase: SupabaseClient,
  userId: string,
  goals: SavingsGoal[],
  loadRemainder: () => Promise<number>,
  calculationMonth: string,
) {
  const state = await supabase
    .from('savings_automation_state')
    .select('last_calculated_month')
    .eq('user_id', userId)
    .maybeSingle()
  if (state.error) throw state.error
  if (state.data?.last_calculated_month === calculationMonth) return false

  const remainder = await loadRemainder()
  const plan = buildAutomaticSavingsPlan(goals, remainder)
  const changed = await applyAutomaticSavingsPlan(supabase, userId, plan, calculationMonth)
  const saved = await supabase.from('savings_automation_state').upsert({
    user_id: userId,
    last_calculated_month: calculationMonth,
  })
  if (saved.error) throw saved.error
  return changed
}
