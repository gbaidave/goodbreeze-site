import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

/*
 * TODO: Create Supabase table with the following SQL:
 *
 * CREATE TABLE IF NOT EXISTS leads (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   email TEXT NOT NULL UNIQUE,
 *   newsletter BOOLEAN DEFAULT true,
 *   source TEXT DEFAULT 'newsletter_signup',
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_leads_email ON leads(email);
 * CREATE INDEX idx_leads_newsletter ON leads(newsletter);
 */

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Length limits
    if (typeof name !== 'string' || name.length > 100) {
      return NextResponse.json({ error: 'Name must be under 100 characters' }, { status: 400 });
    }
    if (typeof email !== 'string' || email.length > 254) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Insert into Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          email,
          newsletter: true,
          source: 'newsletter_signup',
        },
      ] as any)
      .select()
      .single();

    if (error) {
      // Handle duplicate email error
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        );
      }

      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to the newsletter!',
        data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
