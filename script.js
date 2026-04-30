document.addEventListener('DOMContentLoaded', () => {
    // --- 1. AUTH LOGIC ---
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

    let isLoggedIn = false;
    let currentUserRole = 'user';

    // Open Modal
    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                loginModal.classList.remove('hidden');
            }
        });
    }

    // Close Modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });
    }

    // Handle Login Submit
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('login-email').value;
            const passwordInput = document.getElementById('login-password').value;

            const formData = new FormData();
            formData.append('email', emailInput);
            formData.append('password', passwordInput);

            try {
                const response = await fetch('auth.php?action=login', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    isLoggedIn = true;
                    currentUserRole = data.role || 'user';
                    loginModal.classList.add('hidden');
                    loginForm.reset();

                    userGreeting.textContent = `Welcome, ${data.name || emailInput}`;
                    authBtn.classList.add('hidden');
                    logoutBtn.classList.remove('hidden');

                    profileName.textContent = data.name || emailInput;
                    profileStatus.textContent = currentUserRole.toUpperCase();
                    profileInputName.value = data.name || '';
                    profileInputEmail.value = emailInput;

                    alert("Login successful!");
                    switchView('dashboard-view');
                } else {
                    alert("Error: " + (data.message || "Invalid credentials. Please try again."));
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Server connection failed. Make sure your backend is uploaded properly.");
            }
        });
    }

    // Handle Registration
    const modalRegisterBtn = document.getElementById('modal-register-btn');
    if (modalRegisterBtn) {
        modalRegisterBtn.addEventListener('click', async () => {
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const name = prompt("Please enter your name for registration:");

            if (!name || !email || !password) {
                alert("Name, email, and password are all required to register!");
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);

            try {
                const response = await fetch('auth.php?action=register', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    alert(data.message);
                    loginForm.reset();
                } else {
                    alert("Error: " + (data.message || "User already exists or invalid data."));
                }
            } catch (err) {
                console.error("Registration error:", err);
                alert("Could not connect to the database/server.");
            }
        });
    }

    // Handle Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            isLoggedIn = false;
            userGreeting.textContent = "Welcome, Guest";
            authBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            
            profileName.textContent = "Guest User";
            profileStatus.textContent = "Not Logged In";
            profileInputName.value = "Guest User";
            profileInputEmail.value = "guest@example.com";
            
            alert("You have been logged out.");
            switchView('dashboard-view');
        });
    }

    // Handle Profile Deletion
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', async () => {
            if (confirm("WARNING: This action is permanent and will delete all associated data.")) {
                try {
                    const response = await fetch('auth.php?action=delete', {
                        method: 'POST'
                    });

                    const data = await response.json();

                    if (response.ok && data.status === 'success') {
                        alert(data.message);
                        logoutBtn.click();
                    } else {
                        alert("Failed to delete profile: " + data.message);
                    }
                } catch (err) {
                    console.error("Error:", err);
                    alert("Server connection failed.");
                }
            }
        });
    }

    // --- 2. CREATE PLAN LOGIC ---
    const planForm = document.getElementById('plan-form');
    const savePlanBtn = document.getElementById('save-plan-btn');

    if (savePlanBtn && planForm) {
        savePlanBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const destination = document.getElementById('destination').value;
            const university = document.getElementById('university').value;
            const startDate = document.getElementById('start-date').value;

            if (!destination || !university) {
                alert("Please fill in all required fields (Destination, University).");
                return;
            }

            const formData = new FormData();
            formData.append('destination', destination);
            formData.append('university', university);
            formData.append('start_date', startDate);

            try {
                const response = await fetch('plans.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();

                if (response.ok && data.status === 'success') {
                    alert(data.message);
                    planForm.reset();
                    switchView('dashboard-view');
                } else {
                    alert("Error: " + (data.message || "Failed to save plan."));
                }
            } catch (err) {
                console.error("Error writing plan:", err);
                alert("Connection failed. Check if you are logged in.");
            }
        });
    }

    // --- 3. CRUD SEARCH LOGIC ---
    // Function to search plans (can be attached to a search bar)
    async function searchPlans(query = '') {
        try {
            const response = await fetch(`plans.php?search=${encodeURIComponent(query)}`);
            const data = await response.json();
            
            console.log("Search Results: ", data);
            // Print the corresponding info to the page (e.g. to a list element)
            return data;
        } catch (err) {
            console.error("Failed to search database:", err);
        }
    }
    window.searchPlans = searchPlans;

    // --- 4. NAVIGATION / SPA LOGIC ---
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
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
    
    window.switchView = switchView;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            switchView(target);
        });
    });

    // Load tasks if available
    const taskList = document.getElementById('task-list');
    const newTaskInput = document.getElementById('new-task-input');
    const addTaskBtn = document.getElementById('add-task-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const completedCountEl = document.getElementById('completed-count');
    const totalCountEl = document.getElementById('total-count');
    
    let tasks = [];
    let currentFilter = 'all';

    function loadTasks() {
        const savedTasks = localStorage.getItem('globePlannerTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        } else {
            tasks = [
                { id: 1, text: 'Apply for student visa', completed: false, createdAt: new Date().toISOString() }
            ];
            saveTasks();
            renderTasks();
        }
    }

    function saveTasks() {
        localStorage.setItem('globePlannerTasks', JSON.stringify(tasks));
    }

    function addTask() {
        const text = newTaskInput.value.trim();
        if (text === '') return;
        tasks.unshift({ id: Date.now(), text, completed: false, createdAt: new Date().toISOString() });
        saveTasks();
        renderTasks();
        newTaskInput.value = '';
    }

    function deleteTask(id) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
    }

    function toggleTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
        }
    }

    function renderTasks() {
        if (!taskList) return;
        taskList.innerHTML = '';
        let f = tasks.filter(t => currentFilter === 'all' || (currentFilter === 'active' && !t.completed) || (currentFilter === 'completed' && t.completed));

        if (f.length === 0) taskList: taskList
        f.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = `task-item ${task.completed ? 'completed' : ''}`;
            taskEl.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <button class="delete-task-btn">&times;</button>
            `;
            taskEl.querySelector('.task-checkbox').addEventListener('change', () => toggleTask(task.id));
            taskEl.querySelector('.delete-task-btn').addEventListener('click', () => deleteTask(task.id));
            taskList.appendChild(taskEl);
        });
    }

    if (addTaskBtn) addTaskBtn.addEventListener('click', addTask);
    loadTasks();
});
