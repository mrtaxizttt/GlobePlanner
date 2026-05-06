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
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            switchView(item.dataset.target);
            document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    window.switchView = function(viewId) {
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(viewId);
        if (target) target.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(i => {
            i.classList.toggle('active', i.dataset.target === viewId);
        });
    };

    // ─────────────────────────────────────────────
    // 10. THEME / FONT / DEADLINES TOGGLES
    // ─────────────────────────────────────────────
    const themeToggle   = document.getElementById('theme-toggle');
    const fontToggle    = document.getElementById('font-size-toggle');
    const deadlineToggle = document.getElementById('deadline-toggle');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            themeToggle.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
        });
    }
    if (fontToggle) {
        let big = false;
        fontToggle.addEventListener('click', () => {
            big = !big;
            document.body.style.fontSize = big ? '1.15rem' : '';
            fontToggle.textContent = big ? 'Default Text' : 'Increase Text';
        });
    }
    if (deadlineToggle) {
        deadlineToggle.addEventListener('click', () => {
            const dl = document.getElementById('deadlines');
            if (dl) {
                dl.classList.toggle('visible');
                deadlineToggle.textContent = dl.classList.contains('visible') ? 'Hide Deadlines' : 'Show Deadlines';
            }
        });
    }

    // ─────────────────────────────────────────────
    // 11a. EDITABLE DESTINATION CARD
    // ─────────────────────────────────────────────
    const DEST_KEY = 'globePlannerDestination';

    const defaultDest = {
        university: 'Sungkyunwan University',
        country:    'South Korea',
        tag1:       'Bilateral',
        tag2:       'Fall 2026'
    };

    function loadDestination() {
        return JSON.parse(localStorage.getItem(DEST_KEY)) || defaultDest;
    }

    function renderDestination() {
        const d = loadDestination();
        document.getElementById('dest-university-text').textContent = d.university;
        document.getElementById('dest-country-text').textContent    = d.country;
        document.getElementById('dest-tag1').textContent            = d.tag1;
        document.getElementById('dest-tag2').textContent            = d.tag2;
    }

    const editDestBtn   = document.getElementById('edit-destination-btn');
    const destDisplay   = document.getElementById('destination-display');
    const destEdit      = document.getElementById('destination-edit');
    const saveDestBtn   = document.getElementById('save-destination-btn');
    const cancelDestBtn = document.getElementById('cancel-destination-btn');

    if (editDestBtn) {
        editDestBtn.addEventListener('click', () => {
            const d = loadDestination();
            document.getElementById('edit-university').value = d.university;
            document.getElementById('edit-country').value    = d.country;
            document.getElementById('edit-tag1').value       = d.tag1;
            document.getElementById('edit-tag2').value       = d.tag2;
            destDisplay.style.display = 'none';
            destEdit.style.display    = 'block';
        });
    }

    if (cancelDestBtn) {
        cancelDestBtn.addEventListener('click', () => {
            destEdit.style.display    = 'none';
            destDisplay.style.display = 'block';
        });
    }

    if (saveDestBtn) {
        saveDestBtn.addEventListener('click', () => {
            const d = {
                university: document.getElementById('edit-university').value.trim() || defaultDest.university,
                country:    document.getElementById('edit-country').value.trim()    || defaultDest.country,
                tag1:       document.getElementById('edit-tag1').value.trim()       || defaultDest.tag1,
                tag2:       document.getElementById('edit-tag2').value.trim()       || defaultDest.tag2,
            };
            localStorage.setItem(DEST_KEY, JSON.stringify(d));
            renderDestination();
            destEdit.style.display    = 'none';
            destDisplay.style.display = 'block';
            // Also refresh the REST Countries card if country changed
            loadCountryInfo(d.country);
        });
    }

    renderDestination();

    // ─────────────────────────────────────────────
    // 11b. EDITABLE COURSE LIST
    // ─────────────────────────────────────────────
    const COURSES_KEY     = 'globePlannerCourses';
    const defaultCourses  = [
        'Computer Networks (6 ECTS)',
        'Software Engineering (5 ECTS)',
        'Data Structures (6 ECTS)',
        'Probability and Statistics (6 ECTS)'
    ];

    function loadCourses() {
        return JSON.parse(localStorage.getItem(COURSES_KEY)) || defaultCourses;
    }

    function renderCourses() {
        const ul      = document.getElementById('course-list-ul');
        const courses = loadCourses();
        ul.innerHTML  = courses.map((c, i) =>
            `<li style="display:flex; justify-content:space-between; align-items:center;">
                <span>${escapeHtml(c)}</span>
                <button onclick="deleteCourse(${i})" style="background:none; border:none; color:#6b7280; cursor:pointer; font-size:1rem; line-height:1; padding:0 4px;" title="Remove">&times;</button>
            </li>`
        ).join('');
    }

    window.deleteCourse = function(index) {
        const courses = loadCourses();
        courses.splice(index, 1);
        localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
        renderCourses();
    };

    const addCourseBtn    = document.getElementById('add-course-btn');
    const courseAddRow    = document.getElementById('course-add-row');
    const saveCourseBtn   = document.getElementById('save-course-btn');
    const cancelCourseBtn = document.getElementById('cancel-course-btn');
    const newCourseInput  = document.getElementById('new-course-input');

    if (addCourseBtn) {
        addCourseBtn.addEventListener('click', () => {
            courseAddRow.style.display = courseAddRow.style.display === 'none' ? 'block' : 'none';
            if (newCourseInput) newCourseInput.focus();
        });
    }
    if (cancelCourseBtn) {
        cancelCourseBtn.addEventListener('click', () => { courseAddRow.style.display = 'none'; });
    }
    if (saveCourseBtn) {
        saveCourseBtn.addEventListener('click', () => {
            const val = newCourseInput.value.trim();
            if (!val) return;
            const courses = loadCourses();
            courses.push(val);
            localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
            renderCourses();
            newCourseInput.value = '';
            courseAddRow.style.display = 'none';
        });
    }
    if (newCourseInput) {
        newCourseInput.addEventListener('keypress', e => { if (e.key === 'Enter') saveCourseBtn.click(); });
    }

    renderCourses();

    // ─────────────────────────────────────────────
    // 11c. EDITABLE DEADLINES (persisted + calendar sync)
    // ─────────────────────────────────────────────
    const DL_KEY = 'globePlannerDeadlines';

    const defaultDeadlines = [
        { id: 1, task: 'Visa Application', date: '2026-05-15', status: 'urgent'   },
        { id: 2, task: 'Housing Deposit',  date: '2026-06-01', status: 'pending'  },
        { id: 3, task: 'Flight Booking',   date: '2026-07-10', status: 'upcoming' },
    ];

    function loadDeadlines() {
        return JSON.parse(localStorage.getItem(DL_KEY)) || defaultDeadlines;
    }

    function saveDeadlines(list) {
        localStorage.setItem(DL_KEY, JSON.stringify(list));
    }

    function formatDeadlineDisplay(dateStr) {
        // Converts "2026-05-15" → "May 15"
        const [, m, d] = dateStr.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return months[parseInt(m, 10) - 1] + ' ' + parseInt(d, 10);
    }

    function renderDeadlines() {
        const grid = document.getElementById('deadlines-grid');
        if (!grid) return;
        const list = loadDeadlines();

        if (list.length === 0) {
            grid.innerHTML = '<p style="color:#6b7280; font-style:italic;">No deadlines yet. Click "+ Add Deadline" to create one.</p>';
            renderCalendar();
            return;
        }

        grid.innerHTML = list.map(dl => `
            <div class="card deadline-card" style="position:relative;">
                <button onclick="deleteDeadline(${dl.id})"
                    style="position:absolute; top:8px; right:8px; background:none; border:none; color:#6b7280; cursor:pointer; font-size:1rem; line-height:1;"
                    title="Remove">&times;</button>
                <span class="deadline-date">${formatDeadlineDisplay(dl.date)}</span>
                <p class="deadline-task">${escapeHtml(dl.task)}</p>
                <span class="status ${dl.status}">${dl.status.charAt(0).toUpperCase() + dl.status.slice(1)}</span>
            </div>
        `).join('');

        // Sync calendar so deadline dates are highlighted
        renderCalendar();
    }

    window.deleteDeadline = function(id) {
        const list = loadDeadlines().filter(d => d.id !== id);
        saveDeadlines(list);
        renderDeadlines();
    };

    // Add deadline form wiring
    const showAddDlBtn   = document.getElementById('show-add-deadline-btn');
    const addDlForm      = document.getElementById('add-deadline-form');
    const saveDlBtn      = document.getElementById('save-deadline-btn');
    const cancelDlBtn    = document.getElementById('cancel-deadline-btn');

    if (showAddDlBtn) {
        showAddDlBtn.addEventListener('click', () => {
            addDlForm.style.display = addDlForm.style.display === 'none' ? 'block' : 'none';
        });
    }
    if (cancelDlBtn) {
        cancelDlBtn.addEventListener('click', () => { addDlForm.style.display = 'none'; });
    }
    if (saveDlBtn) {
        saveDlBtn.addEventListener('click', () => {
            const task   = document.getElementById('dl-task').value.trim();
            const date   = document.getElementById('dl-date').value;
            const status = document.getElementById('dl-status').value;
            if (!task || !date) { alert('Please enter both a task name and a date.'); return; }
            const list = loadDeadlines();
            list.push({ id: Date.now(), task, date, status });
            // Sort chronologically
            list.sort((a, b) => a.date.localeCompare(b.date));
            saveDeadlines(list);
            renderDeadlines();
            document.getElementById('dl-task').value = '';
            document.getElementById('dl-date').value = '';
            addDlForm.style.display = 'none';
        });
    }

    renderDeadlines();

    // ─────────────────────────────────────────────
    // 11. CALENDAR — with deadline date highlighting
    // ─────────────────────────────────────────────
    let calDate = new Date();

    function renderCalendar() {
        const monthYearEl = document.getElementById('current-month-year');
        const daysEl      = document.getElementById('calendar-days');
        if (!monthYearEl || !daysEl) return;

        const year  = calDate.getFullYear();
        const month = calDate.getMonth();
        monthYearEl.textContent = calDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        const firstDay  = new Date(year, month, 1).getDay();
        const daysCount = new Date(year, month + 1, 0).getDate();
        const today     = new Date();

        // Build a Set of day-numbers that have a deadline this month
        const deadlineDays = new Set();
        loadDeadlines().forEach(dl => {
            const [y, m, d] = dl.date.split('-').map(Number);
            if (y === year && m - 1 === month) deadlineDays.add(d);
        });

        daysEl.innerHTML = '';
        for (let i = 0; i < firstDay; i++) daysEl.innerHTML += '<div></div>';
        for (let d = 1; d <= daysCount; d++) {
            const isToday    = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            const isDeadline = deadlineDays.has(d);
            let cls = 'cal-day';
            if (isToday)    cls += ' today';
            if (isDeadline) cls += ' deadline-day';
            daysEl.innerHTML += `<div class="${cls}">${d}${isDeadline ? '<span class="dl-dot"></span>' : ''}</div>`;
        }
    }

    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    if (prevBtn) prevBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); });
    renderCalendar();

    // ─────────────────────────────────────────────
    // 12. PLANS — CRUD
    // ─────────────────────────────────────────────
    const planForm    = document.getElementById('plan-form');
    const plansList   = document.getElementById('plans-list');
    const savePlanBtn = document.getElementById('save-plan-btn');
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
                // Reset university dropdown too
                const dd = document.getElementById('uni-dropdown');
                if (dd) { dd.style.display = 'none'; dd.innerHTML = '<option value="">— Select a university —</option>'; }
                const us = document.getElementById('uni-status');
                if (us) us.style.display = 'none';
                loadPlans();
            } else {
                const msg = data.errors ? Object.values(data.errors).join('\n') : (data.error || 'Failed to save plan.');
                alert(msg);
            }
        } catch (err) { alert('Could not reach the server.'); }
    }

    planForm.addEventListener('submit', savePlan);
    // FIX: click the real submit button inside the form instead of dispatching a synthetic event.
    // This avoids double-firing and ensures e.preventDefault() always works correctly.
    savePlanBtn.addEventListener('click', () => {
        const inner = planForm.querySelector('button[type="submit"]');
        if (inner) inner.click();
    });

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


    // ═════════════════════════════════════════════════════════════════
    // API 1 — STATIC HTML API: REST Countries
    // ─────────────────────────────────────────────────────────────────
    // Fetches data about the user's saved destination country from
    // restcountries.com. The content is fixed for the current destination
    // (no user input processed) — making it a Static API.
    // It also refreshes automatically when the user updates their
    // destination card, keeping it in sync.
    // External service: https://restcountries.com/v3.1/name/{country}
    // No API key required — the service is public and free.
    // ═════════════════════════════════════════════════════════════════
    async function loadCountryInfo(countryOverride) {
        const container = document.getElementById('country-info-content');
        if (!container) return;

        // Use the provided country, or fall back to the saved destination
        const country = countryOverride || loadDestination().country;
        container.innerHTML = '<p style="color:#6b7280; font-style:italic;">Loading country data...</p>';

        try {
            const res  = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
            const data = await res.json();
            const c    = data[0];

            const flag     = c.flags.svg;
            const capital  = c.capital?.[0] ?? 'N/A';
            const region   = c.region;
            const pop      = c.population.toLocaleString();
            const currency = Object.values(c.currencies)[0];
            const lang     = Object.values(c.languages)[0];

            container.innerHTML = `
                <img src="${flag}" alt="Flag of ${escapeHtml(country)}"
                     style="width:80px; border-radius:6px; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.4rem 2rem; font-size:0.875rem;">
                    <div><span style="color:#6b7280;">Capital</span><br><strong>${capital}</strong></div>
                    <div><span style="color:#6b7280;">Region</span><br><strong>${region}</strong></div>
                    <div><span style="color:#6b7280;">Population</span><br><strong>${pop}</strong></div>
                    <div><span style="color:#6b7280;">Currency</span><br><strong>${currency.name} (${currency.symbol})</strong></div>
                    <div><span style="color:#6b7280;">Language</span><br><strong>${lang}</strong></div>
                </div>`;
        } catch (err) {
            container.innerHTML = '<p style="color:#ef4444;">Could not load country info. Please check your connection.</p>';
        }
    }

    // Run on page load using the saved destination country
    loadCountryInfo();


    // ═════════════════════════════════════════════════════════════════
    // API 2 — DYNAMIC HTML + JAVASCRIPT API: Open-Meteo Weather
    // ─────────────────────────────────────────────────────────────────
    // Triggered when the user clicks "Check Weather at Destination".
    // Step 1: Reads the destination the user typed into #plan-destination.
    // Step 2: Calls the Open-Meteo Geocoding API to convert the city/country
    //         name into latitude and longitude coordinates.
    // Step 3: Uses those coordinates to call the Open-Meteo Forecast API
    //         and retrieves the current temperature and weather code.
    // Step 4: Displays the result dynamically in #weather-result.
    //
    // This is Dynamic because the response changes based on user input
    // and real-time meteorological data from a 3rd-party server.
    // External service: https://open-meteo.com/
    // No API key required — Open-Meteo is free and open.
    // ═════════════════════════════════════════════════════════════════
    const weatherBtn    = document.getElementById('weather-btn');
    const weatherResult = document.getElementById('weather-result');

    // Maps WMO weather codes to human-readable labels and emojis
    function describeWeather(code) {
        if (code === 0)              return '☀️ Clear sky';
        if (code <= 3)               return '⛅ Partly cloudy';
        if (code <= 49)              return '🌫️ Foggy';
        if (code <= 69)              return '🌧️ Rainy';
        if (code <= 79)              return '❄️ Snowy';
        if (code <= 99)              return '⛈️ Thunderstorm';
        return '🌡️ Unknown conditions';
    }

    if (weatherBtn) {
        weatherBtn.addEventListener('click', async () => {
            const destination = document.getElementById('plan-destination').value.trim();
            if (!destination) {
                alert('Please enter a destination country or city first.');
                return;
            }

            weatherResult.style.display = 'block';
            weatherResult.innerHTML     = '⏳ Fetching weather data...';

            try {
                // Step 1 — Geocode the user's text input into coordinates
                const geoRes  = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(destination)}&count=1&language=en&format=json`
                );
                const geoData = await geoRes.json();

                if (!geoData.results || geoData.results.length === 0) {
                    weatherResult.innerHTML = '❌ Location not found. Try a more specific city name.';
                    return;
                }

                const { latitude, longitude, name, country } = geoData.results[0];

                // Step 2 — Fetch current weather for those coordinates
                const wxRes  = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
                );
                const wxData = await wxRes.json();
                const wx     = wxData.current_weather;

                // Step 3 — Render the result into the page
                weatherResult.innerHTML = `
                    <strong>📍 ${name}, ${country}</strong><br>
                    🌡️ Temperature: <strong>${wx.temperature}°C</strong><br>
                    💨 Wind speed: <strong>${wx.windspeed} km/h</strong><br>
                    ${describeWeather(wx.weathercode)}
                `;
            } catch (err) {
                console.error('Weather API error:', err);
                weatherResult.innerHTML = '❌ Could not fetch weather. Please try again.';
            }
        });
    }


    // ═════════════════════════════════════════════════════════════════
    // API 3 — DATABASE-CONNECTED API: Hipolabs Universities
    // ─────────────────────────────────────────────────────────────────
    // Triggered when the user clicks "Search Universities".
    // Step 1: Reads the destination country from #plan-destination.
    // Step 2: Sends a GET request to the Hipolabs Universities API,
    //         which returns a list of universities in that country.
    // Step 3: Populates a <select> dropdown with the results so the
    //         user can choose one.
    // Step 4: Selecting a university from the dropdown fills the
    //         #plan-university text field automatically.
    // Step 5: When the form is submitted, that university name (fetched
    //         from the 3rd-party API) is sent to plans.php and saved
    //         to the PostgreSQL database along with the destination and date.
    //
    // This satisfies the "API connected to a database" requirement:
    // data originates from a 3rd-party server and is persisted in the DB.
    // External service: http://universities.hipolabs.com/search?country={name}
    // No API key required — the service is public and free.
    // ═════════════════════════════════════════════════════════════════
    const uniSearchBtn = document.getElementById('uni-search-btn');
    const uniDropdown  = document.getElementById('uni-dropdown');
    const uniStatus    = document.getElementById('uni-status');
    const uniInput     = document.getElementById('plan-university');

    if (uniSearchBtn) {
        uniSearchBtn.addEventListener('click', async () => {
            const country = document.getElementById('plan-destination').value.trim();
            if (!country) {
                alert('Please enter a destination country first.');
                return;
            }

            uniStatus.style.display  = 'block';
            uniStatus.textContent    = '⏳ Searching universities...';
            uniDropdown.style.display = 'none';

            try {
                // Fetch universities via our local PHP proxy.
                // universities.hipolabs.com is HTTP-only, which browsers block on HTTPS
                // pages (mixed-content policy). The PHP proxy fetches it server-side.
                const res  = await fetch(
                    `university_proxy.php?country=${encodeURIComponent(country)}`
                );
                const data = await res.json();

                if (!Array.isArray(data) || data.length === 0) {
                    uniStatus.textContent = `No universities found for "${country}". Try the full country name in English (e.g. "Germany", "Japan").`;
                    return;
                }

                // Populate the dropdown with university names from the API
                uniDropdown.innerHTML = '<option value="">— Select a university —</option>';
                data.forEach(uni => {
                    const opt   = document.createElement('option');
                    opt.value   = uni.name;
                    opt.textContent = uni.name;
                    uniDropdown.appendChild(opt);
                });

                uniDropdown.style.display = 'block';
                uniStatus.textContent = `✅ Found ${data.length} universities. Select one to fill the field.`;

            } catch (err) {
                uniStatus.textContent = '❌ Could not reach the universities API. Please try again.';
            }
        });
    }

    // When the user selects a university, copy it into the text input
    // so it gets included in the form submission and saved to the database
    if (uniDropdown) {
        uniDropdown.addEventListener('change', () => {
            if (uniDropdown.value && uniInput) {
                uniInput.value = uniDropdown.value;
            }
        });
    }


    // ═════════════════════════════════════════════════════════════════
    // DEADLINE EMAIL NOTIFICATIONS
    // ─────────────────────────────────────────────────────────────────
    // When the user clicks "Email Me My Deadlines" on the Profile page,
    // JavaScript reads the deadlines from localStorage and POSTs them
    // to notify.php. That script sends a formatted email to the address
    // the user registered with, via the Brevo Transactional Email API.
    // The user must be logged in — the recipient address comes from the
    // server-side session, not from client input.
    // ═════════════════════════════════════════════════════════════════
    const sendReminderBtn    = document.getElementById('send-reminder-btn');
    const reminderStatusEl   = document.getElementById('reminder-status');

    if (sendReminderBtn) {
        sendReminderBtn.addEventListener('click', async () => {
            if (!isLoggedIn) {
                alert('You must be logged in to send email reminders.');
                loginModal.classList.remove('hidden');
                return;
            }

            const deadlines = loadDeadlines();
            if (deadlines.length === 0) {
                if (reminderStatusEl) {
                    reminderStatusEl.style.display = 'block';
                    reminderStatusEl.style.color   = '#6b7280';
                    reminderStatusEl.textContent   = 'You have no deadlines to send.';
                }
                return;
            }

            sendReminderBtn.disabled    = true;
            sendReminderBtn.textContent = '⏳ Sending...';

            try {
                const res  = await fetch('notify.php', {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({ deadlines }),
                });
                const data = await res.json();

                if (reminderStatusEl) {
                    reminderStatusEl.style.display = 'block';
                    if (res.ok) {
                        reminderStatusEl.style.color = '#10b981';
                        reminderStatusEl.textContent = '✅ ' + data.message;
                    } else {
                        reminderStatusEl.style.color = '#ef4444';
                        reminderStatusEl.textContent = '❌ ' + (data.error || 'Could not send email.');
                    }
                }
            } catch (err) {
                console.error('Notification error:', err);
                if (reminderStatusEl) {
                    reminderStatusEl.style.display = 'block';
                    reminderStatusEl.style.color   = '#ef4444';
                    reminderStatusEl.textContent   = '❌ Could not reach the server. Please try again.';
                }
            } finally {
                sendReminderBtn.disabled    = false;
                sendReminderBtn.textContent = '📧 Email Me My Deadlines';
            }
        });
    }

});
