document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const role = document.getElementById("role").value;

            if (role === "student") {
                window.location.href = "student-dashboard.html";
            }

            else if (role === "teacher") {
                window.location.href = "teacher-dashboard.html";
            }

            else if (role === "admin") {
                window.location.href = "admin-dashboard.html";
            }

            else {
                alert("Please select your role.");
            }

        });

    }

});

/* =========================================================
   EDUCONNECT - SHARED JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. LOGIN PAGE
   Handles role-based navigation from index.html
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const role = document.getElementById("role").value;
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            /* Check whether a role is selected */
            if (!role) {
                alert("Please select your role.");
                return;
            }

            /* Check username and password */
            if (!username || !password) {
                alert("Please enter your username and password.");
                return;
            }

            /* Store the logged-in user's name */
            localStorage.setItem("educonnectUser", username);
            localStorage.setItem("educonnectRole", role);

            /* Redirect according to role */
            if (role === "student") {

                window.location.href = "student-dashboard.html";

            } else if (role === "teacher") {

                window.location.href = "teacher-dashboard.html";

            } else if (role === "admin") {

                window.location.href = "admin-dashboard.html";

            }

        });

    }


    /* =====================================================
       2. STUDENT DASHBOARD
       ===================================================== */

    const dashboard = document.querySelector(".dashboard");

    if (dashboard) {

        /* Get stored user information */
        const storedUser = localStorage.getItem("educonnectUser");

        /*
         * If a username was entered during login,
         * display it on the dashboard.
         */
        if (storedUser) {

            const profileName =
                document.querySelector(".profile-name");

            const dashboardHeading =
                document.querySelector(".dashboard-heading h1");

            if (profileName) {
                profileName.textContent = storedUser;
            }

            if (dashboardHeading) {
                dashboardHeading.innerHTML =
                    `Good Morning, ${storedUser}! 👋`;
            }

        }


        /* =================================================
           3. DASHBOARD NAVIGATION
           ================================================= */

        const navLinks =
            document.querySelectorAll(".sidebar-nav .nav-link");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                /* Remove active class from all links */
                navLinks.forEach(function (item) {
                    item.classList.remove("active");
                });

                /* Add active class to selected link */
                this.classList.add("active");

            });

        });


        /* =================================================
           4. NOTIFICATION BUTTON
           ================================================= */

        const notification =
            document.querySelector(".notification");

        if (notification) {

            notification.addEventListener("click", function () {

                alert(
                    "You have 3 pending assignments and 1 new study material."
                );

            });

        }

    }

});


/* =========================================================
   ASSIGNMENTS PAGE
   ========================================================= */


/* ---------------------------------------------------------
   Assignment Filter
   --------------------------------------------------------- */

const assignmentFilter =
    document.getElementById("assignmentFilter");

if (assignmentFilter) {

    assignmentFilter.addEventListener("change", function () {

        const selectedStatus = this.value;

        const assignments =
            document.querySelectorAll(".assignment-item");

        assignments.forEach(function (assignment) {

            const status =
                assignment.dataset.status;

            if (
                selectedStatus === "all" ||
                selectedStatus === status
            ) {

                assignment.style.display = "flex";

            } else {

                assignment.style.display = "none";

            }

        });

    });

}


/* ---------------------------------------------------------
   Selected Assignment
   --------------------------------------------------------- */

let selectedAssignment = "";


/* ---------------------------------------------------------
   Open Assignment Submission Modal
   --------------------------------------------------------- */

function openAssignment(assignmentName) {

    selectedAssignment = assignmentName;

    const modal =
        document.getElementById("assignmentModal");

    const title =
        document.getElementById("modalAssignmentName");

    if (modal && title) {

        title.textContent =
            "Submit: " + assignmentName;

        modal.style.display = "flex";

    }

}


/* ---------------------------------------------------------
   Close Assignment Submission Modal
   --------------------------------------------------------- */

function closeAssignmentModal() {

    const modal =
        document.getElementById("assignmentModal");

    if (modal) {

        modal.style.display = "none";

    }

}


/* ---------------------------------------------------------
   Submit Assignment
   --------------------------------------------------------- */

function submitAssignment() {

    const fileInput =
        document.getElementById("assignmentFile");

    if (
        !fileInput ||
        fileInput.files.length === 0
    ) {

        alert(
            "Please select a file before submitting."
        );

        return;

    }


    const fileName =
        fileInput.files[0].name;


    alert(
        "Assignment submitted successfully!\n\n" +
        "Assignment: " +
        selectedAssignment +
        "\nFile: " +
        fileName
    );


    /* Close modal */
    closeAssignmentModal();


    /* Clear selected file */
    fileInput.value = "";

}


/* ---------------------------------------------------------
   View Completed Assignment
   --------------------------------------------------------- */

function viewAssignment(assignmentName) {

    alert(
        assignmentName +
        "\n\nThis assignment has already been submitted."
    );

}

/* =========================================================
   STUDY MATERIALS PAGE
   ========================================================= */


/* ---------------------------------------------------------
   Material Filter
   --------------------------------------------------------- */

const materialFilter =
    document.getElementById("materialFilter");

if (materialFilter) {

    materialFilter.addEventListener("change", function () {

        const selectedSubject = this.value;

        const materials =
            document.querySelectorAll(".material-item");

        materials.forEach(function (material) {

            const subject =
                material.dataset.subject;

            if (
                selectedSubject === "all" ||
                selectedSubject === subject
            ) {

                material.style.display = "flex";

            } else {

                material.style.display = "none";

            }

        });

    });

}


/* ---------------------------------------------------------
   Open Material
   --------------------------------------------------------- */

function openMaterial(materialName) {

    alert(
        materialName +
        "\n\nThe material will open here."
    );

}