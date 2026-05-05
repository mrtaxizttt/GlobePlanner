<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Globe Planner - Exchange Semester Organizer</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/poppins@5.0.8/index.css">
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- APP SHELL -->
    <div id="app-shell">
        
        <!-- SIDEBAR -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo-small">Globe Planner</div>
            </div>
            <nav class="sidebar-nav">
                <ul>
                    <li class="nav-item active" data-target="dashboard-view">
                        <span class="nav-icon">📊</span> Dashboard
                    </li>
                    <li class="nav-item" data-target="plan-view">
                        <span class="nav-icon">📝</span> Create Plan
                    </li>
                    <li class="nav-item" data-target="profile-view">
                        <span class="nav-icon">👤</span> Profile
                    </li>
                </ul>
            </nav>
            <div class="sidebar-footer">
                <p>&copy; 2026 Globe Planner</p>
            </div>
        </aside>

        <!-- MAIN CONTENT AREA -->
        <main class="main-content">
            
            <!-- VIEW 1: DASHBOARD -->
            <section id="dashboard-view" class="view-section active">
                <header class="top-bar">
                    <h2>Dashboard</h2>
                    <div class="user-pill">
                        <span id="user-greeting">Welcome, Guest</span>
                        <button id="auth-btn" class="auth-btn">Log In</button>
                        <button id="logout-btn" class="auth-btn hidden">Logout</button>
                    </div>
                </header>

                <!-- HERO SECTION -->
                <section class="hero-section">
                    <div class="hero-content">
                        <h1>Plan Your Personal Across the Globe Experience</h1>
                        <p>A centralized hub for courses, deadlines, documents, and destinations. Organize your academic journey seamlessly.</p>
                        <button class="hero-cta-btn" onclick="switchView('plan-view')">Start Planning</button>
                    </div>
                    <div class="hero-image-container">
                        <img src="pic1.JPG" alt="Mountain Campus">
                    </div>
                </section>

                <div class="controls-section">
                    <div class="controls-wrapper">
                        <h3>Accessibility</h3>
                        <div class="control-buttons">
                            <button id="theme-toggle" class="ctrl-btn">Dark Mode</button>
                            <button id="font-size-toggle" class="ctrl-btn">Increase Text</button>
                            <button id="deadline-toggle" class="ctrl-btn">Hide Deadlines</button>
                        </div>
                    </div>
                </div>

                <div class="dashboard-grid">

                    <!-- EDITABLE DESTINATION CARD -->
                    <article class="card destination-card" id="destination-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3>Current Destination</h3>
                            <button id="edit-destination-btn" class="tag" style="cursor:pointer; background:#334155; border:none; color:#94a3b8; font-size:0.75rem; padding:3px 10px;">✏️ Edit</button>
                        </div>
                        <!-- Display mode -->
                        <div id="destination-display">
                            <p id="dest-university-text" style="font-weight:600; margin-bottom:0.3rem;">Sungkyunwan University</p>
                            <p id="dest-country-text" style="color:#94a3b8; font-size:0.9rem; margin-bottom:0.6rem;">South Korea</p>
                            <span class="tag" id="dest-tag1">Bilateral</span>
                            <span class="tag" id="dest-tag2">Fall 2026</span>
                        </div>
                        <!-- Edit mode (hidden by default) -->
                        <div id="destination-edit" style="display:none; margin-top:0.75rem;">
                            <input id="edit-university" type="text" placeholder="University name" style="width:100%; margin-bottom:0.5rem; padding:0.4rem 0.6rem; border-radius:8px; border:1px solid #334155; background:#0f172a; color:inherit; font-size:0.875rem; box-sizing:border-box;">
                            <input id="edit-country" type="text" placeholder="Country" style="width:100%; margin-bottom:0.5rem; padding:0.4rem 0.6rem; border-radius:8px; border:1px solid #334155; background:#0f172a; color:inherit; font-size:0.875rem; box-sizing:border-box;">
                            <input id="edit-tag1" type="text" placeholder="Tag 1 (e.g. Bilateral)" style="width:48%; margin-right:4%; margin-bottom:0.5rem; padding:0.4rem 0.6rem; border-radius:8px; border:1px solid #334155; background:#0f172a; color:inherit; font-size:0.875rem; box-sizing:border-box;">
                            <input id="edit-tag2" type="text" placeholder="Tag 2 (e.g. Fall 2026)" style="width:48%; margin-bottom:0.75rem; padding:0.4rem 0.6rem; border-radius:8px; border:1px solid #334155; background:#0f172a; color:inherit; font-size:0.875rem; box-sizing:border-box;">
                            <button id="save-destination-btn" class="add-task-btn" style="font-size:0.8rem; padding:0.35rem 0.9rem;">Save</button>
                            <button id="cancel-destination-btn" class="tag" style="cursor:pointer; background:#334155; border:none; color:#94a3b8; font-size:0.8rem; padding:0.35rem 0.9rem; border-radius:8px; margin-left:0.5rem;">Cancel</button>
                        </div>
                    </article>

                    <!-- EDITABLE COURSES CARD -->
                    <article class="card courses-card">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h3>Selected Courses</h3>
                            <button id="add-course-btn" class="tag" style="cursor:pointer; background:#334155; border:none; color:#94a3b8; font-size:0.75rem; padding:3px 10px;">+ Add</button>
                        </div>
                        <ul class="course-list" id="course-list-ul"></ul>
                        <!-- Add course input (hidden by default) -->
                        <div id="course-add-row" style="display:none; margin-top:0.75rem; display:none;">
                            <input id="new-course-input" type="text" placeholder="e.g. Machine Learning (6 ECTS)" style="width:100%; margin-bottom:0.5rem; padding:0.4rem 0.6rem; border-radius:8px; border:1px solid #334155; background:#0f172a; color:inherit; font-size:0.875rem; box-sizing:border-box;">
                            <button id="save-course-btn" class="add-task-btn" style="font-size:0.8rem; padding:0.35rem 0.9rem;">Add Course</button>
                            <button id="cancel-course-btn" class="tag" style="cursor:pointer; background:#334155; border:none; color:#94a3b8; font-size:0.8rem; padding:0.35rem 0.9rem; border-radius:8px; margin-left:0.5rem;">Cancel</button>
                        </div>
                    </article>
                </div>

                <!-- ═══════════════════════════════════════════════════════
                     API 1 — STATIC HTML API: REST Countries
                     Fetches fixed country info (flag, region, capital,
                     currency) from restcountries.com for South Korea.
                     No user input — content is the same on every load.
                     Source: https://restcountries.com/v3.1/name/{country}
                ════════════════════════════════════════════════════════ -->
                <article class="card" id="country-info-card" style="margin-top:1.5rem;">
                    <h3>🌍 Destination Country Info</h3>
                    <div id="country-info-content" style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap; margin-top:0.75rem;">
                        <p style="color:#6b7280; font-style:italic;">Loading country data...</p>
                    </div>
                </article>

                <article id="deadlines" class="deadlines-section visible">
                    <h3>Important Deadlines</h3>
                    <div class="deadlines-grid">
                        <div class="card deadline-card">
                            <span class="deadline-date">May 15</span>
                            <p class="deadline-task">Visa Application</p>
                            <span class="status urgent">Urgent</span>
                        </div>
                        <div class="card deadline-card">
                            <span class="deadline-date">June 01</span>
                            <p class="deadline-task">Housing Deposit</p>
                            <span class="status pending">Pending</span>
                        </div>
                        <div class="card deadline-card">
                            <span class="deadline-date">July 10</span>
                            <p class="deadline-task">Flight Booking</p>
                            <span class="status upcoming">Upcoming</span>
                        </div>
                    </div>

                    <!-- TASKS SECTION -->
                    <section id="tasks" class="tasks-section">
                        <h3>My Tasks</h3>
                        <div class="task-input-container">
                            <input type="text" id="new-task-input" placeholder="Add a new task..." maxlength="100">
                            <button id="add-task-btn" class="add-task-btn">Add Task</button>
                        </div>
                        <div class="task-filters">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="active">Active</button>
                            <button class="filter-btn" data-filter="completed">Completed</button>
                        </div>
                        <div class="task-list" id="task-list"></div>
                        <div class="task-stats" id="task-stats">
                            <span id="completed-count">0</span> of <span id="total-count">0</span> tasks completed
                        </div>
                    </section>

                    <section class="gallery-section">
                        <div class="calendar-wrapper">
                            <div class="calendar-container">
                                <div class="calendar-header">
                                    <button id="prev-month" class="cal-nav-btn">&lt;</button>
                                    <h4 id="current-month-year"></h4>
                                    <button id="next-month" class="cal-nav-btn">&gt;</button>
                                </div>
                                <div class="calendar-weekdays">
                                    <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                                </div>
                                <div class="calendar-days" id="calendar-days"></div>
                            </div>
                        </div>
                    </section>
                </article>

                <section id="gallery" class="gallery-section">
                    <h3>Exchange Life Gallery</h3>
                    <div class="gallery-grid">
                        <figure class="gallery-item">
                            <img src="17BD078B-EB8D-4ADD-9C58-D51C32D1B0D4.JPG" alt="Study">
                            <figcaption>Study Space</figcaption>
                        </figure>
                        <figure class="gallery-item">
                            <img src="IMG_3514.JPG" alt="Travel">
                            <figcaption>Culture Experience</figcaption>
                        </figure>
                        <figure class="gallery-item">
                            <img src="IMG_4015.JPG" alt="Campus">
                            <figcaption>Campus Life</figcaption>
                        </figure>
                        <figure class="gallery-item">
                            <img src="IMG_4397.JPG" alt="Group">
                            <figcaption>Friendships</figcaption>
                        </figure>
                        <figure class="gallery-item">
                            <img src="A849C1F1-40B5-41E7-B204-B6F8AD39F313.JPG" alt="Dorm">
                            <figcaption>Exploration</figcaption>
                        </figure>
                    </div>
                </section>

                <section id="media" class="media-section">
                    <h3>Preparation Resources</h3>
                    <div class="video-grid">
                        <div class="video-wrapper">
                            <iframe src="https://www.youtube.com/embed/7u7AIuHksV8" title="Exchange Preparation Guide" allowfullscreen></iframe>
                            <p>Exchange Preparation Guide</p>
                        </div>
                        <div class="video-wrapper">
                            <iframe src="https://www.youtube.com/embed/WHR-826UsoE" title="Student Life Abroad" allowfullscreen></iframe>
                            <p>Student Life & Cultural Adaptation</p>
                        </div>
                    </div>
                </section>
            </section>

            <!-- VIEW 2: CREATE PLAN PAGE -->
            <section id="plan-view" class="view-section">
                <header class="top-bar">
                    <h2>Create Semester Plan</h2>
                    <button class="save-plan-btn" id="save-plan-btn">Save Plan</button>
                </header>
                
                <div class="plan-container">
                    <form id="plan-form" class="plan-form">
                        <fieldset>
                            <legend>Academic Details</legend>

                            <div class="form-group">
                                <label for="plan-destination">Destination Country</label>
                                <input type="text" id="plan-destination" placeholder="e.g., Spain, Germany, Japan" required autocomplete="off">
                            </div>

                            <!-- ═══════════════════════════════════════════════════════
                                 API 2 — DYNAMIC JS API: Open-Meteo Weather
                                 When the user types a country and clicks "Check Weather",
                                 JavaScript first geocodes the query via Open-Meteo's
                                 geocoding API, then fetches the current temperature and
                                 weather code. Both requests go to open-meteo.com — a
                                 free, key-less 3rd-party service. The result is injected
                                 dynamically into #weather-result without a page reload.
                                 Source: https://open-meteo.com/
                            ════════════════════════════════════════════════════════ -->
                            <div class="form-group">
                                <button type="button" id="weather-btn" class="ctrl-btn" style="margin-bottom:0.5rem;">
                                    🌤 Check Weather at Destination
                                </button>
                                <div id="weather-result" style="display:none; background:var(--card-bg,#1e2235); border-radius:12px; padding:0.85rem 1rem; margin-top:0.5rem; font-size:0.9rem;"></div>
                            </div>

                            <!-- ═══════════════════════════════════════════════════════
                                 API 3 — DATABASE-CONNECTED API: Hipolabs Universities
                                 When the user types a country and clicks "Search Universities",
                                 JavaScript fetches a list of universities from the free
                                 Hipolabs API (universities.hipolabs.com). The user selects
                                 a university from the dropdown, which fills the university
                                 field. On form submit, that data is sent to plans.php and
                                 saved to the PostgreSQL database — fulfilling the requirement
                                 that 3rd-party data is retrieved and persisted to the DB.
                                 Source: http://universities.hipolabs.com/
                            ════════════════════════════════════════════════════════ -->
                            <div class="form-group">
                                <label for="plan-university">Host University</label>
                                <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
                                    <input type="text" id="plan-university" placeholder="Type or search below" required style="flex:1;">
                                    <button type="button" id="uni-search-btn" class="ctrl-btn">🔍 Search Universities</button>
                                </div>
                                <!-- Dropdown populated by the Hipolabs API -->
                                <select id="uni-dropdown" style="display:none; width:100%; padding:0.5rem; border-radius:8px; border:1px solid #334155; background:var(--card-bg,#1e2235); color:inherit; font-size:0.9rem;">
                                    <option value="">— Select a university —</option>
                                </select>
                                <p id="uni-status" style="font-size:0.8rem; color:#6b7280; margin-top:0.3rem; display:none;"></p>
                            </div>

                            <div class="form-group">
                                <label for="course-count">Number of Courses</label>
                                <input type="number" id="course-count" min="3" max="10" value="5">
                            </div>
                        </fieldset>
                        <fieldset>
                            <legend>Time & Place</legend>
                            <div class="form-group">
                                <label for="accommodation">Accommodation Type</label>
                                <select id="accommodation">
                                    <option value="dorm">University Dormitory</option>
                                    <option value="apartment">Private Apartment</option>
                                    <option value="homestay">Host Family</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="plan-start-date">Start Date</label>
                                <input type="date" id="plan-start-date">
                            </div>
                        </fieldset>
                        <div class="form-actions">
                            <button type="submit" class="submit-btn">Save & Submit Plan</button>
                            <button type="reset" class="reset-btn">Clear Form</button>
                        </div>
                    </form>

                    <!-- MY PLANS LIST — displayed below the form -->
                    <div class="my-plans-section" style="margin-top: 2rem;">
                        <h3>My Saved Plans</h3>
                        <div class="task-input-container" style="margin-bottom: 1rem;">
                            <input type="text" id="plan-search" placeholder="Search by destination or university...">
                            <button id="plan-search-btn" class="add-task-btn">Search</button>
                        </div>
                        <div id="plans-list">
                            <!-- Plans are loaded dynamically by script.js -->
                        </div>
                    </div>
                </div>
            </section>

            <!-- VIEW 3: PROFILE PAGE -->
            <section id="profile-view" class="view-section">
                <header class="top-bar">
                    <h2>My Profile</h2>
                </header>
                <div class="profile-container">
                    <div class="profile-header-card">
                        <div class="profile-avatar-large">
                            <img src="images/17BD078B-EB8D-4ADD-9C58-D51C32D1B0D4.JPG" alt="Profile">
                        </div>
                        <div class="profile-info">
                            <h3 id="profile-name">Guest User</h3>
                            <p>Exchange Student • Computer Science</p>
                            <span class="tag" id="profile-status">Not Logged In</span>
                        </div>
                    </div>
                    
                    <div class="profile-grid">
                        <div class="card">
                            <h4>Personal Information</h4>
                            <div class="form-group">
                                <label>Full Name</label>
                                <input type="text" id="profile-input-name" value="Guest User" disabled>
                            </div>
                            <div class="form-group">
                                <label>Email</label>
                                <input type="email" id="profile-input-email" value="guest@example.com" disabled>
                            </div>
                            <div class="form-group">
                                <label>Student ID</label>
                                <input type="text" value="STU-0000">
                            </div>
                        </div>
                        <div class="card">
                            <h4>Notification Settings</h4>
                            <div class="form-group">
                                <label>Deadline Reminders</label>
                                <select>
                                    <option>Enabled</option>
                                    <option>Disabled</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Email Updates</label>
                                <select>
                                    <option>Weekly</option>
                                    <option>Daily</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- DANGER ZONE — only visible when logged in -->
                    <div id="danger-zone" class="card hidden" style="margin-top: 1.5rem; border: 2px solid #ef4444;">
                        <h4 style="color: #ef4444;">Danger Zone</h4>
                        <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.9rem;">
                            Permanently delete your account and all associated plans. This action cannot be undone.
                        </p>
                        <button id="delete-account-btn" class="login-submit-btn" style="background: #ef4444;">
                            Delete My Account
                        </button>
                    </div>
                </div>
            </section>

        </main>
    </div>

    <!-- LOGIN / REGISTER MODAL -->
    <div id="login-modal" class="modal hidden">
        <div class="modal-content">
            <span class="close-modal">&times;</span>

            <!-- TAB SWITCHER -->
            <div class="modal-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem;">
                <button id="tab-login" class="login-submit-btn" onclick="showTab('login')" style="flex:1;">Log In</button>
                <button id="tab-register" class="login-submit-btn" onclick="showTab('register')" style="flex:1; background: #7c3aed;">Register</button>
            </div>

            <!-- LOGIN FORM -->
            <div id="form-login">
                <h2>Log In</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="login-email" placeholder="name.surname@vdu.lt" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-password" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="login-submit-btn">Log In</button>
                </form>
            </div>

            <!-- REGISTER FORM (hidden by default) -->
            <div id="form-register" style="display: none;">
                <h2>Create Account</h2>
                <form id="register-form">
                    <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" id="register-name" placeholder="Name Surname" required>
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="register-email" placeholder="name.surname@vdu.lt" required>
                    </div>
                    <div class="form-group">
                        <label>Password <span style="font-size:0.8rem; color:#6b7280;">(min. 8 characters)</span></label>
                        <input type="password" id="register-password" placeholder="••••••••" required minlength="8">
                    </div>
                    <button type="submit" class="login-submit-btn" style="background: #7c3aed;">Create Account</button>
                </form>
            </div>

        </div>
    </div>

    <script>
        function showTab(tab) {
            document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none';
            document.getElementById('form-register').style.display = tab === 'register' ? 'block' : 'none';
        }
    </script>
    <script src="script.js"></script>
</body>
</html>
