import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export async function POST(request: Request) {
  try {
    const { image } = await request.json();
    
    const genAI = new GoogleGenerativeAI(geminiApiKey!);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const imageParts = [{
      inlineData: {
        data: image.split(',')[1],
        mimeType: 'image/jpeg',
      },
    }];

    const prompt = `You are an expert in food analysis. Analyze this image and provide:
      1. The type of food (e.g., "pizza", "salad", etc.) Just give food name without any extra text.
      2. An estimate of the quantity (in portions or kg)
      3. Your confidence level in this assessment (as a percentage)
      4. Estimated time before the food might spoil (in hours)
      
      Respond in JSON format like this:
      {
        "foodType": "detailed food description",
        "confidence": confidence level as a number between 0 and 1,
        "expiryHours": number of hours before food might spoil
      }`;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ success: true, data: text });
  } catch (error) {
    console.error('Error in food verification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify food' },
      { status: 500 }
    );
  }
}
