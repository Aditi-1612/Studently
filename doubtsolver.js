import { callGemini } from './gemini.js';

document.addEventListener('DOMContentLoaded', () => {
    const solveBtn = document.getElementById('solveBtn');
    const userInput = document.getElementById('userInput');
    const responseDisplay = document.getElementById('response-display');

    if (!solveBtn) return;

    solveBtn.addEventListener('click', async () => {
        const query = userInput.value.trim();
        if (!query) return alert("Please type your doubt first!");

        // UI Feedback
        solveBtn.innerText = "Solving...";
        solveBtn.disabled = true;
        responseDisplay.style.display = "block";
        responseDisplay.innerText = "Thinking...";

        try {
            // 1. Fetch Backend Context from your Supabase 'topics' table
            const { data: topics } = await window.supabase
                .from('topics')
                .select('name, subject')
                .limit(3);

            const context = topics 
                ? topics.map(t => `${t.subject}: ${t.name}`).join(", ") 
                : "General Academic";

            // 2. Get Selected Language
            const language = document.querySelector('input[name="lang"]:checked').value;

            // 3. Build Prompt
            const systemPrompt = `You are Studently AI. User's current topics: ${context}. 
            Provide a clear solution in ${language}. Use bullet points.`;

            // 4. Call Gemini
            const result = await callGemini(systemPrompt, query);
            responseDisplay.innerText = result;

        } catch (err) {
            responseDisplay.innerText = "Error: " + err.message;
        } finally {
            solveBtn.innerText = "Solve It";
            solveBtn.disabled = false;
        }
    });

    // Make tags clickable
    document.querySelectorAll('.tag').forEach(tag => {
        tag.onclick = () => userInput.value = "Explain " + tag.innerText.replace('#', '');
    });
});

