document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LOGIN / AUTH LOGIC ---
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userGreeting = document.getElementById('user-greeting');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');

    // Profile Elements
    const profileName = document.getElementById('profile-name');
    const profileStatus = document.getElementById('profile-status');
    const profileInputName = document.getElementById('profile-input-name');
    const profileInputEmail = document.getElementById('profile-input-email');

    const DEMO_USER = {
        email: "mariia.furdas@university.edu",
        password: "Furdas1980",
        name: "Mariia Furdas"
    };

    let isLoggedIn = false;

    // Open Modal
    authBtn.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    // Close Modal
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('login-email');
        const passwordInput = document.getElementById('login-password');
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        console.log("Attempting login with:", email);

        if (email === DEMO_USER.email && password === DEMO_USER.password) {
            isLoggedIn = true;
            loginModal.classList.add('hidden');
            loginForm.reset();
            updateUIForLogin(DEMO_USER);
            console.log("Login successful!");
        } else {
            alert("Invalid credentials. Please try again.\n\nUse:\nEmail: mariia.furdas@university.edu\nPassword: Furdas1980");
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        isLoggedIn = false;
        userGreeting.textContent = "Welcome, Guest";
        authBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        
        // Reset Profile View
        profileName.textContent = "Guest User";
        profileStatus.textContent = "Not Logged In";
        profileInputName.value = "Guest User";
        profileInputEmail.value = "guest@example.com";
        
        switchView('dashboard-view');
    });

    function updateUIForLogin(user) {
        // Update greeting
        userGreeting.textContent = `Welcome, ${user.name.split(' ')[0]}`;
        
        // Toggle buttons
        authBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');

        // Update Profile View
        profileName.textContent = user.name;
        profileStatus.textContent = "Active Student";
        profileStatus.classList.remove('tag');
        profileStatus.style.background = '#10b981';
        profileStatus.style.color = 'white';
        profileInputName.value = user.name;
        profileInputEmail.value = user.email;
        
        console.log("UI updated for user:", user.name);
    }

    // --- 2. NAVIGATION / SPA LOGIC ---
    const navItems = document.querySelectorAll('.nav-item[data-target]');
    const viewSections = document.querySelectorAll('.view-section');

    function switchView(targetId) {
        navItems.forEach(item => {
            if (item.getAttribute('data-target') === targetId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        viewSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
        
        document.querySelector('.main-content').scrollTop = 0;
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    // --- 3. ACCESSIBILITY CONTROLS ---
    const themeBtn = document.getElementById('theme-toggle');
    const fontBtn = document.getElementById('font-size-toggle');
    const deadlineBtn = document.getElementById('deadline-toggle');
    const deadlinesContainer = document.getElementById('deadlines');
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeBtn.textContent = isDark ? 'Light Mode' : 'Dark Mode';
    });

    let fontSizeStep = 0;
    fontBtn.addEventListener('click', () => {
        fontSizeStep = (fontSizeStep + 1) % 3;
        const newSize = 16 + (fontSizeStep * 2);
        document.documentElement.style.setProperty('--font-base', `${newSize}px`);
        fontBtn.textContent = `Text Size: ${newSize}px`;
    });

    deadlineBtn.addEventListener('click', () => {
        deadlinesContainer.classList.toggle('hidden');
        const isHidden = deadlinesContainer.classList.contains('hidden');
        deadlineBtn.textContent = isHidden ? 'Show Deadlines' : 'Hide Deadlines';
    });

    // --- 4. CALENDAR LOGIC ---
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthYear = document.getElementById('current-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');

    let calDate = new Date();
    const today = new Date();
    const demoDeadlines = [
        { month: 5, day: 15, label: 'Visa Application' },
        { month: 6, day: 1, label: 'Housing Deposit' },
        { month: 7, day: 10, label: 'Flight Booking' }
    ];

    function renderCalendar() {
        const year = calDate.getFullYear();
        const month = calDate.getMonth();
        currentMonthYear.textContent = `${calDate.toLocaleString('default', { month: 'long' })} ${year}`;
        calendarDays.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
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
            
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayDiv.classList.add('today');
            }
            
            const hasDeadline = demoDeadlines.some(d => d.month === month + 1 && d.day === day);
            if (hasDeadline) {
                dayDiv.classList.add('deadline');
                dayDiv.title = "Deadline";
                dayDiv.addEventListener('click', () => alert(`Deadline: ${demoDeadlines.find(d => d.month === month + 1 && d.day === day).label}`));
            }
            calendarDays.appendChild(dayDiv);
        }
    }

    prevMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { calDate.setMonth(calDate.getMonth() + 1); renderCalendar(); });

    // Initialize Calendar
    renderCalendar();

    // --- 5. PLAN FORM LOGIC ---
    const planForm = document.getElementById('plan-form');
    const savePlanBtn = document.getElementById('save-plan-btn');

    function savePlan(e) {
        e.preventDefault();
        
        if (!isLoggedIn) {
            alert("You must be logged in to save a plan! Please click 'Log In' in the top right corner.");
            loginModal.classList.remove('hidden');
            return;
        }
        
        alert("Semester plan saved successfully!");
        planForm.reset();
        switchView('dashboard-view'); 
    }

    planForm.addEventListener('submit', savePlan);
    savePlanBtn.addEventListener('click', (e) => {
        planForm.dispatchEvent(new Event('submit'));
    });
    
    // Make switchView globally accessible for the hero button
    window.switchView = switchView;
        // --- 6. TASK MANAGEMENT ---
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const completedCountEl = document.getElementById('completed-count');
    const totalCountEl = document.getElementById('total-count');
    
    let tasks = [];
    let currentFilter = 'all';

    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('globePlannerTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        } else {
            // Add some default tasks for demo
            tasks = [
                { id: 1, text: 'Apply for student visa', completed: false, createdAt: new Date().toISOString() },
                { id: 2, text: 'Book accommodation', completed: false, createdAt: new Date().toISOString() },
                { id: 3, text: 'Register for courses', completed: true, createdAt: new Date().toISOString() }
            ];
            saveTasks();
            renderTasks();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('globePlannerTasks', JSON.stringify(tasks));
    }

    // Generate unique ID
    function generateId() {
        return Date.now() + Math.random();
    }

    // Add new task
    function addTask() {
        const text = newTaskInput.value.trim();
        if (text === '') {
            alert('Please enter a task');
            return;
        }

        const newTask = {
            id: generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        newTaskInput.value = '';
        newTaskInput.focus();
    }

    // Toggle task completion
    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    // Delete task
    function deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            tasks = tasks.filter(t => t.id !== id);
            saveTasks();
            renderTasks();
        }
    }

    // Filter tasks
    function filterTasks(filter) {
        currentFilter = filter;
        
        // Update active filter button
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        renderTasks();
    }

    // Render tasks
    function renderTasks() {
        taskList.innerHTML = '';
        
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(t => t.completed);
        }

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="task-empty">
                    <div class="task-empty-icon">📋</div>
                    <p>No tasks found</p>
                </div>
            `;
        } else {
            filteredTasks.forEach(task => {
                const taskEl = createTaskElement(task);
                taskList.appendChild(taskEl);
            });
        }

        updateStats();
    }

    // Create task element
    function createTaskElement(task) {
        const taskEl = document.createElement('div');
        taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'task-checkbox';
        checkbox.checked = task.completed;
        checkbox.addEventListener('change', () => toggleTask(task.id));
        
        const textSpan = document.createElement('span');
        textSpan.className = 'task-text';
        textSpan.textContent = task.text;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'task-date';
        const date = new Date(task.createdAt);
        dateSpan.textContent = date.toLocaleDateString();
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-task-btn';
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete task';
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskEl.appendChild(checkbox);
        taskEl.appendChild(textSpan);
        taskEl.appendChild(dateSpan);
        taskEl.appendChild(deleteBtn);
        
        return taskEl;
    }

    // Update task statistics
    function updateStats() {
        const completed = tasks.filter(t => t.completed).length;
        const total = tasks.length;
        
        completedCountEl.textContent = completed;
        totalCountEl.textContent = total;
    }

    // Event listeners for tasks
    addTaskBtn.addEventListener('click', addTask);
    
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTasks(btn.dataset.filter);
        });
    });

    // Load tasks on page load
    loadTasks();
});