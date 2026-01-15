import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import Stripe from 'stripe';
import { generateSessionId, COUPON_TIERS } from '@/lib/usage-system';
import { redisGet, redisSet } from '@/lib/redis';

// Initialize Stripe lazily
let stripeClient: Stripe | null = null;
function getStripe(): Stripe | null {
  if (!stripeClient && process.env.STRIPE_SECRET_KEY) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Valid coupon codes (you can also create these in Stripe dashboard)
// Format: CODE -> { tier, maxRedemptions, currentRedemptions }
const VALID_COUPONS: Record<string, { tier: keyof typeof COUPON_TIERS; maxRedemptions: number }> = {
  // Complex codes - harder to guess
  'RP-BETA-X7K9M2': { tier: 'BETA_TESTER', maxRedemptions: 100 },
  'RP-EARLY-Q4W8N3': { tier: 'EARLY_SUPPORTER', maxRedemptions: 50 },
  'RP-VIP-Z6Y1P5': { tier: 'VIP', maxRedemptions: 10 },
  'RP-PROD-J3H7L9': { tier: 'PRODUCER', maxRedemptions: 25 },
  // Special codes
  'UTOPIA26!': { tier: 'UTOPIA', maxRedemptions: 50 },
  // Legacy codes (keep for backwards compatibility)
  'RHYME-BETA-2026': { tier: 'BETA_TESTER', maxRedemptions: 100 },
  'RHYME-EARLY': { tier: 'EARLY_SUPPORTER', maxRedemptions: 50 },
  'RHYME-VIP': { tier: 'VIP', maxRedemptions: 10 },
};

interface CouponRedemption {
  code: string;
  tier: string;
  credits: typeof COUPON_TIERS[keyof typeof COUPON_TIERS];
  redeemedAt: string;
  expiresAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Coupon code is required' },
        { status: 400 }
      );
    }

    const normalizedCode = code.toUpperCase().trim();

    // Check if valid coupon
    const couponConfig = VALID_COUPONS[normalizedCode];
    if (!couponConfig) {
      return NextResponse.json(
        { error: 'Invalid coupon code' },
        { status: 400 }
      );
    }

    // Get or create session
    const cookieStore = cookies();
    let sessionId = cookieStore.get('anon_session')?.value;
    if (!sessionId) {
      sessionId = generateSessionId();
    }

    // Check if user already redeemed a coupon
    const userCouponKey = `coupon:user:${sessionId}`;
    const existingCoupon = await redisGet<CouponRedemption>(userCouponKey);
    if (existingCoupon) {
      return NextResponse.json(
        { error: 'You have already redeemed a coupon', existingCoupon },
        { status: 400 }
      );
    }

    // Check coupon redemption count
    const couponCountKey = `coupon:count:${normalizedCode}`;
    const currentCount = await redisGet<number>(couponCountKey) || 0;
    if (currentCount >= couponConfig.maxRedemptions) {
      return NextResponse.json(
        { error: 'This coupon has reached its maximum redemptions' },
        { status: 400 }
      );
    }

    // Get the credits for this tier
    const tierCredits = COUPON_TIERS[couponConfig.tier];
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + tierCredits.expires_days);

    // Save the redemption
    const redemption: CouponRedemption = {
      code: normalizedCode,
      tier: couponConfig.tier,
      credits: tierCredits,
      redeemedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    await redisSet(userCouponKey, redemption);
    
    // Increment coupon usage count
    await redisSet(couponCountKey, currentCount + 1);

    // Also save credits to user's account
    const creditsKey = `credits:${sessionId}`;
    const existingCredits = await redisGet<Record<string, number>>(creditsKey) || {};
    
    const newCredits = {
      ...existingCredits,
      lyric_generations: (existingCredits.lyric_generations || 0) + tierCredits.lyric_generations,
      cover_art: (existingCredits.cover_art || 0) + tierCredits.cover_art,
      video_generations: (existingCredits.video_generations || 0) + tierCredits.video_generations,
      expires_at: expiresAt.toISOString(),
    };

    await redisSet(creditsKey, newCredits);

    // Create response with session cookie
    const response = NextResponse.json({
      success: true,
      message: `Coupon redeemed! You now have access to the ${couponConfig.tier.replace('_', ' ')} tier.`,
      credits: {
        lyric_generations: tierCredits.lyric_generations,
        cover_art: tierCredits.cover_art,
        video_generations: tierCredits.video_generations,
      },
      expiresAt: expiresAt.toISOString(),
    });

    // Set session cookie if new
    if (!cookieStore.get('anon_session')?.value) {
      response.cookies.set('anon_session', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (error: any) {
    console.error('[Coupon] Redemption error:', error);
    return NextResponse.json(
      { error: 'Failed to redeem coupon', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const sessionId = cookies().get('anon_session')?.value;
    
    if (!sessionId) {
      return NextResponse.json({ hasCoupon: false });
    }

    const userCouponKey = `coupon:user:${sessionId}`;
    const coupon = await redisGet<CouponRedemption>(userCouponKey);

    if (!coupon) {
      return NextResponse.json({ hasCoupon: false });
    }

    // Check if expired
    const isExpired = new Date(coupon.expiresAt) < new Date();

    return NextResponse.json({
      hasCoupon: true,
      isExpired,
      coupon: {
        tier: coupon.tier,
        credits: coupon.credits,
        expiresAt: coupon.expiresAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to check coupon status' },
      { status: 500 }
    );
  }
}
