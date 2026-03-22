// --- Supabase Configuration ---
const SUPABASE_URL = 'https://wocnzfrwcsspenbiepwf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvY256ZnJ3Y3NzcGVuYmllcHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzExNDMsImV4cCI6MjA4OTc0NzE0M30.Britr0FXy-mFjCsTvv3RSEIRRV_AJyPyVemF3u_3cb0';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // --- Selectors ---
    const screens = {
        auth: document.getElementById('auth-screen'),
        onboarding: document.getElementById('onboarding-screen'),
        home: document.getElementById('home-screen')
    };

    const forms = {
        login: document.getElementById('login-form'),
        signup: document.getElementById('signup-form'),
        chat: document.getElementById('chat-form')
    };

    const dashboardViews = document.querySelectorAll('.dashboard-view');
    const navItems = document.querySelectorAll('.nav-item');
    const messagesContainer = document.getElementById('messages-container');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const taskContainer = document.getElementById('task-container');
    const revisionContainer = document.getElementById('revision-container');

    // --- State ---
    let currentUser = null;
    let userProfile = null;
    let currentConversationId = null;
    let selectedExam = '';
    let selectedSubjects = [];

    // --- 1. SESSION MANAGEMENT ---
    async function checkSession() {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            await loadUserProfile();
        } else {
            showScreen('auth');
        }
    }

    async function loadUserProfile() {
        if (!currentUser) return;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (error || !data) {
            // Profile might not exist if signup was manual but insert failed
            showScreen('onboarding');
        } else {
            userProfile = data;
            if (!userProfile.onboarding_completed) {
                showScreen('onboarding');
            } else {
                showScreen('home');
                initializeDashboard();
            }
        }
    }

    function showScreen(screenId) {
        Object.keys(screens).forEach(key => screens[key].classList.remove('active'));
        screens[screenId].classList.add('active');
    }

    checkSession();

    // --- 2. AUTH LOGIC ---
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            forms.login.classList.toggle('active', tab === 'login');
            forms.signup.classList.toggle('active', tab === 'signup');
        });
    });

    // Login
    forms.login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = forms.login.querySelector('input[type="email"]').value;
        const password = forms.login.querySelector('input[type="password"]').value;
        
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return alert("Login Error: " + error.message);
        
        currentUser = data.user;
        await loadUserProfile();
    });

    // Signup
    if (forms.signup) {
        forms.signup.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("Signup form submitted");
            
            const emailInput = forms.signup.querySelector('input[type="email"]');
            const passwordInput = forms.signup.querySelector('input[type="password"]');
            const nameInput = document.getElementById('signup-name');

            if (!emailInput || !passwordInput || !nameInput) {
                console.error("Missing input fields in signup form");
                return;
            }

            const email = emailInput.value;
            const password = passwordInput.value;
            const name = nameInput.value;
            
            console.log("Creating auth user for:", email);
            
            const { data, error } = await supabase.auth.signUp({ 
                email, 
                password,
                options: { data: { full_name: name } }
            });

            if (error) {
                console.error("Signup error:", error.message);
                return alert("Signup Error: " + error.message);
            }
            
            if (data.user) {
                console.log("Auth user created:", data.user.id);
                
                // Ensure profile is created even if backend trigger didn't run
                const { error: profileError } = await supabase.from('profiles').upsert({
                    id: data.user.id,
                    full_name: name,
                    onboarding_completed: false
                });

                if (profileError) {
                    console.warn("Profile upsert error (non-fatal if trigger exists):", profileError.message);
                }

                currentUser = data.user;
                console.log("Moving to onboarding...");
                showScreen('onboarding');
            } else {
                alert("Signup successful! Please check your email for a confirmation link.");
            }
        });
    } else {
        console.error("Signup form element not found!");
    }

    // Logout
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.reload();
    });

    // --- 3. ONBOARDING FLOW ---
    document.querySelectorAll('.option').forEach(opt => {
        opt.onclick = () => {
            document.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedExam = opt.dataset.value;
        };
    });

    document.querySelectorAll('.sub-option').forEach(opt => {
        opt.onclick = () => {
            opt.classList.toggle('selected');
            const sub = opt.dataset.sub;
            if (selectedSubjects.includes(sub)) {
                selectedSubjects = selectedSubjects.filter(s => s !== sub);
            } else {
                selectedSubjects.push(sub);
            }
        };
    });

    document.querySelectorAll('.next-step').forEach(btn => {
        btn.onclick = () => {
            const next = btn.dataset.next;
            document.querySelectorAll('.onboarding-step').forEach(step => step.classList.remove('active'));
            document.querySelector(`.onboarding-step[data-step="${next}"]`).classList.add('active');
        };
    });

    const syllabusSlider = document.getElementById('syllabus-slider');
    syllabusSlider.oninput = () => {
        document.getElementById('slider-pct').textContent = syllabusSlider.value;
    };

    document.getElementById('complete-onboarding').onclick = async () => {
        const examDate = document.getElementById('onboard-exam-date').value;
        const progress = syllabusSlider.value;

        const { error } = await supabase
            .from('profiles')
            .update({
                exam_target: selectedExam, // Person B called it exam_target or similar
                exam_date: examDate,
                target_subjects: selectedSubjects,
                syllabus_progress: { percentage: parseInt(progress) },
                onboarding_completed: true
            })
            .eq('id', currentUser.id);

        if (error) return alert("Error saving profile: " + error.message);
        
        await loadUserProfile();
    };

    // --- 4. DASHBOARD NAVIGATION ---
    navItems.forEach(item => {
        item.onclick = () => {
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const viewId = `view-${item.dataset.view}`;
            dashboardViews.forEach(v => v.classList.remove('active'));
            document.getElementById(viewId).classList.add('active');
            
            if (item.dataset.view === 'chat' && !currentConversationId) {
                loadConversations();
            }
        };
    });

    function initializeDashboard() {
        document.getElementById('user-initial').textContent = (userProfile.full_name || "User").substring(0, 2).toUpperCase();
        document.getElementById('today-date-str').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        loadTasks();
        loadRevision();
    }

    // --- 5. FEATURE LOADER (Task 1, 2, 3) ---
    async function loadTasks() {
        taskContainer.innerHTML = '<div class="task-card empty">Fetching your personalized plan...</div>';
        
        const { data, error } = await supabase
            .from('study_plans')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (!data || data.length === 0) {
            taskContainer.innerHTML = '<div class="task-card empty">No tasks scheduled yet. Ask the AI to generate a plan for you!</div>';
            return;
        }

        taskContainer.innerHTML = '';
        data.forEach(task => {
            const div = document.createElement('div');
            div.className = 'task-card';
            div.innerHTML = `
                <div class="task-info">
                    <strong>${task.title || "Daily Study Session"}</strong>
                    <p>${task.description || "Refer to syllabus topics"}</p>
                </div>
                <input type="checkbox" ${task.status === 'completed' ? 'checked' : ''}>
            `;
            taskContainer.appendChild(div);
        });
    }

    async function loadRevision() {
        revisionContainer.innerHTML = '';
        const { data, error } = await supabase
            .from('concept_progress')
            .select('*')
            .eq('user_id', currentUser.id);

        if (!data || data.length === 0) {
            // Dummy for demo
            const dummies = [
                { concept_name: "Newton's 2nd Law", subject: "Physics", next_revision: new Date() },
                { concept_name: "Organic Compounds", subject: "Chemistry", next_revision: new Date() }
            ];
            dummies.forEach(d => addRevisionCard(d));
            return;
        }

        data.forEach(item => addRevisionCard(item));
    }

    function addRevisionCard(item) {
        const div = document.createElement('div');
        div.className = 'revision-card';
        div.innerHTML = `
            <div class="revision-topic">${item.concept_name}</div>
            <div class="revision-meta">
                <span>${item.subject || "General"}</span>
                <span>Due: ${new Date(item.next_revision || Date.now()).toLocaleDateString()}</span>
            </div>
            <button class="btn btn-review">Review Now</button>
        `;
        revisionContainer.appendChild(div);
    }

    // --- 6. AI TUTOR CHAT (Task 4) ---
    async function loadConversations() {
        const { data, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('created_at', { ascending: false });

        const history = document.getElementById('history-container');
        history.innerHTML = '';
        
        if (data && data.length > 0) {
            data.forEach(convo => {
                const div = document.createElement('div');
                div.className = 'history-item';
                div.textContent = convo.title || "Untitled Chat";
                div.onclick = () => selectConversation(convo.id);
                history.appendChild(div);
            });
        }
    }

    async function selectConversation(id) {
        currentConversationId = id;
        document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
        messagesContainer.innerHTML = '<div class="msg msg-ai">Loading messages...</div>';
        
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        messagesContainer.innerHTML = '';
        if (data) {
            data.forEach(msg => addMessageUI(msg.content, msg.role));
        }

        setupRealtime(id);
    }

    function setupRealtime(convoId) {
        supabase.channel(`room-${convoId}`)
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `conversation_id=eq.${convoId}`
            }, (payload) => {
                const msg = payload.new;
                // Only add if not already in UI (prevent double add for user msgs)
                if (msg.role === 'assistant') {
                    addMessageUI(msg.content, 'ai');
                }
            })
            .subscribe();
    }

    forms.chat.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        chatInput.value = '';
        chatInput.style.height = 'auto';
        sendBtn.disabled = true;

        if (!currentConversationId) {
            const { data } = await supabase.from('conversations').insert({ 
                user_id: currentUser.id, 
                title: text.substring(0, 30) + '...'
            }).select().single();
            currentConversationId = data.id;
            loadConversations();
        }

        addMessageUI(text, 'user');

        const { error } = await supabase.from('messages').insert({
            conversation_id: currentConversationId,
            role: 'user',
            content: text
        });

        if (error) alert("Error sending message: " + error.message);
    });

    function addMessageUI(text, role) {
        const div = document.createElement('div');
        div.className = `msg msg-${role === 'user' ? 'user' : 'ai'}`;
        div.textContent = text;
        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    chatInput.addEventListener('input', () => {
        sendBtn.disabled = chatInput.value.trim().length === 0;
        chatInput.style.height = 'auto';
        chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });

    document.getElementById('new-chat-btn').onclick = () => {
        currentConversationId = null;
        messagesContainer.innerHTML = '';
        document.querySelectorAll('.history-item').forEach(item => item.classList.remove('active'));
    };
});
