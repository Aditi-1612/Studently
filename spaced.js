// spaced.js - SM-2 Spaced Repetition Algorithm Logic

// Note: Using localStorage for the hackathon UI demo so that it's fully functional flawlessly 
// during the presentation. You can easily swap this out with Supabase logic later.
let topics = JSON.parse(localStorage.getItem('studently_topics')) || [];

function saveTopics() {
    localStorage.setItem('studently_topics', JSON.stringify(topics));
}

function addTopic() {
    const nameInput = document.getElementById('topic-name');
    const subjectSelect = document.getElementById('topic-subject');
    
    const name = nameInput.value.trim();
    const subject = subjectSelect.value;
    
    if (!name) {
        alert("Please enter a topic name.");
        return;
    }

    const newTopic = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
        name: name,
        subject: subject,
        interval_days: 1,
        // Default to right now so it appears in "Due Today" immediately for the demo
        next_revision: new Date().toISOString(),
        last_studied: null
    };

    topics.push(newTopic);
    saveTopics();
    
    nameInput.value = ''; // Clear form
    renderTopics();
}

function reviewTopic(id, rating) {
    const topic = topics.find(t => t.id === id);
    if (!topic) return;

    // SM-2 Algorithm Simplified Rules:
    // Forgot: Restart at 1 day
    // Hard: Multiply interval by 1.2
    // Easy: Multiply interval by 2.5
    if (rating === 'forgot') {
        topic.interval_days = 1;
    } else if (rating === 'hard') {
        topic.interval_days = Math.max(1, Math.round(topic.interval_days * 1.2));
    } else if (rating === 'easy') {
        topic.interval_days = Math.max(1, Math.round(topic.interval_days * 2.5));
    }

    topic.last_studied = new Date().toISOString();
    
    // Calculate new next_revision date
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + topic.interval_days);
    topic.next_revision = nextDate.toISOString();

    saveTopics();
    renderTopics();
}

function renderTopics() {
    const dueList = document.getElementById('due-topics-list');
    const allList = document.getElementById('all-topics-list');
    
    if (!dueList || !allList) return;

    dueList.innerHTML = '';
    allList.innerHTML = '';

    const now = new Date();
    let dueCount = 0;
    let allCount = 0;

    topics.forEach(topic => {
        const nextRevDate = new Date(topic.next_revision);
        const isDue = nextRevDate <= now;

        // Render in ALL list
        const cardHTML = `
            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--glass-border); padding: 15px; border-radius: 12px;">
                <h3 style="margin-bottom: 5px; color: var(--text-primary);">${topic.name}</h3>
                <span style="font-size: 0.8rem; background: rgba(99, 102, 241, 0.2); color: var(--primary-color); padding: 4px 10px; border-radius: 6px; font-weight: bold;">${topic.subject}</span>
                <div style="margin-top: 15px;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px;"><i data-lucide="calendar" style="width: 14px; height: 14px; vertical-align: middle;"></i> Interval: ${topic.interval_days} day(s)</p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary);"><i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle;"></i> Next Revision: ${nextRevDate.toLocaleDateString()}</p>
                </div>
            </div>
        `;
        allList.innerHTML += cardHTML;
        allCount++;

        // Render in DUE list
        if (isDue) {
            dueCount++;
            const dueItem = document.createElement('div');
            dueItem.style.cssText = `background: rgba(255,255,255,0.04); border-left: 4px solid var(--primary-color); padding: 15px; border-radius: 8px; margin-bottom: 10px;`;
            
            dueItem.innerHTML = `
                <div style="margin-bottom: 12px;">
                    <h4 style="color: var(--text-primary); margin-bottom: 4px; font-size: 1.1rem;">${topic.name}</h4>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">${topic.subject}</span>
                </div>
                <p style="font-size: 0.85rem; margin-bottom: 10px; color: var(--text-secondary);">How well do you remember this?</p>
                <div style="display: flex; gap: 8px;">
                    <button onclick="reviewTopic('${topic.id}', 'easy')" class="btn btn-outline" style="flex: 1; padding: 8px 4px; font-size: 0.85rem; border-color: #22c55e; color: #22c55e;">Easy (x2.5)</button>
                    <button onclick="reviewTopic('${topic.id}', 'hard')" class="btn btn-outline" style="flex: 1; padding: 8px 4px; font-size: 0.85rem; border-color: #eab308; color: #eab308;">Hard (x1.2)</button>
                    <button onclick="reviewTopic('${topic.id}', 'forgot')" class="btn btn-outline" style="flex: 1; padding: 8px 4px; font-size: 0.85rem; border-color: #ef4444; color: #ef4444;">Forgot (1d)</button>
                </div>
            `;
            dueList.appendChild(dueItem);
        }
    });

    if (dueCount === 0) {
        dueList.innerHTML = `<div style="text-align: center; padding: 30px; color: var(--text-secondary);"><i data-lucide="check-circle" style="width: 48px; height: 48px; color: #22c55e; margin-bottom: 15px;"></i><br><span style="font-size: 1.1rem;">You're all caught up for today!</span></div>`;
    }
    if (allCount === 0) {
        allList.innerHTML = `<p style="color: var(--text-secondary); grid-column: 1/-1;">No topics added yet. Add a topic above to start spacing out your revisions!</p>`;
    }
    
    if (typeof lucide !== 'undefined') {
         lucide.createIcons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const addBtn = document.getElementById('add-topic-btn');
    if (addBtn) {
        addBtn.addEventListener('click', addTopic);
    }
    
    const topicNameInput = document.getElementById('topic-name');
    if (topicNameInput) {
        topicNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') addTopic();
        });
    }

    renderTopics();
});
