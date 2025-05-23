import { NextResponse } from 'next/server';
import { createReport, getUserByEmail } from '@/utils/db/actions';

export async function POST(request: Request) {
  try {
    const DEFAULT_LOCATION = "PES College Of Engineering, Mandya, Karnataka";
    const DEFAULT_EMAIL = "shashank@gmail.com";
    let { userId, location = DEFAULT_LOCATION, image, metadata } = await request.json();

    // If userId is not provided, get default user
    if (!userId) {
      const defaultUser = await getUserByEmail(DEFAULT_EMAIL);
      if (defaultUser) {
        userId = defaultUser.id;
      } else {
        throw new Error('Default user not found');
      }
    }

    // First verify the food using existing verify-food endpoint
    const verifyResponse = await fetch('https://food-waste-management-chi.vercel.app/api/verify-food', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image })
    });

    const verifyResult = await verifyResponse.json();
    if (!verifyResult.success) {
      throw new Error('Food verification failed');
    }

    const cleanedJson = cleanJsonResponse(verifyResult.data);
    const foodData = JSON.parse(cleanedJson);
    
    // Create the report with potentially default location
    const report = await createReport(
      userId,
      location,  // This will now use either provided location or default
      foodData.foodType,
      foodData.quantity,
      image,
      metadata,
      JSON.stringify(foodData)
    );

    return NextResponse.json({ 
      success: true, 
      report 
    });

  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create report' },
      { status: 500 }
    );
  }
}

function cleanJsonResponse(text: string): string {
  const jsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonMatch) return jsonMatch[1];
  const objectMatch = text.match(/\{[\s\S]*\}/);
  return objectMatch ? objectMatch[0] : text;
}
