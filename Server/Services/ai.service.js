const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const myAPIKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenerativeAI(myAPIKey);
// console.log("API Key:", myAPIKey ? "Loaded" : "Missing");


const main = async (prompt) => {
    try {
        if (!myAPIKey) {
            console.error("GEMINI_API_KEY is not set");
            return "neutral";
        }

        const model = ai.getGenerativeModel({
            model: "gemini-1.5-flash",
            systemInstruction: `You are an expert emotion classification AI. Your sole function is to analyze the user's text and determine their primary emotional state.
        
        You MUST respond with only a single, lowercase word. Choose the most fitting word from this exclusive list of 18 core emotions:
        happy, sad, angry, fearful, surprised, disgusted, calm, excited, stressed, tired, confident, grateful, frustrated, curious, bored, loved, lonely, neutral
        
        CRITICAL RULES:
        1.  Your response must be EXACTLY one word from the list.
        2.  Do not use capitalization or punctuation.
        3.  Do not provide any explanation, greetings, or apologies.
        4.  If the text is vague, a question, or doesn't express a clear mood, respond with 'neutral'.`
        });
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        
        if (!response || !response.candidates || !response.candidates[0] || !response.candidates[0].content || !response.candidates[0].content.parts || !response.candidates[0].content.parts[0]) {
            console.error("Invalid response structure from AI");
            return "neutral";
        }

        const rawText = response.candidates[0].content.parts[0].text;
        console.log("Raw AI Response:", rawText);
        
        // Clean and normalize the response
        const finalReply = rawText.trim().toLowerCase().split(/\s+/)[0]; // Get first word, lowercase, trimmed
        
        // Validate that the response is one of the expected moods
        const validMoods = ["happy", "sad", "angry", "fearful", "surprised", "disgusted", "calm", "excited", "stressed", "tired", "confident", "grateful", "frustrated", "curious", "bored", "loved", "lonely", "neutral"];
        
        if (validMoods.includes(finalReply)) {
            return finalReply;
        } else {
            console.warn(`Invalid mood detected: "${finalReply}", defaulting to "neutral"`);
            return "neutral";
        }
    } catch (error) {
        console.error("Error in mood detection:", error.message);
        return "neutral";
    }
};


module.exports = { main };