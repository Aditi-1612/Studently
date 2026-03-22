/**
 * Studently Adaptive Practice Engine
 * Handles AI-powered question generation and performance-based adaptation.
 */

const PracticeEngine = {
    currentSubject: '',
    currentTopic: '',
    questions: [],
    currentIndex: 0,
    performanceLog: [], // { questionId, timeTaken, correct, topic }
    startTime: null,

    /**
     * Generates a set of questions using Gemini
     * @param {string} subject 
     * @param {string} topic 
     * @param {string} difficulty - 'easy', 'medium', 'hard'
     */
    async generateQuestions(subject, topic, difficulty = 'medium') {
        const systemPrompt = `You are a high-stakes exam examiner. Generate 5 highly realistic, PYQ-pattern multiple choice questions for ${subject} on the topic "${topic}". 
        Difficulty level: ${difficulty}.
        Output MUST be a valid JSON array of objects:
        [{"id": "unique_id", "question": "...", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "..."}]
        Answer is the index of the correct option (0-3).`;

        try {
            const response = await callGemini(systemPrompt, "Start generating.");
            let cleanData = response.trim();
            const start = cleanData.indexOf('[');
            const end = cleanData.lastIndexOf(']');
            if (start !== -1 && end !== -1) {
                cleanData = cleanData.substring(start, end + 1);
            }
            this.questions = JSON.parse(cleanData);
            this.currentIndex = 0;
            this.currentSubject = subject;
            this.currentTopic = topic;
            return this.questions;
        } catch (err) {
            console.error("Failed to generate questions:", err);
            throw err;
        }
    },

    /**
     * Starts the timer for the current question
     */
    startQuestion() {
        this.startTime = Date.now();
    },

    /**
     * Submits an answer and logs performance
     * @param {number} selectedIndex 
     */
    submitAnswer(selectedIndex) {
        const q = this.questions[this.currentIndex];
        const endTime = Date.now();
        const timeTaken = (endTime - this.startTime) / 1000; // seconds
        const isCorrect = selectedIndex === q.answer;

        const logEntry = {
            id: q.id,
            topic: this.currentTopic,
            subject: this.currentSubject,
            timeTaken,
            correct: isCorrect
        };

        this.performanceLog.push(logEntry);
        this.saveLog();

        return {
            isCorrect,
            correctAnswer: q.options[q.answer],
            explanation: q.explanation,
            timeTaken
        };
    },

    /**
     * Moves to the next question
     */
    nextQuestion() {
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            return this.questions[this.currentIndex];
        }
        return null; // Quiz finished
    },

    /**
     * Analyzes performance to detect weak areas
     */
    analyzeWeaknesses() {
        const summary = {}; // { topic: { total, correct, totalTime } }
        
        this.performanceLog.forEach(log => {
            if (!summary[log.topic]) {
                summary[log.topic] = { total: 0, correct: 0, totalTime: 0 };
            }
            summary[log.topic].total++;
            if (log.correct) summary[log.topic].correct++;
            summary[log.topic].totalTime += log.timeTaken;
        });

        const weakAreas = [];
        for (const topic in summary) {
            const stats = summary[topic];
            const accuracy = stats.correct / stats.total;
            const avgTime = stats.totalTime / stats.total;

            // Simple heuristic: < 70% accuracy OR avg time > 60s
            if (accuracy < 0.7 || avgTime > 60) {
                weakAreas.push({ topic, accuracy, avgTime });
            }
        }
        return weakAreas;
    },

    saveLog() {
        localStorage.setItem('studently_practice_logs', JSON.stringify(this.performanceLog));
    },

    loadLog() {
        const saved = localStorage.getItem('studently_practice_logs');
        if (saved) this.performanceLog = JSON.parse(saved);
    }
};

// Initial load
PracticeEngine.loadLog();
