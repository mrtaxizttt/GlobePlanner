document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────────────
    // 1. ELEMENT REFERENCES
    // ─────────────────────────────────────────────
    const authBtn          = document.getElementById('auth-btn');
    const logoutBtn        = document.getElementById('logout-btn');
    const userGreeting     = document.getElementById('user-greeting');
    const loginModal       = document.getElementById('login-modal');
    const closeModal       = document.querySelector('.close-modal');
    const loginForm        = document.getElementById('login-form');
    const registerForm     = document.getElementById('register-form');
    const profileName      = document.getElementById('profile-name');
    const profileStatus    = document.getElementById('profile-status');
    const profileInputName  = document.getElementById('profile-input-name');
    const profileInputEmail = document.getElementById('profile-input-email');
    const dangerZone       = document.getElementById('danger-zone');
    const deleteAccountBtn = document.getElementById('delete-account-btn');

    let isLoggedIn  = false;
    let currentUser = null;

    // ─────────────────────────────────────────────
    // 2. MODAL OPEN / CLOSE
    // ─────────────────────────────────────────────
    authBtn.addEventListener('click', () => loginModal.classList.remove('hidden'));
    closeModal.addEventListener('click', () => loginModal.classList.add('hidden'));
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    // ─────────────────────────────────────────────
    // 3. LOGIN
    // ─────────────────────────────────────────────
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email    = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        try {
            const res  = await fetch('auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'login', email, password })
            });
            const data = await res.json();

            if (res.ok) {
                loginModal.classList.add('hidden');
                loginForm.reset();
                setLoggedIn(data.user);
            } else {
                alert(data.error || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            alert('Could not reach the server. Please try again.');
        }
    });

    // ─────────────────────────────────────────────
    // 4. REGISTER
    // ─────────────────────────────────────────────
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name     = document.getElementById('register-name').value.trim();
            const email    = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;

            try {
                const res  = await fetch('auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'register', name, email, password })
                });
                const data = await res.json();

                if (res.ok) {
                    loginModal.classList.add('hidden');
                    registerForm.reset();
                    setLoggedIn(data.user);
                    alert('Welcome, ' + data.user.name + '! Your account has been created.');
                } else {
                    alert(data.error || 'Registration failed. Please try again.');
                }
            } catch (err) {
                alert('Could not reach the server. Please try again.');
            }
        });
    }

    // ─────────────────────────────────────────────
    // 5. LOGOUT
    // ─────────────────────────────────────────────
    logoutBtn.addEventListener('click', async () => {
        try {
            await fetch('auth.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'logout' })
            });
        } catch (err) { /* session will expire naturally */ }

        setLoggedOut();
        switchView('dashboard-view');
    });

    // ─────────────────────────────────────────────
    // 6. DELETE ACCOUNT
    // ─────────────────────────────────────────────
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (!confirm('This will permanently delete your account and ALL your plans. This cannot be undone. Are you sure?')) return;

            try {
                const res  = await fetch('auth.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'delete_account' })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Your account has been deleted.');
                    setLoggedOut();
                    switchView('dashboard-view');
                } else {
                    alert(data.error || 'Could not delete account.');
                }
            } catch (err) {
                alert('Could not reach the server.');
            }
        });
    }

    // ─────────────────────────────────────────────
    // 7. RESTORE SESSION ON PAGE LOAD
    // ─────────────────────────────────────────────
    async function checkSession() {
        try {
            const res = await fetch('auth.php?action=me');
            if (res.ok) {
                const data = await res.json();
                setLoggedIn(data.user);
            }
        } catch (err) { /* no active session */ }
    }
    checkSession();

    // ─────────────────────────────────────────────
    // 8. UI STATE HELPERS
    // ─────────────────────────────────────────────
    function setLoggedIn(user) {
        isLoggedIn  = true;
        currentUser = user;

        userGreeting.textContent = 'Welcome, ' + user.name.split(' ')[0];
        authBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');

        profileName.textContent   = user.name;
        profileStatus.textContent = 'Active Student';
        profileStatus.style.background = '#10b981';
        profileStatus.style.color      = 'white';
        profileInputName.value  = user.name;
        profileInputEmail.value = user.email;

        if (dangerZone) dangerZone.classList.remove('hidden');
        loadPlans();
    }

    function setLoggedOut() {
        isLoggedIn  = false;
        currentUser = null;

        userGreeting.textContent = 'Welcome, Guest';
        authBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');

        profileName.textContent   = 'Guest User';
        profileStatus.textContent = 'Not Logged In';
        profileStatus.style.background = '';
        profileStatus.style.color      = '';
        profileInputName.value  = 'Guest User';
        profileInputEmail.value = 'guest@example.com';

        if (dangerZone) dangerZone.classList.add('hidden');

        const plansList = document.getElementById('plans-list');
        if (plansList) plansList.innerHTML = '<p>Please log in to see your plans.</p>';
    }

    // ─────────────────────────────────────────────
    // 9. NAVIGATION
    // ─────────────────────────────────────────────
    const navItems     = document.querySelectorAll('.nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        navItems.forEach(item =>
            item.classList.toggle('active', item.getAttribute('data-target') === targetId)
        );
        viewSections.forEach(section =>
            section.classList.toggle('active', section.id === targetId)
        );
        document.querySelector('.main-content').scrollTop = 0;
        if (targetId === 'plan-view' && isLoggedIn) loadPlans();
    }

    navItems.forEach(item =>
        item.addEventListener('click', () => switchView(item.getAttribute('data-target')))
    );
    window.switchView = switchView;

    // ─────────────────────────────────────────────
    // 10. ACCESSIBILITY CONTROLS
    // ─────────────────────────────────────────────
    const themeBtn           = document.getElementById('theme-toggle');
    const fontBtn            = document.getElementById('font-size-toggle');
    const deadlineBtn        = document.getElementById('deadline-toggle');
    const deadlinesContainer = document.getElementById('deadlines');

    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        themeBtn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    });

    const fontSizes = [16, 18, 20];
    let fontStep = 0;
    fontBtn.addEventListener('click', () => {
        fontStep = (fontStep + 1) % fontSizes.length;
        document.documentElement.style.setProperty('--font-base', fontSizes[fontStep] + 'px');
        document.body.style.fontSize = fontSizes[fontStep] + 'px';
        fontBtn.textContent = 'Text Size: ' + fontSizes[fontStep] + 'px';
    });

    deadlineBtn.addEventListener('click', () => {
        const isHidden = deadlinesContainer.classList.toggle('hidden');
        deadlineBtn.textContent = isHidden ? 'Show Deadlines' : 'Hide Deadlines';
    });

    // ─────────────────────────────────────────────
    // 11. CALENDAR
    // ─────────────────────────────────────────────
    const calendarDays     = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn     = document.getElementById('prev-month');
    const nextMonthBtn     = document.getElementById('next-month');

    let calDate = new Date();
    const today = new Date();
    const demoDeadlines = [
        { month: 5,  day: 15, label: 'Visa Application' },
        { month: 6,  day: 1,  label: 'Housing Deposit'  },
        { month: 7,  day: 10, label: 'Flight Booking'   }
    ];

    function renderCalendar() {
        const year  = calDate.getFullYear();
        const month = calDate.getMonth();
        currentMonthYear.textContent =
            calDate.toLocaleString('default', { month: 'long' }) + ' ' + year;
        calendarDays.innerHTML = '';

        const firstDay    = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.classList.add('cal-day', 'empty');
            calendarDays.appendChild(empty);
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayDiv = document.createElement('div');
            dayDiv.classList.add('cal-day');
            dayDiv.textContent = day;
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear())
                dayDiv.classList.add('today');
            const dl = demoDeadlines.find(d => d.month === month + 1 && d.day === day);
            if (dl) {
                dayDiv.classList.add('deadline');
                dayDiv.title = dl.label;
                dayDiv.addEventListener('click', () => alert('Deadline: ' + dl.label));
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    prevMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); });
    renderCalendar();

    // ─────────────────────────────────────────────
    // 12. PLANS CRUD
    // ─────────────────────────────────────────────
    const planForm    = document.getElementById('plan-form');
    const savePlanBtn = document.getElementById('save-plan-btn');
    const plansList   = document.getElementById('plans-list');
    const searchInput = document.getElementById('plan-search');
    const searchBtn   = document.getElementById('plan-search-btn');

    async function savePlan(e) {
        e.preventDefault();
        if (!isLoggedIn) {
            alert('You must be logged in to save a plan.');
            loginModal.classList.remove('hidden');
            return;
        }
        const destination = document.getElementById('plan-destination') ? document.getElementById('plan-destination').value.trim() : '';
        const university  = document.getElementById('plan-university')  ? document.getElementById('plan-university').value.trim()  : '';
        const startDate   = document.getElementById('plan-start-date')  ? document.getElementById('plan-start-date').value          : '';

        if (!destination || !university || !startDate) {
            alert('Please fill in Destination, University, and Start Date.');
            return;
        }
        try {
            const res  = await fetch('plans.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ destination, university, start_date: startDate })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Plan saved successfully!');
                planForm.reset();
                loadPlans();
            } else {
                const msg = data.errors ? Object.values(data.errors).join('\n') : (data.error || 'Failed to save plan.');
                alert(msg);
            }
        } catch (err) { alert('Could not reach the server.'); }
    }

    planForm.addEventListener('submit', savePlan);
    savePlanBtn.addEventListener('click', () => planForm.dispatchEvent(new Event('submit')));

    async function loadPlans() {
        if (!plansList) return;
        if (!isLoggedIn) { plansList.innerHTML = '<p>Please log in to see your plans.</p>'; return; }
        try {
            const res  = await fetch('plans.php');
            const data = await res.json();
            renderPlansList(data.plans || []);
        } catch (err) { plansList.innerHTML = '<p>Could not load plans.</p>'; }
    }

    function renderPlansList(plans) {
        if (!plansList) return;
        if (plans.length === 0) {
            plansList.innerHTML = '<p style="color:#6b7280;">No plans yet. Fill in the form above to create your first one!</p>';
            return;
        }
        plansList.innerHTML = plans.map(plan =>
            '<div class="task-item" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;">' +
            '<div><strong>' + escapeHtml(plan.destination) + '</strong> — ' + escapeHtml(plan.university) +
            '<span class="task-date" style="margin-left:0.75rem;">📅 ' + plan.start_date + '</span></div>' +
            '<button onclick="deletePlan(' + plan.id + ')" class="delete-task-btn" title="Delete plan">&times;</button>' +
            '</div>'
        ).join('');
    }

    window.deletePlan = async function(id) {
        if (!confirm('Delete this plan?')) return;
        try {
            const res  = await fetch('plans.php?id=' + id, { method: 'DELETE' });
            const data = await res.json();
            if (res.ok) loadPlans();
            else alert(data.error || 'Failed to delete plan.');
        } catch (err) { alert('Could not reach the server.'); }
    };

    if (searchBtn) {
        searchBtn.addEventListener('click', async () => {
            const term = searchInput ? searchInput.value.trim() : '';
            if (!term) { loadPlans(); return; }
            try {
                const res  = await fetch('plans.php?search=' + encodeURIComponent(term));
                const data = await res.json();
                renderPlansList(data.plans || []);
                if ((data.plans || []).length === 0 && plansList)
                    plansList.innerHTML = '<p>No plans found matching "<strong>' + escapeHtml(term) + '</strong>".</p>';
            } catch (err) { alert('Search failed.'); }
        });
    }

    // ─────────────────────────────────────────────
    // 13. TASKS (localStorage)
    // ─────────────────────────────────────────────
    const taskListEl       = document.getElementById('task-list');
    const newTaskInput     = document.getElementById('new-task-input');
    const addTaskBtn       = document.getElementById('add-task-btn');
    const filterBtns       = document.querySelectorAll('.filter-btn');
    const completedCountEl = document.getElementById('completed-count');
    const totalCountEl     = document.getElementById('total-count');

    let tasks = [];
    let currentFilter = 'all';

    function loadTasks() {
        const saved = localStorage.getItem('globePlannerTasks');
        tasks = saved ? JSON.parse(saved) : [
            { id: 1, text: 'Apply for student visa', completed: false, createdAt: new Date().toISOString() },
            { id: 2, text: 'Book accommodation',      completed: false, createdAt: new Date().toISOString() },
            { id: 3, text: 'Register for courses',    completed: true,  createdAt: new Date().toISOString() }
        ];
        if (!saved) localStorage.setItem('globePlannerTasks', JSON.stringify(tasks));
        renderTasks();
    }

    function addTask() {
        const text = newTaskInput.value.trim();
        if (!text) { alert('Please enter a task.'); return; }
        tasks.unshift({ id: Date.now(), text, completed: false, createdAt: new Date().toISOString() });
        localStorage.setItem('globePlannerTasks', JSON.stringify(tasks));
        renderTasks();
        newTaskInput.value = '';
        newTaskInput.focus();
    }

    function toggleTask(id) {
        const t = tasks.find(t => t.id === id);
        if (t) { t.completed = !t.completed; localStorage.setItem('globePlannerTasks', JSON.stringify(tasks)); renderTasks(); }
    }

    function deleteTask(id) {
        if (!confirm('Delete this task?')) return;
        tasks = tasks.filter(t => t.id !== id);
        localStorage.setItem('globePlannerTasks', JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        let filtered = tasks;
        if (currentFilter === 'active')    filtered = tasks.filter(t => !t.completed);
        if (currentFilter === 'completed') filtered = tasks.filter(t =>  t.completed);

        taskListEl.innerHTML = '';
        if (filtered.length === 0) {
            taskListEl.innerHTML = '<div class="task-empty"><div class="task-empty-icon">📋</div><p>No tasks found</p></div>';
        } else {
            filtered.forEach(task => {
                const el  = document.createElement('div');
                el.className = 'task-item' + (task.completed ? ' completed' : '');

                const cb  = document.createElement('input');
                cb.type = 'checkbox'; cb.className = 'task-checkbox'; cb.checked = task.completed;
                cb.addEventListener('change', () => toggleTask(task.id));

                const txt = document.createElement('span');
                txt.className = 'task-text'; txt.textContent = task.text;

                const dt  = document.createElement('span');
                dt.className = 'task-date';
                dt.textContent = new Date(task.createdAt).toLocaleDateString();

                const del = document.createElement('button');
                del.className = 'delete-task-btn'; del.innerHTML = '&times;'; del.title = 'Delete task';
                del.addEventListener('click', () => deleteTask(task.id));

                el.append(cb, txt, dt, del);
                taskListEl.appendChild(el);
            });
        }
        completedCountEl.textContent = tasks.filter(t => t.completed).length;
        totalCountEl.textContent     = tasks.length;
    }

    addTaskBtn.addEventListener('click', addTask);
    newTaskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTask(); });
    filterBtns.forEach(b => b.addEventListener('click', () => {
        currentFilter = b.dataset.filter;
        filterBtns.forEach(x => x.classList.toggle('active', x.dataset.filter === currentFilter));
        renderTasks();
    }));

    loadTasks();

    // ─────────────────────────────────────────────
    // 14. UTILITY
    // ─────────────────────────────────────────────
    function escapeHtml(str) {
        return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
});
