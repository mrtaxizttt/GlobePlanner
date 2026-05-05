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
    // 11. CALENDAR
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

        daysEl.innerHTML = '';
        for (let i = 0; i < firstDay; i++) daysEl.innerHTML += '<div></div>';
        for (let d = 1; d <= daysCount; d++) {
            const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
            daysEl.innerHTML += `<div class="cal-day${isToday ? ' today' : ''}">${d}</div>`;
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


    // ═════════════════════════════════════════════════════════════════
    // API 1 — STATIC HTML API: REST Countries
    // ─────────────────────────────────────────────────────────────────
    // Fetches fixed data about South Korea from restcountries.com.
    // This is a Static API because:
    //   - The target country (South Korea) is hardcoded, not user-supplied.
    //   - The content is the same every time the page loads.
    //   - No user input is processed.
    // External service: https://restcountries.com/v3.1/name/{country}
    // No API key required — the service is public and free.
    // ═════════════════════════════════════════════════════════════════
    async function loadCountryInfo() {
        const container = document.getElementById('country-info-content');
        if (!container) return;

        try {
            // Request data for the hardcoded destination country: South Korea
            const res  = await fetch('https://restcountries.com/v3.1/name/south%20korea?fullText=true');
            const data = await res.json();
            const c    = data[0]; // The API returns an array; we take the first result

            // Extract the fields we want to display
            const flag     = c.flags.svg;
            const capital  = c.capital?.[0] ?? 'N/A';
            const region   = c.region;
            const pop      = c.population.toLocaleString();
            const currency = Object.values(c.currencies)[0];
            const lang     = Object.values(c.languages)[0];

            // Inject the data into the DOM as a styled info card
            container.innerHTML = `
                <img src="${flag}" alt="Flag of South Korea"
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

    // Run once on page load — no user interaction needed
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
                // Fetch universities from the Hipolabs API for the given country
                const res  = await fetch(
                    `https://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`
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
                uniStatus.textContent = ` Found ${data.length} universities. Select one to fill the field.`;

            } catch (err) {
                uniStatus.textContent = ' Could not reach the universities API. Please try again.';
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

});
