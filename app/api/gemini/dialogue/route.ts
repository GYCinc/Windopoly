import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { playerResponse, scenarioContext, roleTitle } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        feedback: 'Great professional phrasing! Clear articulation of energy trade-offs.',
        score: 85,
        tip: 'In business negotiations, always follow a compromise with a specific operational guarantee.',
        isFallback: true,
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const prompt = `You are an expert English language coach for adult professionals in the clean energy and grid engineering industry.
A learner playing an energy business game just gave this response in an executive negotiation:

Scenario Context: "${scenarioContext}"
Player's Role: "${roleTitle}"
Player's Spoken/Chosen Response: "${playerResponse}"

Please evaluate their English communication across 3 criteria:
1. Professional tone (politeness, tact, diplomacy).
2. Clean energy vocabulary accuracy (e.g. curtailment, capacity, tariff, intermittency, MWh).
3. Clarity and persuasiveness for an English Language Learner.

Respond with strict JSON in this exact format:
{
  "feedback": "2-3 sentences of clear, encouraging feedback highlighting strengths and any slight phrasing improvements.",
  "score": number between 60 and 100,
  "suggestedImprovement": "A polished alternative sentence using executive professional English.",
  "vocabularyTip": "One quick note on a specific word or preposition used."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    const parsed = JSON.parse(text);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error evaluating dialogue:', error);
    return NextResponse.json({
      feedback: 'Effective business communication! You addressed the counterpart with clear terminology.',
      score: 80,
      tip: 'Practice using words like "reliability", "dispatch", and "contractual commitments" when speaking to grid operators.',
      isFallback: true,
    });
  }
}
