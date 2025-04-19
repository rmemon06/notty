import { env } from "@/env";
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // my oepnai key
});

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  // Log the incoming request to see if it's hitting the endpoint and getting the text.
  console.log("Received text for summarization:", text);

  if (!text) {
    console.error("No text provided");
    return NextResponse.json({ summary: 'No text provided.' }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // adjustable model
      messages: [
        {
          role: 'system',
          content: 'You summarise text clearly and concisely in 2-3 sentences.',
        },
        {
          role: 'user',
          content: `Summarise this note:\n\n${text}`,
        },
      ],
    });
  
    const summary = completion.choices[0]?.message?.content;
    return NextResponse.json({ summary });
  } catch (error) {
    if (error && typeof error === 'object' && 'message' in error) {
      // TypeScript now knows error is an object that has a 'message' property
      console.error("Error during OpenAI API call:", (error as { message: string }).message);
      return NextResponse.json({ summary: `Error: ${(error as { message: string }).message}` }, { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return NextResponse.json({ summary: 'An unexpected error occurred.' }, { status: 500 });
    }
  }
}
