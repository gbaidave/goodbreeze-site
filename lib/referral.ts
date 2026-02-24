/**
 * Referral system helpers.
 *
 * processReferral() — call once per new user signup.
 * Validates the referral code, prevents self-referral, inserts a referral_uses
 * row (idempotent via UNIQUE on new_user_id), grants 1 credit to the referrer,
 * and writes a referral_credit notification.
 */

import { createServiceClient } from '@/lib/supabase/service-client'

export async function processReferral(
  newUserId: string,
  referralCode: string
): Promise<void> {
  try {
    const supabase = createServiceClient()

    // 1. Look up the referral code
    const { data: codeRow } = await supabase
      .from('referral_codes')
      .select('id, user_id')
      .eq('code', referralCode)
      .single()

    if (!codeRow) return

    // 2. No self-referrals
    if (codeRow.user_id === newUserId) return

    // 3. Record referral use — idempotent (new_user_id has UNIQUE constraint)
    const { error: insertError } = await supabase
      .from('referral_uses')
      .insert({
        referral_code_id: codeRow.id,
        new_user_id: newUserId,
        reward_granted: false,
      })

    // Unique constraint violation = already attributed — skip
    if (insertError) return

    // 4. Grant 1 free report credit to the referrer
    const { error: creditError } = await supabase
      .from('credits')
      .insert({
        user_id: codeRow.user_id,
        balance: 1,
        product: null,
        expires_at: null,
        purchased_at: new Date().toISOString(),
      })

    if (creditError) {
      console.error('processReferral: failed to grant credit:', creditError)
      return
    }

    // 5. Mark reward as granted
    await supabase
      .from('referral_uses')
      .update({ reward_granted: true })
      .eq('referral_code_id', codeRow.id)
      .eq('new_user_id', newUserId)

    // 6. Notify the referrer
    await supabase.from('notifications').insert({
      user_id: codeRow.user_id,
      type: 'referral_credit',
      message: 'You earned 1 free report credit — someone signed up using your referral link!',
    })

  } catch (err) {
    console.error('processReferral error:', err)
  }
}
