import { GoogleGenAI, Type } from "@google/genai";
import { DesignAnalysis, StyleDirection } from "../types";

// Helper to get client with current key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * PHASE 1: Analyze the sketch to extract intent and design DNA.
 * Upgraded to gemini-3-pro-preview for maximum reasoning capability.
 */
export const analyzeSketch = async (base64Image: string): Promise<DesignAnalysis> => {
  try {
    const ai = getAI();
    // Using the most powerful reasoning model available
    const model = 'gemini-3-pro-preview';
    
    const prompt = `
      ROLE: Master Typographer & Brand Identity Designer.
      TASK: Analyze this rough sketch for a wordmark.
      
      Provide a structured analysis in JSON format focusing on:
      1. Intent: What is the personality (aggressive, friendly, sophisticated)?
      2. Structural DNA: Unique stroke terminals, ligatures, or weight distributions to preserve.
      3. Elevation Targets: What needs fixing (wobbly lines, spacing, optical weight).
      4. Rationale: A brief designer's note on the potential of this mark.
      
      Do not be generic. Be opinionated, creative, and highly technical in your typographic terminology.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Image
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING },
            structuralDNA: { type: Type.STRING },
            elevationTargets: { type: Type.STRING },
            rationale: { type: Type.STRING }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No analysis returned");
    
    return JSON.parse(jsonText) as DesignAnalysis;

  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

/**
 * PHASE 2: Generate the refined wordmark image.
 * Uses gemini-3-pro-image-preview for high-fidelity generation.
 */
export const generateRefinedWordmark = async (
  base64Sketch: string,
  analysis: DesignAnalysis,
  style: StyleDirection,
  brandName: string
): Promise<string> => {
  try {
    const ai = getAI();
    // Using Pro Image Preview for highest fidelity (1K/2K/4K capable)
    const model = 'gemini-3-pro-image-preview';

    let stylePrompt = "";
    switch (style) {
      case StyleDirection.BOLD:
        stylePrompt = "High contrast, commanding presence, thick strokes, unapologetic weight.";
        break;
      case StyleDirection.ELEGANT:
        stylePrompt = "Refined proportions, classical references, sophisticated restraint, high-fashion vibe.";
        break;
      case StyleDirection.IMAGINATIVE:
        stylePrompt = "Unexpected details, creative ligatures, memorable flourishes, artistic.";
        break;
      case StyleDirection.MINIMALIST:
        stylePrompt = "Swiss style, geometric, reduced to essentials, perfect optical spacing.";
        break;
    }

    const prompt = `
      Act as a Master Typographer. Transform this attached sketch into a production-ready wordmark for "${brandName}".
      
      DESIGN DIRECTION: ${stylePrompt}
      
      CRITICAL INSTRUCTIONS:
      - INTENT: ${analysis.intent}
      - DNA TO PRESERVE: ${analysis.structuralDNA}
      - ELEVATION: ${analysis.elevationTargets}
      
      OUTPUT REQUIREMENTS:
      - The result must be a black and white image.
      - Solid black text on a pure white background.
      - High resolution, sharp edges (simulate vector quality).
      - Perfect optical kerning.
      - No greyscale, no gradients, no 3D effects. Pure flat form.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Sketch
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K" 
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image generated");

  } catch (error) {
    console.error("Generation failed:", error);
    throw error;
  }
};

/**
 * PHASE 3: Refine the design via Chat.
 * Allows user to iterate on the generated image using text instructions.
 */
export const refineWordmark = async (
  currentImageBase64: string,
  instruction: string
): Promise<{ image: string, text: string }> => {
  try {
    const ai = getAI();
    const model = 'gemini-3-pro-image-preview';
    
    // Clean base64 just in case
    const cleanBase64 = currentImageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const prompt = `
      You are a Senior Art Director and Master Typographer.
      The user wants to refine the attached logo design.
      
      USER INSTRUCTION: "${instruction}"
      
      TASK:
      1. Edit the image to satisfy the user's request while maintaining professional typographic standards.
      2. Keep it black and white, flat, vector-style.
      3. Provide a VERY BRIEF (1 sentence) professional rationale for your change as text output.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: cleanBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    let generatedImage = '';
    let generatedText = 'Design updated based on your feedback.';

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          generatedImage = `data:image/png;base64,${part.inlineData.data}`;
        } else if (part.text) {
          generatedText = part.text;
        }
      }
    }

    if (!generatedImage) throw new Error("No refinement generated");

    return { image: generatedImage, text: generatedText };

  } catch (error) {
    console.error("Refinement failed:", error);
    throw error;
  }
};
