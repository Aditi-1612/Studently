// gemini.js - Central API file for Gemini AI calls
// NOTE: For a hackathon frontend project, the API key is kept in the client.

const GEMINI_API_KEY = "AIzaSyD61SmpTugsITc9uZuCqcYMg-mjAIvyuPg";

/**
 * Calls the AI API with a system prompt and user message.
 * @param {string} systemPrompt 
 * @param {string} userMessage 
 * @returns {Promise<string>} The AI's response text.
 */
async function callGemini(systemPrompt, userMessage) {
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    parts: [{ text: userMessage }]
                }]
            })
        });

        if (!response.ok) {
            console.error("API Error Response:", await response.text());
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (err) {
        console.error("Error calling AI API:", err);
        throw err;
    }
}
