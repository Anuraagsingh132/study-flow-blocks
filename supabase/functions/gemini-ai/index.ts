
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const apiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyCfvqprsdUzdAtGe9OutIxY0RYQPKqukAQ';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, history, subject } = await req.json();

    // Prepare conversation context
    let prompt = "";
    
    // Add subject context if provided
    if (subject) {
      prompt = `Context: The user is studying ${subject}.\n\n`;
    }
    
    // Add the user's message
    prompt += message;

    // Prepare the conversation history for Gemini
    const messages = [];
    
    // Add system prompt first
    messages.push({
      role: "user",
      parts: [{ text: "You are a helpful AI study assistant. Provide concise, accurate, and helpful responses to student questions. When answering, try to encourage critical thinking rather than just giving direct answers. If you don't know something, say so rather than making up information." }]
    });
    
    messages.push({
      role: "model",
      parts: [{ text: "I understand my role as a study assistant. I'll provide helpful, concise answers while encouraging critical thinking. I'll be honest when I don't know something." }]
    });
    
    // Add conversation history if provided
    if (history && history.length > 0) {
      for (const item of history) {
        messages.push({
          role: item.role,
          parts: [{ text: item.content }]
        });
      }
    }
    
    // Add the current message
    messages.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    console.log("Sending request to Gemini API with messages:", JSON.stringify(messages));

    // Make the API request to Gemini
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: messages,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      })
    });

    const data = await response.json();
    
    console.log("Received response from Gemini API:", JSON.stringify(data));
    
    // Handle potential errors
    if (!response.ok || data.error) {
      console.error('Error response from Gemini API:', data);
      return new Response(JSON.stringify({ 
        error: data.error?.message || 'Error from Gemini API' 
      }), {
        status: response.status || 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Extract the generated text from the response
    const generatedText = data.candidates[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ 
      reply: generatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-ai function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
