document.addEventListener('DOMContentLoaded', () => {
    // 1. View switching functionality
    const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.getAttribute('data-target');
            
            navItems.forEach(i => i.classList.remove('active'));
            viewSections.forEach(v => v.classList.remove('active'));
            
            item.classList.add('active');
            document.getElementById(target).classList.add('active');
        });
    });

    // 2. Modal Handling
    const authBtn = document.getElementById('auth-btn');
    const loginModal = document.getElementById('login-modal');
    const closeModal = document.querySelector('.close-modal');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const userGreeting = document.getElementById('user-greeting');
    const modalRegisterBtn = document.getElementById('modal-register-btn');
    const deleteProfileBtn = document.getElementById('delete-profile-btn');
    const savePlanBtn = document.getElementById('save-plan-btn');

    let isLoggedIn = false;
    let currentUserRole = 'user';

    if (authBtn) {
        authBtn.addEventListener('click', () => {
            if (!isLoggedIn) {
                loginModal.classList.remove('hidden');
            }
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            loginModal.classList.add('hidden');
        });
    }

    // 3. Handle Login Submit
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

                    if (userGreeting) userGreeting.textContent = `Welcome, ${data.name || emailInput}`;
                    authBtn.classList.add('hidden');
                    logoutBtn.classList.remove('hidden');

                    // Update UI elements
                    const profileName = document.getElementById('profile-name');
                    const profileStatus = document.getElementById('profile-status');
                    if (profileName) profileName.textContent = data.name || emailInput;
                    if (profileStatus) profileStatus.textContent = currentUserRole.toUpperCase();

                    alert("Login successful!");
                } else {
                    alert("Error: " + (data.message || "Invalid credentials. Please try again."));
                }
            } catch (err) {
                console.error("Login error:", err);
                alert("Server connection failed. Could not reach the database.");
            }
        });
    }

    // 4. Handle Registration Submit
    if (modalRegisterBtn) {
        modalRegisterBtn.addEventListener('click', async () => {
            const emailInput = document.getElementById('login-email').value;
            const passwordInput = document.getElementById('login-password').value;
            const name = prompt("Please enter your name for registration:");

            if (!name || !emailInput || !passwordInput) {
                alert("Name, email, and password are required to register!");
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', emailInput);
            formData.append('password', passwordInput);

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
                    alert("Error: " + (data.message || "User already exists."));
                }
            } catch (err) {
                console.error("Registration error:", err);
                alert("Server connection failed.");
            }
        });
    }

    // 5. Handle Logout Function
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            isLoggedIn = false;
            if (userGreeting) userGreeting.textContent = "Welcome, Guest";
            authBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            document.getElementById('profile-name').textContent = "Guest User";
            document.getElementById('profile-status').textContent = "Not Logged In";
            alert("You have been logged out.");
        });
    }

    // 6. Handle Profile Deletion
    if (deleteProfileBtn) {
        deleteProfileBtn.addEventListener('click', async () => {
            if (confirm("Are you sure you want to delete your profile? This action is permanent!")) {
                try {
                    const response = await fetch('auth.php?action=delete', {
                        method: 'POST'
                    });

                    const data = await response.json();

                    if (response.ok && data.status === 'success') {
                        alert(data.message);
                        logoutBtn.click();
                    } else {
                        alert("Error: " + (data.message || "Failed to delete profile."));
                    }
                } catch (err) {
                    console.error("Error:", err);
                    alert("Server connection failed.");
                }
            }
        });
    }

    // 7. Handle Create/Save Plan
    if (savePlanBtn) {
        savePlanBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const destination = document.getElementById('destination').value;
            const university = document.getElementById('university').value;
            const startDate = document.getElementById('start-date').value;

            if (!destination || !university) {
                alert("Destination and University form fields are required.");
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
                    document.getElementById('plan-form').reset();
                } else {
                    alert("Error: " + (data.message || "Failed to save plan."));
                }
            } catch (err) {
                console.error("Error saving plan:", err);
                alert("Could not save plan. Make sure you are logged in.");
            }
        });
    }
});
