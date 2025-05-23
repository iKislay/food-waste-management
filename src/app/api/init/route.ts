import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/utils/db/actions';

export async function GET() {
  try {
    const DEFAULT_EMAIL = "shashank@gmail.com";
    const DEFAULT_NAME = "Shashank";

    // Check if default user exists
    let defaultUser = await getUserByEmail(DEFAULT_EMAIL);
    
    if (!defaultUser) {
      // Create default user if not exists
      defaultUser = await createUser(DEFAULT_EMAIL, DEFAULT_NAME);
      return NextResponse.json({ 
        success: true, 
        message: 'Default user created successfully',
        user: defaultUser 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Default user already exists',
      user: defaultUser 
    });

  } catch (error) {
    console.error('Error initializing default user:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize default user' },
      { status: 500 }
    );
  }
}