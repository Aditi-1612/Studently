// grok.js - Central API file for Grok AI calls
// NOTE: For a hackathon frontend project, the API key is kept in the client.
// Before demo, replace "your_key_here" with your actual Grok API Key.

const GROK_API_KEY = "your_key_here"
;

/**
 * Calls the Grok API with a system prompt and user message.
 * @param {string} systemPrompt 
 * @param {string} userMessage 
 * @returns {Promise<string>} The AI's response text.
 */
async function callGrok(systemPrompt, userMessage) {
    try {
        const response = await fetch("https://api.x.ai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${GROK_API_KEY}`
            },
            body: JSON.stringify({
                model: "grok-3",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userMessage }
                ],
                max_tokens: 1000
            })
        });

        if (!response.ok) {
            console.error("API Error Response:", await response.text());
            throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (err) {
        console.error("Error calling Grok API:", err);
        return "AI unavailable. Please check your API key or network connection.";
    }
}
