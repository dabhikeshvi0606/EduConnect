/* =========================================================
   EDUCONNECT - SHARED JAVASCRIPT
   ========================================================= */


/* =========================================================
   1. LOGIN PAGE
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const role = document.getElementById("role").value;
            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!role) {
                alert("Please select your role.");
                return;
            }

            if (!username || !password) {
                alert("Please enter your username and password.");
                return;
            }

            /*
             * Temporary login storage.
             * Real authentication will be connected
             * to Spring Boot later.
             */
            localStorage.setItem("educonnectUser", username);
            localStorage.setItem("educonnectRole", role);

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
       2. DASHBOARD NAVIGATION
       ===================================================== */

    const dashboard = document.querySelector(".dashboard");

    if (dashboard) {

        const navLinks =
            document.querySelectorAll(".sidebar-nav .nav-link");

        navLinks.forEach(function (link) {

            link.addEventListener("click", function () {

                navLinks.forEach(function (item) {
                    item.classList.remove("active");
                });

                this.classList.add("active");

            });

        });


        /* =================================================
           3. NOTIFICATION BUTTON
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
   4. LOAD STUDENT DATA FROM SPRING BOOT API
   ========================================================= */

async function loadStudentData() {

    try {

        const response =
            await fetch("http://localhost:8080/api/students");

        if (!response.ok) {
            throw new Error("Failed to fetch student data.");
        }

        const students = await response.json();

        /*
         * For now, we are using the first student
         * from the database.
         *
         * Later this will use the logged-in student's ID.
         */
        if (students.length === 0) {

            console.log("No student found in database.");
            return;

        }

        const student = students[0];


        /* -------------------------------------------------
           Welcome Message
           ------------------------------------------------- */

        const welcomeMessage =
            document.getElementById("welcome-message");

        if (welcomeMessage) {

            welcomeMessage.textContent =
                `Good Morning, ${student.name}! 👋`;

        }


        /* -------------------------------------------------
           Profile Name
           ------------------------------------------------- */

        const profileName =
            document.getElementById("profile-name");

        if (profileName) {

            profileName.textContent =
                student.name;

        }


        /* -------------------------------------------------
           Profile Avatar
           ------------------------------------------------- */

        const profileAvatar =
            document.getElementById("profile-avatar");

        if (profileAvatar) {

            profileAvatar.textContent =
                student.name.charAt(0).toUpperCase();

        }


        /* -------------------------------------------------
           Student Information
           ------------------------------------------------- */

        const studentInfo =
            document.getElementById("student-info");

        if (studentInfo) {

            studentInfo.textContent =
                `${student.rollNumber} • ${student.department} • Year ${student.year}`;

        }

    }

    catch (error) {

        console.error(
            "Error loading student data:",
            error
        );

    }

}


/* =========================================================
   5. LOAD STUDENT DATA WHEN DASHBOARD OPENS
   ========================================================= */

if (document.querySelector(".dashboard")) {

    loadStudentData();

}


/* =========================================================
   6. ASSIGNMENTS PAGE
   ========================================================= */


/* ---------------------------------------------------------
   Assignment Filter
   --------------------------------------------------------- */

const assignmentFilter =
    document.getElementById("assignmentFilter");

if (assignmentFilter) {

    assignmentFilter.addEventListener("change", function () {

        const selectedStatus = (this.value || "all").toLowerCase();

        const assignments =
            document.querySelectorAll(".assignment-item");

        assignments.forEach(function (assignment) {

            const status =
                (assignment.dataset.status || "").toLowerCase();

            if (
                selectedStatus === "all" ||
                selectedStatus === status ||
                (selectedStatus === "completed" && (status === "completed" || status === "submitted"))
            ) {

                assignment.style.display = "flex";

            } else {

                assignment.style.display = "none";

            }

        });

    });

}


/* ---------------------------------------------------------
   Selected Assignment State
   --------------------------------------------------------- */

let selectedAssignmentId = null;
let selectedAssignmentTitle = "";


/* ---------------------------------------------------------
   Open Assignment Submission Modal
   --------------------------------------------------------- */

function openAssignment(assignmentId, assignmentTitle) {

    selectedAssignmentId = assignmentId;
    selectedAssignmentTitle = assignmentTitle;

    const modal =
        document.getElementById("assignmentModal");

    const title =
        document.getElementById("modalAssignmentName");

    const fileInput =
        document.getElementById("assignmentFile");

    const feedback =
        document.getElementById("modalFeedback");

    const submitBtn =
        document.getElementById("submitAssignmentBtn");

    if (fileInput) {
        fileInput.value = "";
    }

    if (feedback) {
        feedback.style.display = "none";
        feedback.textContent = "";
        feedback.className = "modal-feedback";
    }

    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Assignment";
    }

    if (modal && title) {

        title.textContent =
            "Submit: " + assignmentTitle;

        modal.style.display = "flex";

    }

}


/* ---------------------------------------------------------
   Close Assignment Submission Modal
   --------------------------------------------------------- */

function closeAssignmentModal() {

    const modal =
        document.getElementById("assignmentModal");

    const fileInput =
        document.getElementById("assignmentFile");

    const feedback =
        document.getElementById("modalFeedback");

    if (fileInput) {
        fileInput.value = "";
    }

    if (feedback) {
        feedback.style.display = "none";
        feedback.textContent = "";
        feedback.className = "modal-feedback";
    }

    if (modal) {

        modal.style.display = "none";

    }

    selectedAssignmentId = null;
    selectedAssignmentTitle = "";

}


/* ---------------------------------------------------------
   Submit Assignment (Multipart File Upload to Backend)
   --------------------------------------------------------- */

async function submitAssignment() {

    const fileInput =
        document.getElementById("assignmentFile");

    const feedback =
        document.getElementById("modalFeedback");

    const submitBtn =
        document.getElementById("submitAssignmentBtn");

    function setFeedback(message, type) {
        if (feedback) {
            feedback.textContent = message;
            feedback.className = "modal-feedback " + type;
            feedback.style.display = "block";
        } else {
            alert(message);
        }
    }

    if (!selectedAssignmentId) {
        setFeedback("No assignment selected. Please close and re-open the modal.", "error");
        return;
    }

    if (
        !fileInput ||
        !fileInput.files ||
        fileInput.files.length === 0
    ) {

        setFeedback("Please select a PDF file before submitting.", "error");
        return;

    }

    const file = fileInput.files[0];
    const fileName = (file.name || "").toLowerCase();

    if (!fileName.endsWith(".pdf")) {
        setFeedback("Only PDF files (.pdf) are permitted.", "error");
        return;
    }

    if (file.size > 10 * 1024 * 1024) {
        setFeedback("File size must be 10 MB or smaller.", "error");
        return;
    }

    // Set UI loading state
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Uploading PDF...";
    }
    setFeedback("Uploading your assignment to server...", "loading");

    try {
        const studentId = 1;
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch(
            `http://localhost:8080/api/assignments/${selectedAssignmentId}/submit?studentId=${studentId}`,
            {
                method: "POST",
                body: formData
            }
        );

        if (!response.ok) {
            let errorText = "Submission rejected by server (HTTP " + response.status + ").";
            try {
                const errJson = await response.json();
                if (errJson && errJson.message) {
                    errorText = errJson.message;
                }
            } catch (e) {
                try {
                    const text = await response.text();
                    if (text) errorText = text;
                } catch (t) {}
            }

            setFeedback("Error: " + errorText, "error");

            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Assignment";
            }
            return;
        }

        const submission = await response.json();
        console.log("Assignment submission successful:", submission);

        setFeedback("Assignment submitted successfully! Stored on server.", "success");

        // Close modal after brief success confirmation and refresh list
        setTimeout(async function () {
            closeAssignmentModal();
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Assignment";
            }
            await loadAssignments();
        }, 1200);

    } catch (error) {
        console.error("Submission request failed:", error);
        setFeedback("Network error: Could not reach backend server at http://localhost:8080.", "error");

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Submit Assignment";
        }
    }

}


/* ---------------------------------------------------------
   View Completed Assignment
   --------------------------------------------------------- */

function viewAssignment(assignmentName, status) {

    const statusText = status === "submitted"
        ? "submitted and is awaiting review"
        : "completed";

    alert(
        assignmentName +
        "\n\nThis assignment has already been " + statusText + "."
    );

}


/* /* =========================================================
   7. STUDY MATERIALS PAGE
   ========================================================= */


/* ---------------------------------------------------------
   Load Study Materials from Spring Boot
   --------------------------------------------------------- */

async function loadStudyMaterials() {

    try {

        const studentId = 1;

        const response =
            await fetch(
                `http://localhost:8080/api/materials/student/${studentId}`
            );

        if (!response.ok) {
            throw new Error("Failed to fetch study materials.");
        }

        const materials =
            await response.json();

        console.log(
            "Study materials from backend:",
            materials
        );


        /* =================================================
           TOP STATISTICS
           ================================================= */

        const totalMaterials =
            materials.length;

        const notesCount =
            materials.filter(function (material) {
                return material.type === "pdf";
            }).length;

        const videosCount =
            materials.filter(function (material) {
                return material.type === "video";
            }).length;

        const referencesCount =
            materials.filter(function (material) {
                return material.type === "link";
            }).length;


        const statCards =
    document.querySelectorAll(".stat-card");

const statValues = [];

statCards.forEach(function (card) {

    const elements =
        card.querySelectorAll("*");

    let numberElement = null;

    elements.forEach(function (element) {

        const text =
            element.textContent.trim();

        if (
            !numberElement &&
            /^\d+$/.test(text)
        ) {

            numberElement = element;

        }

    });

    if (numberElement) {

        statValues.push(
            numberElement
        );

    }

});


if (statValues.length >= 4) {

    statValues[0].textContent =
        totalMaterials;

    statValues[1].textContent =
        notesCount;

    statValues[2].textContent =
        videosCount;

    statValues[3].textContent =
        referencesCount;

}

        /* =================================================
           SUBJECT CARDS
           ================================================= */

        const materialCards =
            document.querySelectorAll(
                ".materials-card"
            );


        materialCards.forEach(function (card) {

            const heading =
                card.querySelector(
                    ".card-header h2"
                );

            if (!heading) {
                return;
            }


            const subjectName =
                heading.textContent.trim();


            /* ---------------------------------------------
               Get materials for this subject
               --------------------------------------------- */

            const subjectMaterials =
                materials.filter(function (material) {

                    return material.subject === subjectName;

                });


            /* ---------------------------------------------
               Update resource count
               --------------------------------------------- */

            const countElement =
                card.querySelector(
                    ".subject-material-count"
                );

            if (countElement) {

                const count =
                    subjectMaterials.length;

                countElement.textContent =
                    count +
                    (
                        count === 1
                            ? " learning resource"
                            : " learning resources"
                    );
            }


            /* ---------------------------------------------
               Remove old material items
               --------------------------------------------- */

            const oldItems =
                card.querySelectorAll(
                    ".material-item"
                );

            oldItems.forEach(function (item) {

                item.remove();

            });


            /* ---------------------------------------------
               Create new material items
               --------------------------------------------- */

            subjectMaterials.forEach(function (material) {

                const materialItem =
                    document.createElement("div");

                materialItem.className =
                    "material-item";

                materialItem.dataset.subject =
                    material.subject;


                /* -----------------------------------------
                   ICON
                   ----------------------------------------- */

                let iconClass =
                    "pdf";

                let iconText =
                    "PDF";


                if (material.type === "video") {

                    iconClass =
                        "video";

                    iconText =
                        "▶";

                }
                else if (material.type === "link") {

                    iconClass =
                        "link";

                    iconText =
                        "↗";

                }


                /* -----------------------------------------
                   DATE / RESOURCE INFO
                   ----------------------------------------- */

                let resourceText =
                    material.resourceInfo || "";


                if (
                    material.updatedDate &&
                    material.type === "pdf"
                ) {

                    const updatedDate =
                        new Date(
                            material.updatedDate +
                            "T00:00:00"
                        );

                    resourceText =
                        "Updated " +
                        updatedDate.toLocaleDateString(
                            "en-US",
                            {
                                month: "short",
                                day: "numeric"
                            }
                        );
                }


                /* -----------------------------------------
                   BUTTON
                   ----------------------------------------- */

                const buttonText =
                    material.type === "video"
                        ? "Watch"
                        : "Open";


                /* -----------------------------------------
                   MATERIAL HTML
                   ----------------------------------------- */

                materialItem.innerHTML = `

                    <div class="material-icon ${iconClass}">
                        ${iconText}
                    </div>

                    <div class="material-details">

                        <h3>
                            ${material.title}
                        </h3>

                        <p>
                            ${material.description}
                        </p>

                        <span>
                            ${resourceText}
                        </span>

                    </div>

                    <button
                        class="material-button"
                        onclick="openMaterial('${escapeSingleQuote(material.title)}', '${material.url || ''}')">

                        ${buttonText}

                    </button>

                `;


                /* -----------------------------------------
                   ADD TO SUBJECT CARD
                   ----------------------------------------- */

                card.appendChild(
                    materialItem
                );

            });

        });


        /* =================================================
           MATERIAL FILTER
           ================================================= */

        const materialFilter =
            document.getElementById(
                "materialFilter"
            );

        if (materialFilter) {

            materialFilter.dispatchEvent(
                new Event("change")
            );

        }

    }
    catch (error) {

        console.error(
            "Error loading study materials:",
            error
        );

    }

}


/* ---------------------------------------------------------
   Material Filter
   --------------------------------------------------------- */

const materialFilter =
    document.getElementById("materialFilter");

if (materialFilter) {

    materialFilter.addEventListener(
        "change",
        function () {

            const selectedSubject =
                this.value;

            const materials =
                document.querySelectorAll(
                    ".material-item"
                );

            materials.forEach(
                function (material) {

                    const subject =
                        material.dataset.subject;

                    if (
                        selectedSubject === "all" ||
                        selectedSubject === subject
                    ) {

                        material.style.display =
                            "flex";

                    }
                    else {

                        material.style.display =
                            "none";

                    }

                }
            );

        }
    );

}


/* ---------------------------------------------------------
   Verified Educational Resources for Study Materials
   --------------------------------------------------------- */

const EDU_MATERIAL_RESOURCES = {
    "Java OOP Concepts":
        "https://docs.oracle.com/javase/tutorial/java/concepts/index.html",
    "Java Collections Framework":
        "https://docs.oracle.com/javase/tutorial/collections/index.html",
    "SQL & Database Fundamentals":
        "https://www.w3schools.com/sql/default.asp",
    "Introduction to Machine Learning":
        "https://www.youtube.com/watch?v=jGwO_UgTS7I",
    "Cloud Security Fundamentals":
        "https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-145.pdf"
};


/* ---------------------------------------------------------
   Open Material
   --------------------------------------------------------- */

function openMaterial(materialName, directUrl) {

    const targetUrl =
        (directUrl && directUrl.trim() !== "")
            ? directUrl.trim()
            : EDU_MATERIAL_RESOURCES[materialName];

    if (targetUrl) {
        window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
        alert(
            "Resource for \"" + materialName + "\" is not available yet."
        );
    }

}


/* ---------------------------------------------------------
   Start Study Materials Loading
   --------------------------------------------------------- */

if (
    document.querySelector(".materials-card")
) {

    loadStudyMaterials();

}
/* =========================================================
   8. ATTENDANCE PAGE
   ========================================================= */


/* ---------------------------------------------------------
   Load Attendance Data
   --------------------------------------------------------- */

async function loadAttendanceData() {

    try {

        /*
         * Temporary student ID.
         *
         * We are using student ID 1 because authentication
         * is not connected yet.
         *
         * Later this will come from the logged-in student.
         */

        const studentId = 1;


        const response =
            await fetch(
                `http://localhost:8080/api/attendance/student/${studentId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch attendance data."
            );

        }


        const attendanceData =
            await response.json();


        console.log(
            "Attendance data:",
            attendanceData
        );


        /* -------------------------------------------------
           No Attendance Data
           ------------------------------------------------- */

        if (attendanceData.length === 0) {

            document.getElementById(
                "attendance-list"
            ).innerHTML =
                "<p>No attendance records found.</p>";


            document.getElementById(
                "attendance-table-body"
            ).innerHTML = `
                <tr>
                    <td colspan="6">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;

        }


        /* -------------------------------------------------
           Calculate Overall Attendance
           ------------------------------------------------- */

        let totalClasses = 0;

        let totalAttended = 0;


        attendanceData.forEach(function (record) {

            totalClasses +=
                record.totalClasses;

            totalAttended +=
                record.attendedClasses;

        });


        const totalMissed =
            totalClasses - totalAttended;


        let overallPercentage = 0;


        if (totalClasses > 0) {

            overallPercentage =
                (totalAttended / totalClasses) * 100;

        }


        /* -------------------------------------------------
           Update Summary Cards
           ------------------------------------------------- */

        const overallAttendance =
            document.getElementById(
                "overall-attendance"
            );


        if (overallAttendance) {

            overallAttendance.textContent =
                `${overallPercentage.toFixed(1)}%`;

        }


        const classesAttended =
            document.getElementById(
                "classes-attended"
            );


        if (classesAttended) {

            classesAttended.textContent =
                totalAttended;

        }


        const classesTotal =
            document.getElementById(
                "classes-total"
            );


        if (classesTotal) {

            classesTotal.textContent =
                `Out of ${totalClasses} classes`;

        }


        const classesMissed =
            document.getElementById(
                "classes-missed"
            );


        if (classesMissed) {

            classesMissed.textContent =
                totalMissed;

        }


        /* -------------------------------------------------
           Overall Attendance Status
           ------------------------------------------------- */

        const statusElement =
            document.getElementById(
                "attendance-status"
            );


        const statusTextElement =
            document.getElementById(
                "attendance-status-text"
            );


        const statusIcon =
            document.getElementById(
                "attendance-status-icon"
            );


        if (overallPercentage >= 85) {

            if (statusElement) {
                statusElement.textContent =
                    "Excellent";
            }

            if (statusTextElement) {
                statusTextElement.textContent =
                    "Excellent attendance";
            }

            if (statusIcon) {
                statusIcon.textContent =
                    "🟢";
            }

        }

        else if (overallPercentage >= 75) {

            if (statusElement) {
                statusElement.textContent =
                    "Good";
            }

            if (statusTextElement) {
                statusTextElement.textContent =
                    "Above minimum requirement";
            }

            if (statusIcon) {
                statusIcon.textContent =
                    "🟢";
            }

        }

        else {

            if (statusElement) {
                statusElement.textContent =
                    "Low";
            }

            if (statusTextElement) {
                statusTextElement.textContent =
                    "Below minimum requirement";
            }

            if (statusIcon) {
                statusIcon.textContent =
                    "🔴";
            }

        }


        /* -------------------------------------------------
           Subject-wise Attendance
           ------------------------------------------------- */

        const attendanceList =
            document.getElementById(
                "attendance-list"
            );


        if (attendanceList) {

            attendanceList.innerHTML = "";


            attendanceData.forEach(function (record) {

                const percentage =
                    record.totalClasses > 0
                        ? (
                            record.attendedClasses /
                            record.totalClasses
                        ) * 100
                        : 0;


                let progressClass = "";
                let warningHTML = "";


                if (percentage >= 85) {

                    progressClass =
                        "attendance-excellent";

                }

                else if (percentage >= 75) {

                    progressClass =
                        "attendance-good";

                }

                else {

                    progressClass =
                        "attendance-low";


                    warningHTML = `
                        <div class="attendance-warning">
                            ⚠ Attendance below required percentage
                        </div>
                    `;

                }


                const attendanceRow =
                    document.createElement("div");


                attendanceRow.className =
                    "attendance-row";


                attendanceRow.innerHTML = `

                    <div class="attendance-info">

                        <span class="subject-name">
                            ${record.subject}
                        </span>

                        <span class="attendance-percentage">
                            ${percentage.toFixed(1)}%
                        </span>

                    </div>


                    <div class="progress-bar">

                        <div
                            class="progress-fill ${progressClass}"
                            style="width: ${percentage}%;">
                        </div>

                    </div>

                    ${warningHTML}

                `;


                attendanceList.appendChild(
                    attendanceRow
                );

            });

        }


        /* -------------------------------------------------
           Attendance Details Table
           ------------------------------------------------- */

        const tableBody =
            document.getElementById(
                "attendance-table-body"
            );


        if (tableBody) {

            tableBody.innerHTML = "";


            attendanceData.forEach(function (record) {

                const percentage =
                    record.totalClasses > 0
                        ? (
                            record.attendedClasses /
                            record.totalClasses
                        ) * 100
                        : 0;


                const absent =
                    record.totalClasses -
                    record.attendedClasses;


                let statusText = "";
                let statusClass = "";


                if (percentage >= 85) {

                    statusText = "Excellent";
                    statusClass = "excellent";

                }

                else if (percentage >= 75) {

                    statusText = "Good";
                    statusClass = "good";

                }

                else {

                    statusText = "Low";
                    statusClass = "warning";

                }


                const row =
                    document.createElement("tr");


                row.innerHTML = `

                    <td>
                        ${record.subject}
                    </td>

                    <td>
                        ${record.totalClasses}
                    </td>

                    <td>
                        ${record.attendedClasses}
                    </td>

                    <td>
                        ${absent}
                    </td>

                    <td>
                        ${percentage.toFixed(1)}%
                    </td>

                    <td>

                        <span
                            class="attendance-status ${statusClass}">
                            ${statusText}
                        </span>

                    </td>

                `;


                tableBody.appendChild(row);

            });

        }


        /* -------------------------------------------------
           Attendance Insight
           ------------------------------------------------- */

        const insight =
            document.getElementById(
                "attendance-insight"
            );


        if (insight) {

            const lowAttendanceSubjects =
                attendanceData.filter(function (record) {

                    const percentage =
                        record.totalClasses > 0
                            ? (
                                record.attendedClasses /
                                record.totalClasses
                            ) * 100
                            : 0;

                    return percentage < 75;

                });


            if (lowAttendanceSubjects.length > 0) {

                const subjectNames =
                    lowAttendanceSubjects
                        .map(function (record) {
                            return record.subject;
                        })
                        .join(", ");


                insight.textContent =
                    `Your attendance is below the required 75% in ${subjectNames}. Try to attend upcoming classes regularly to improve your attendance.`;

            }

            else {

                insight.textContent =
                    "Your attendance is currently above the required 75% in all subjects. Keep maintaining your regular attendance!";

            }

        }

    }

    catch (error) {

        console.error(
            "Error loading attendance:",
            error
        );


        const attendanceList =
            document.getElementById(
                "attendance-list"
            );


        if (attendanceList) {

            attendanceList.innerHTML =
                "<p>Unable to load attendance data.</p>";

        }


        const tableBody =
            document.getElementById(
                "attendance-table-body"
            );


        if (tableBody) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        Unable to load attendance data.
                    </td>
                </tr>
            `;

        }

    }

}


/* ---------------------------------------------------------
   Load Attendance When Attendance Page Opens
   --------------------------------------------------------- */

if (
    document.getElementById("attendance-list")
) {

    loadAttendanceData();

}
/* =========================================================
   9. STUDENT DASHBOARD ATTENDANCE
   ========================================================= */


/* ---------------------------------------------------------
   Load Dashboard Attendance
   --------------------------------------------------------- */

async function loadDashboardAttendance() {

    try {

        /*
         * Temporary student ID.
         *
         * Later this will come from the
         * logged-in student's account.
         */

        const studentId = 1;


        const response =
            await fetch(
                `http://localhost:8080/api/attendance/student/${studentId}`
            );


        if (!response.ok) {

            throw new Error(
                "Failed to fetch dashboard attendance."
            );

        }


        const attendanceData =
            await response.json();


        console.log(
            "Dashboard attendance:",
            attendanceData
        );


        /* -------------------------------------------------
           Check Data
           ------------------------------------------------- */

        if (attendanceData.length === 0) {

            return;

        }


        /* -------------------------------------------------
           Calculate Overall Attendance
           ------------------------------------------------- */

        let totalClasses = 0;

        let totalAttended = 0;


        attendanceData.forEach(function (record) {

            totalClasses +=
                record.totalClasses;

            totalAttended +=
                record.attendedClasses;

        });


        let overallPercentage = 0;


        if (totalClasses > 0) {

            overallPercentage =
                (totalAttended / totalClasses) * 100;

        }


        /* -------------------------------------------------
           Find Subject With Lowest Attendance
           ------------------------------------------------- */

        let focusSubject =
            attendanceData[0];

        let lowestPercentage =
            attendanceData[0].totalClasses > 0
                ? (
                    attendanceData[0].attendedClasses /
                    attendanceData[0].totalClasses
                ) * 100
                : 0;


        attendanceData.forEach(function (record) {

            const percentage =
                record.totalClasses > 0
                    ? (
                        record.attendedClasses /
                        record.totalClasses
                    ) * 100
                    : 0;


            if (percentage < lowestPercentage) {

                lowestPercentage =
                    percentage;

                focusSubject =
                    record;

            }

        });


        /* -------------------------------------------------
           Attendance Top Stat
           ------------------------------------------------- */

        const dashboardAttendance =
            document.getElementById(
                "dashboard-attendance"
            );


        if (dashboardAttendance) {

            dashboardAttendance.textContent =
                `${overallPercentage.toFixed(1)}%`;

        }


        const dashboardAttendanceSubtext =
            document.getElementById(
                "dashboard-attendance-subtext"
            );


        if (dashboardAttendanceSubtext) {

            dashboardAttendanceSubtext.textContent =
                "Overall attendance";

        }



        /* -------------------------------------------------
           Academic Snapshot - Overall Attendance
           ------------------------------------------------- */

        const overallAttendance =
            document.getElementById(
                "dashboard-overall-attendance"
            );


        if (overallAttendance) {

            overallAttendance.textContent =
                `${overallPercentage.toFixed(1)}%`;

        }


        const progress =
            document.getElementById(
                "dashboard-attendance-progress"
            );


        if (progress) {

            progress.style.width =
                `${overallPercentage}%`;


            /*
             * Change progress color according
             * to attendance percentage.
             */

            progress.classList.remove(
                "attendance-excellent",
                "attendance-good",
                "attendance-low"
            );


            if (overallPercentage >= 85) {

                progress.classList.add(
                    "attendance-excellent"
                );

            }

            else if (overallPercentage >= 75) {

                progress.classList.add(
                    "attendance-good"
                );

            }

            else {

                progress.classList.add(
                    "attendance-low"
                );

            }

        }



        /* -------------------------------------------------
           Classes Attended
           ------------------------------------------------- */

        const classesAttended =
            document.getElementById(
                "dashboard-attendance-classes"
            );


        if (classesAttended) {

            classesAttended.textContent =
                `${totalAttended} out of ${totalClasses} classes`;

        }



        /* -------------------------------------------------
           Attendance Status
           ------------------------------------------------- */

        const attendanceStatus =
            document.getElementById(
                "dashboard-attendance-status"
            );


        const attendanceStatusIcon =
            document.getElementById(
                "dashboard-attendance-status-icon"
            );


        if (overallPercentage >= 85) {

            if (attendanceStatus) {

                attendanceStatus.textContent =
                    "Excellent attendance";

            }


            if (attendanceStatusIcon) {

                attendanceStatusIcon.textContent =
                    "🟢";

            }

        }

        else if (overallPercentage >= 75) {

            if (attendanceStatus) {

                attendanceStatus.textContent =
                    "Above minimum requirement";

            }


            if (attendanceStatusIcon) {

                attendanceStatusIcon.textContent =
                    "🟢";

            }

        }

        else {

            if (attendanceStatus) {

                attendanceStatus.textContent =
                    "Below minimum requirement";

            }


            if (attendanceStatusIcon) {

                attendanceStatusIcon.textContent =
                    "🔴";

            }

        }



        /* -------------------------------------------------
           Focus Subject
           ------------------------------------------------- */

        const focusSubjectElement =
            document.getElementById(
                "dashboard-focus-subject"
            );


        if (focusSubjectElement) {

            focusSubjectElement.textContent =
                focusSubject.subject;

        }


        const focusPercentageElement =
            document.getElementById(
                "dashboard-focus-percentage"
            );


        if (focusPercentageElement) {

            focusPercentageElement.textContent =
                `${lowestPercentage.toFixed(1)}%`;

        }


        /*
         * Change focus percentage appearance.
         */

        if (focusPercentageElement) {

            focusPercentageElement.classList.remove(
                "status-pending",
                "status-completed"
            );


            if (lowestPercentage < 75) {

                focusPercentageElement.classList.add(
                    "status-pending"
                );

            }

            else {

                focusPercentageElement.classList.add(
                    "status-completed"
                );

            }

        }

    }

    catch (error) {

        console.error(
            "Error loading dashboard attendance:",
            error
        );


        const dashboardAttendance =
            document.getElementById(
                "dashboard-attendance"
            );


        if (dashboardAttendance) {

            dashboardAttendance.textContent =
                "--";

        }


        const dashboardAttendanceSubtext =
            document.getElementById(
                "dashboard-attendance-subtext"
            );


        if (dashboardAttendanceSubtext) {

            dashboardAttendanceSubtext.textContent =
                "Unable to load";

        }

    }

}


/* ---------------------------------------------------------
   Load Dashboard Attendance When Dashboard Opens
   --------------------------------------------------------- */

if (
    document.getElementById("dashboard-attendance")
) {

    loadDashboardAttendance();

}
/* =========================================================
   10. ASSIGNMENTS FROM SPRING BOOT
   ========================================================= */

function escapeSingleQuote(str) {
    return (str || "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
}

async function loadAssignments() {

    const statTotal = document.getElementById("stat-total");
    const statPending = document.getElementById("stat-pending");
    const statCompleted = document.getElementById("stat-completed");
    const statDueSoon = document.getElementById("stat-due-soon");

    const container =
        document.getElementById("assignmentListContainer") ||
        (document.querySelector(".assignment-item")
            ? document.querySelector(".assignment-item").parentElement
            : null);

    try {

        const studentId = 1;

        const response =
            await fetch(
                `http://localhost:8080/api/assignments/student/${studentId}`
            );

        if (!response.ok) {
            throw new Error(
                "Server responded with status " + response.status
            );
        }

        const assignments =
            await response.json();

        console.log(
            "Assignments from backend:",
            assignments
        );

        /* -------------------------------------------------
           Calculate Summary Counts
           ------------------------------------------------- */

        const totalAssignments =
            assignments.length;

        const pendingAssignments =
            assignments.filter(function (a) {
                return (a.status || "").toLowerCase() === "pending";
            }).length;

        const completedAssignments =
            assignments.filter(function (a) {
                const s = (a.status || "").toLowerCase();
                return s === "completed" || s === "submitted";
            }).length;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
        threeDaysLater.setHours(23, 59, 59, 999);

        const dueSoonAssignments =
            assignments.filter(function (a) {
                if ((a.status || "").toLowerCase() !== "pending" || !a.dueDate) {
                    return false;
                }
                const due = new Date(a.dueDate + "T00:00:00");
                return due >= today && due <= threeDaysLater;
            }).length;

        /* -------------------------------------------------
           Update Summary Cards
           ------------------------------------------------- */

        if (statTotal) statTotal.textContent = totalAssignments;
        if (statPending) statPending.textContent = pendingAssignments;
        if (statCompleted) statCompleted.textContent = completedAssignments;
        if (statDueSoon) statDueSoon.textContent = dueSoonAssignments;

        const summaryNumbers =
            document.querySelectorAll(".summary-card .summary-number");

        if (summaryNumbers.length >= 3) {
            summaryNumbers[0].textContent = totalAssignments;
            summaryNumbers[1].textContent = pendingAssignments;
            summaryNumbers[2].textContent = completedAssignments;
        }

        /* -------------------------------------------------
           Render Dynamic Assignment Cards
           ------------------------------------------------- */

        if (!container) {
            return;
        }

        // Clear existing static or previous cards
        container.innerHTML = "";

        if (assignments.length === 0) {
            container.innerHTML = `
                <div style="padding: 28px; text-align: center; color: #64748b;">
                    <p>No assignments found for this student account.</p>
                </div>
            `;
            return;
        }

        assignments.forEach(function (assignment) {

            const assignmentItem =
                document.createElement("div");

            const status =
                (assignment.status || "pending").toLowerCase();

            assignmentItem.className =
                "assignment-item";

            assignmentItem.dataset.status =
                status;

            /* ---------------------------------------------
               Format Due Date
               --------------------------------------------- */

            let formattedDate = assignment.dueDate || "No date";

            if (assignment.dueDate) {
                const dueDate =
                    new Date(assignment.dueDate + "T00:00:00");

                if (!isNaN(dueDate.getTime())) {
                    formattedDate =
                        dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric"
                        });
                }
            }

            /* ---------------------------------------------
               Subject Icon
               --------------------------------------------- */

            let icon = "📚";
            const sub = (assignment.subject || "").toLowerCase();

            if (sub.includes("java")) {
                icon = "☕";
            } else if (sub.includes("dbms") || sub.includes("database")) {
                icon = "🗄️";
            } else if (sub.includes("ai") || sub.includes("intelligence")) {
                icon = "🤖";
            } else if (sub.includes("cloud") || sub.includes("security")) {
                icon = "☁️";
            }

            /* ---------------------------------------------
               Status Badge & Action Button
               --------------------------------------------- */

            let statusHTML = "";
            let buttonHTML = "";

            const escapedTitle =
                escapeSingleQuote(assignment.title);

            if (status === "pending") {

                statusHTML = `
                    <span class="assignment-status pending">
                        Pending
                    </span>
                `;

                buttonHTML = `
                    <button
                        class="assignment-button"
                        onclick="openAssignment(${assignment.id}, '${escapedTitle}')">
                        Submit
                    </button>
                `;

            } else if (status === "submitted") {

                statusHTML = `
                    <span class="assignment-status submitted">
                        Submitted
                    </span>
                `;

                buttonHTML = `
                    <button
                        class="assignment-button"
                        style="background: rgba(14, 165, 233, 0.15); color: #0284c7; border: 1px solid rgba(14, 165, 233, 0.3);"
                        onclick="viewAssignment('${escapedTitle}', 'submitted')">
                        View
                    </button>
                `;

            } else {

                statusHTML = `
                    <span class="assignment-status completed">
                        Completed
                    </span>
                `;

                buttonHTML = `
                    <button
                        class="assignment-button"
                        onclick="viewAssignment('${escapedTitle}', 'completed')">
                        View
                    </button>
                `;

            }

            const dateLabel =
                (status === "completed" || status === "submitted")
                    ? " • Submitted " + formattedDate
                    : " • Due " + formattedDate;

            assignmentItem.innerHTML = `
                <div class="assignment-icon">
                    ${icon}
                </div>

                <div class="assignment-details">
                    <h3>
                        ${assignment.title || "Untitled Assignment"}
                    </h3>

                    <p>
                        ${assignment.subject || "General"}${dateLabel}
                    </p>

                    <div class="assignment-description">
                        ${assignment.description || ""}
                    </div>
                </div>

                <div class="assignment-action">
                    ${statusHTML}
                    ${buttonHTML}
                </div>
            `;

            container.appendChild(assignmentItem);

        });

        /* -------------------------------------------------
           Apply Current Filter
           ------------------------------------------------- */

        const filterElement =
            document.getElementById("assignmentFilter");

        if (filterElement) {
            filterElement.dispatchEvent(new Event("change"));
        }

    }
    catch (error) {

        console.error(
            "Error loading assignments:",
            error
        );

        if (container) {
            container.innerHTML = `
                <div style="padding: 24px; text-align: center; color: #dc2626; background: #fff5f5; border: 1px solid #fed7d7; border-radius: 8px; margin: 15px 0;">
                    <p style="font-weight: 600; margin-bottom: 4px;">Unable to load live assignments from server.</p>
                    <p style="font-size: 12px; color: #718096; margin: 0;">Please check that Spring Boot is running on http://localhost:8080 and MySQL is active.</p>
                </div>
            `;
        }

    }

}


/* ---------------------------------------------------------
   Load Assignments When Assignments Page Opens
   --------------------------------------------------------- */

if (
    document.getElementById("assignmentFilter") ||
    document.getElementById("stat-total") ||
    document.querySelector(".assignment-item")
) {

    loadAssignments();

}