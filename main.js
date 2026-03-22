// Main logic and dummy data for Studently UI

// View Switching
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        
        if (!targetView) return; // For non-target items like Settings

        // Update Nav
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        // Update Views
        views.forEach(v => {
            v.classList.remove('active');
            if (v.id === targetView) {
                v.classList.add('active');
            }
        });
    });
});

// Doubt Solver Grok AI Integration
const searchBtn = document.getElementById('search-btn');
const searchInput = document.getElementById('doubt-input');
const resultsArea = document.getElementById('results-area');
const resultTitle = document.getElementById('result-title');
const resultContent = document.getElementById('result-content');

searchBtn.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query.length < 5) {
        alert("Please enter a more descriptive doubt!");
        return;
    }

    // Check language preference
    const langOptions = document.getElementsByName('aiLanguage');
    let selectedLang = 'english';
    for (const option of langOptions) {
        if (option.checked) {
            selectedLang = option.value;
            break;
        }
    }

    // Show searching state
    searchBtn.innerText = "Solving...";
    resultsArea.style.display = "none";

    // Prepare prompt
    const systemPrompt = `You are a helpful and expert AI tutor for Indian competitive exams (JEE/NEET/UPSC). 
Your goal is to explain concepts clearly and accurately grounding your answers in the NCERT syllabus where applicable.
${selectedLang === 'hindi' ? "CRITICAL: You MUST answer strictly in Hindi or Hinglish (a mix of Hindi and English) based on what makes it easiest for an Indian student to understand." : "Please answer in clear English."}
Use markdown to format your response with bold text, bullet points, and code/math blocks where appropriate. Be encouraging and concise.`;

    try {
        // callGrok is defined in grok.js
        const response = await callGrok(systemPrompt, query);
        
        // Output result
        resultTitle.innerHTML = `<i data-lucide="bot" style="vertical-align: middle; margin-right: 8px;"></i>Grok AI Tutor (${selectedLang === 'hindi' ? 'Hindi/Hinglish' : 'English'})`;
        
        // Parse markdown if marked.js is available
        if (typeof marked !== 'undefined') {
            resultContent.innerHTML = marked.parse(response);
        } else {
            resultContent.innerHTML = response.replace(/\n/g, '<br>');
        }
        
        resultsArea.style.display = "block";
        resultsArea.scrollIntoView({ behavior: 'smooth' });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (err) {
        console.error("AI call failed:", err);
        resultTitle.innerHTML = "Error";
        resultContent.innerHTML = "Failed to connect to the AI tutor. Please check the API key or try again later.";
        resultsArea.style.display = "block";
    } finally {
        searchBtn.innerText = "Solve It";
    }
});

// Forest View Timer Logic
let timerSeconds = 1500; // 25:00 default
let timerInterval = null;
const timerDisplay = document.getElementById('timer-display');
const forestBtn = document.querySelector('#forest-gamification button');

function updateTimerDisplay() {
    const min = Math.floor(timerSeconds / 60);
    const sec = timerSeconds % 60;
    timerDisplay.innerText = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

forestBtn.addEventListener('click', () => {
    if (forestBtn.innerText === "Start Session") {
        forestBtn.innerText = "Pause Session";
        forestBtn.style.background = "#fb7185"; // var(--accent-color) equivalent
        
        if (!timerInterval) {
            timerInterval = setInterval(() => {
                if (timerSeconds > 0) {
                    timerSeconds--;
                    updateTimerDisplay();
                } else {
                    // Timer hit zero!
                    clearInterval(timerInterval);
                    timerInterval = null;
                    forestBtn.innerText = "Start Session";
                    forestBtn.style.background = "var(--primary-color)";
                    timerSeconds = 1500; // Reset
                    updateTimerDisplay();
                    
                    // Add grown tree to the collection grid
                    const myForestGrid = document.getElementById('my-forest-grid');
                    const treeCountDisplay = document.getElementById('tree-count');
                    const emptyMsg = document.getElementById('empty-forest-msg');
                    
                    if (myForestGrid && treeCountDisplay) {
                        const treeIcon = document.createElement('div');
                        treeIcon.innerHTML = '🌲';
                        treeIcon.style.fontSize = '3rem';
                        treeIcon.style.animation = 'fadeIn 0.5s ease forwards';
                        treeIcon.style.filter = 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.4))'; // primary glow
                        
                        myForestGrid.appendChild(treeIcon);
                        treeCountDisplay.innerText = parseInt(treeCountDisplay.innerText) + 1;
                        if (emptyMsg) emptyMsg.style.display = 'none';
                    }
                    
                    alert("Focus session complete! A new tree has grown in your forest.");
                }
            }, 1000);
        }
    } else {
        // Pause timer
        forestBtn.innerText = "Start Session";
        forestBtn.style.background = "var(--primary-color)";
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
});


// Mood Check-in Logic
const moodBtns = document.querySelectorAll('.mood-btn');
const quotePopup = document.getElementById('quote-popup');
const moodQuote = document.getElementById('mood-quote');
const moodAuthor = document.getElementById('mood-author');

const quotes = {
    sad: [
        { q: "It's okay not to be okay. Remember, stars can't shine without darkness.", a: "Unknown" },
        { q: "After every storm comes a rainbow.", a: "Unknown" }
    ],
    neutral: [
        { q: "Be content with what you are, and wish not change.", a: "Martial" },
        { q: "The standard you walk past is the standard you accept.", a: "David Morrison" }
    ],
    happy: [
        { q: "Happiness is not something ready-made. It comes from your own actions.", a: "Dalai Lama" },
        { q: "The most important thing is to enjoy your life—to be happy—it's all that matters.", a: "Audrey Hepburn" }
    ],
    excited: [
        { q: "Enthusiasm moves the world.", a: "Arthur Balfour" },
        { q: "Action is the foundational key to all success.", a: "Pablo Picasso" }
    ]
};

moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const mood = btn.getAttribute('data-mood');
        const moodQuotes = quotes[mood];
        const randomQuote = moodQuotes[Math.floor(Math.random() * moodQuotes.length)];
        
        moodQuote.innerText = `"${randomQuote.q}"`;
        moodAuthor.innerText = `- ${randomQuote.a}`;
        
        quotePopup.style.display = "block";
        quotePopup.style.animation = "fadeIn 0.5s forwards";
    });
});

// Settings Logic


// Theme Toggle (Dark/Light Mode)
const themeSwitch = document.getElementById('themeSwitch');
if (themeSwitch) {
    themeSwitch.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
    });
}

// Font Size Selection
const fontBtns = document.querySelectorAll('.font-btn');
const root = document.documentElement;

const fontSizes = {
    'small': '14px',
    'medium': '16px',
    'large': '18px'
};

fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        root.style.setProperty('--base-font-size', fontSizes[size]);
        
        fontBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Language Selection Simulation
const languageSelect = document.getElementById('languageSelect');
if (languageSelect) {
    languageSelect.addEventListener('change', (e) => {
        alert(`Language changed to: ${e.target.options[e.target.selectedIndex].text}. (Reload to apply in a real app)`);
    });
}

// Subject Tags Toggle Add/Remove Simulation
const tagsContainer = document.getElementById('subjectsContainer');
if (tagsContainer) {
    tagsContainer.addEventListener('click', (e) => {
        if(e.target.classList.contains('tag') && !e.target.classList.contains('add-tag')) {
            e.target.classList.toggle('active');
        } else if (e.target.classList.contains('add-tag')) {
            const subject = prompt("Enter new subject name:");
            if(subject && subject.trim() !== '') {
                const span = document.createElement('span');
                span.classList.add('tag', 'active');
                span.textContent = subject.trim();
                tagsContainer.insertBefore(span, e.target);
            }
        }
    });
}

// Privacy & Security - Dummy actions
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        const confirmLogout = confirm("Are you sure you want to log out?");
        if (confirmLogout) {
            alert("You have been successfully logged out. Redirecting to login page...");
        }
    });
}

const deleteAccountBtn = document.getElementById('deleteAccountBtn');
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        const confirmDelete = confirm("WARNING: This action is permanent and cannot be undone. Are you absolutely sure you want to delete your account?");
        if (confirmDelete) {
            const finalConfirm = prompt("Type 'DELETE' to confirm account deletion:");
            if (finalConfirm === 'DELETE') {
                alert("Your account has been successfully deleted. We're sorry to see you go.");
            } else {
                alert("Account deletion cancelled. Incorrect confirmation.");
            }
        }
    });
}

// Daily Goals Logic
const goalsList = document.getElementById('goals-list');
const newGoalInput = document.getElementById('new-goal-input');
const addGoalBtn = document.getElementById('add-goal-btn');

function createGoalElement(text) {
    const li = document.createElement('li');
    li.className = 'goal-item';
    li.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 10px; background: rgba(255,255,255,0.02); padding: 12px 16px; border-radius: 12px; border: 1px solid var(--glass-border);';
    
    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'display: flex; align-items: center; gap: 12px; flex: 1;';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'goal-checkbox';
    checkbox.style.cssText = 'width: 18px; height: 18px; accent-color: var(--primary-color); cursor: pointer;';
    
    const textSpan = document.createElement('span');
    textSpan.className = 'goal-text';
    textSpan.style.cssText = 'flex: 1; outline: none; transition: 0.3s;';
    textSpan.contentEditable = "true";
    textSpan.innerText = text;
    
    checkbox.addEventListener('change', (e) => {
        textSpan.style.textDecoration = e.target.checked ? 'line-through' : 'none';
        textSpan.style.opacity = e.target.checked ? '0.5' : '1';
    });
    
    const delBtn = document.createElement('button');
    delBtn.className = 'delete-goal-btn';
    delBtn.style.cssText = 'background: transparent; border: none; color: var(--danger-color); cursor: pointer; display: flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 50%; outline: none;';
    delBtn.title = "Delete Goal";
    delBtn.innerHTML = '<i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>';
    
    delBtn.addEventListener('click', () => {
        li.style.animation = 'fadeInDown 0.3s ease reverse forwards';
        setTimeout(() => li.remove(), 300);
    });
    
    wrapper.appendChild(checkbox);
    wrapper.appendChild(textSpan);
    li.appendChild(wrapper);
    li.appendChild(delBtn);
    
    return li;
}

if (addGoalBtn && newGoalInput && goalsList) {
    addGoalBtn.addEventListener('click', () => {
        const text = newGoalInput.value.trim();
        if (text) {
            const el = createGoalElement(text);
            el.style.animation = 'fadeInUp 0.4s ease forwards';
            goalsList.appendChild(el);
            if (typeof lucide !== 'undefined') lucide.createIcons();
            newGoalInput.value = '';
        }
    });
    
    newGoalInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addGoalBtn.click();
    });

    // Attach logic to existing static HTML goals
    const existingCheckboxes = goalsList.querySelectorAll('.goal-checkbox');
    const existingSpans = goalsList.querySelectorAll('.goal-text');
    const existingDelBtns = goalsList.querySelectorAll('.delete-goal-btn');
    
    existingCheckboxes.forEach((cb, idx) => {
        cb.addEventListener('change', (e) => {
            if (existingSpans[idx]) {
                existingSpans[idx].style.textDecoration = e.target.checked ? 'line-through' : 'none';
                existingSpans[idx].style.opacity = e.target.checked ? '0.5' : '1';
            }
        });
    });
    
    existingDelBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const li = btn.closest('.goal-item');
            if (li) {
                li.style.animation = 'fadeInDown 0.3s ease reverse forwards';
                setTimeout(() => li.remove(), 300);
            }
        });
    });

    // Save Goals to Backend (Mock)
    const saveGoalsBtn = document.getElementById('save-goals-btn');
    if (saveGoalsBtn) {
        saveGoalsBtn.addEventListener('click', async () => {
            const currentGoals = [];
            const items = goalsList.querySelectorAll('.goal-item');
            
            items.forEach(item => {
                const text = item.querySelector('.goal-text').innerText.trim();
                const isCompleted = item.querySelector('.goal-checkbox').checked;
                currentGoals.push({ title: text, completed: isCompleted });
            });
            
            saveGoalsBtn.innerHTML = 'Saving... ⏳';
            saveGoalsBtn.disabled = true;

            try {
                // Mock network transmission time
                await new Promise(resolve => setTimeout(resolve, 800)); 
                
                // MOCK API REQUEST EXAMPLE:
                /*
                await fetch('https://api.studently.com/v1/goals/save', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ goals: currentGoals, userId: 'user_123' })
                });
                */
                
                console.log("---- OUTGOING BACKEND PAYLOAD ----");
                console.log(JSON.stringify({ goals: currentGoals }, null, 2));
                
                alert(`Successfully backed up ${currentGoals.length} goals to the backend!\n\n(Open browser Developer Tools Console to see the JSON payload being "sent")`);
                
                saveGoalsBtn.innerHTML = 'Saved! ✅';
                saveGoalsBtn.style.color = "var(--primary-color)";
                saveGoalsBtn.style.borderColor = "var(--primary-color)";
                
                // Reset button after success
                setTimeout(() => {
                    saveGoalsBtn.innerHTML = 'Save Goals';
                    saveGoalsBtn.style.color = "";
                    saveGoalsBtn.style.borderColor = "";
                    saveGoalsBtn.disabled = false;
                }, 2500);
                
            } catch (error) {
                console.error("Failed to save goals:", error);
                saveGoalsBtn.innerText = "Error - Try Again";
                saveGoalsBtn.disabled = false;
            }
        });
    }
}
