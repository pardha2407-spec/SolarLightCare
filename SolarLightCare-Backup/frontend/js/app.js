
console.log("SolarLightCare frontend loaded successfully.");

const API_URL = "http://localhost:8080/api/complaints";

// ======================================
// COMMON HELPER FUNCTIONS
// ======================================

function escapeHtml(value) {
    const element = document.createElement("span");
    element.textContent = value == null ? "" : String(value);
    return element.innerHTML;
}

function getStatusInfo(status) {
    status = (status || "SUBMITTED").toUpperCase();

    if (status === "IN_PROGRESS") {
        return { label: "In Progress", className: "status-progress" };
    }

    if (status === "RESOLVED" || status === "CLOSED") {
        return { label: status === "CLOSED" ? "Closed" : "Resolved", className: "status-resolved" };
    }

    if (status === "ASSIGNED") {
        return { label: "Assigned", className: "status-pending" };
    }

    if (status === "VERIFIED") {
        return { label: "Verified", className: "status-pending" };
    }

    if (status === "REJECTED") {
        return { label: "Rejected", className: "status-pending" };
    }

    return { label: "Pending", className: "status-pending" };
}

function getPriorityClass(priority) {
    priority = (priority || "medium").toLowerCase();

    if (priority === "high") return "priority-high";
    if (priority === "low") return "priority-low";

    return "priority-medium";
}

function getComplaintDetailsUrl(id) {
    return "complaint-details.html?id=" + encodeURIComponent(id);
}

// ======================================
// REGISTER FORM VALIDATION
// ======================================

const registerForm = document.querySelector("#registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.querySelector("#name").value.trim();
        const email = document.querySelector("#register-email").value.trim();
        const phone = document.querySelector("#phone").value.trim();
        const password = document.querySelector("#register-password").value;
        const confirmPassword = document.querySelector("#confirm-password").value;
        const role = document.querySelector("#register-role").value;

        if (!name || !email || !phone) {
            alert("Please fill in your name, email, and phone number.");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        alert(
            "Registration form validated successfully!\n\n" +
            "Name: " + name + "\n" +
            "Role: " + role +
            "\n\nNote: Account registration is not yet connected to a database."
        );
    });
}

// ======================================
// LOGIN FORM VALIDATION
// NOTE: Frontend-only navigation.
// This is not real authentication.
// ======================================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;
        const role = document.querySelector("#role").value;

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        if (password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (role === "citizen") {
            window.location.href = "citizen-dashboard.html";
        } else if (role === "admin") {
            window.location.href = "admin-dashboard.html";
        } else if (role === "technician") {
            window.location.href = "technician-dashboard.html";
        } else {
            alert("Please select a valid role.");
        }
    });
}

// ======================================
// REPORT COMPLAINT FORM
// SAVE COMPLAINT TO SPRING BOOT API
// ======================================

const complaintForm = document.querySelector("#complaintForm");

if (complaintForm) {
    complaintForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const complaint = {
            streetlightId: document.querySelector("#streetlight-id").value.trim(),
            location: document.querySelector("#location").value.trim(),
            landmark: document.querySelector("#landmark").value.trim(),
            faultType: document.querySelector("#fault-type").value,
            priority: document.querySelector("#priority").value,
            description: document.querySelector("#description").value.trim(),
            status: "SUBMITTED"
        };

        if (
            !complaint.streetlightId ||
            !complaint.location ||
            !complaint.faultType ||
            !complaint.priority ||
            !complaint.description
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(complaint)
            });

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const savedComplaint = await response.json();

            alert(
                "Complaint saved successfully!\n\n" +
                "Complaint ID: " + savedComplaint.id + "\n" +
                "Streetlight ID: " + savedComplaint.streetlightId
            );

            complaintForm.reset();

        } catch (error) {
            console.error("Complaint submission error:", error);
            alert("Could not save the complaint. Make sure the backend is running.");
        }
    });
}

// ======================================
// MY COMPLAINTS: SEARCH AND FILTER
// ======================================

const statusFilter = document.querySelector("#status-filter");
const searchComplaint = document.querySelector("#search-complaint");
const complaintsList = document.querySelector("#complaints-list");

function filterComplaints() {
    if (!complaintsList) return;

    const selectedStatus = statusFilter ? statusFilter.value : "all";
    const searchText = searchComplaint
        ? searchComplaint.value.toLowerCase().trim()
        : "";

    const cards = complaintsList.querySelectorAll(".complaint-card");

    cards.forEach(function (card) {
        const idElement = card.querySelector(".complaint-id");
        const badge = card.querySelector(".status-badge");

        const complaintId = idElement
            ? idElement.textContent.toLowerCase()
            : "";

        const statusMatches =
            selectedStatus === "all" ||
            (selectedStatus === "pending" &&
                badge && badge.classList.contains("status-pending")) ||
            (selectedStatus === "progress" &&
                badge && badge.classList.contains("status-progress")) ||
            (selectedStatus === "resolved" &&
                badge && badge.classList.contains("status-resolved"));

        const searchMatches = complaintId.includes(searchText);

        card.style.display = statusMatches && searchMatches ? "" : "none";
    });
}

if (statusFilter) {
    statusFilter.addEventListener("change", filterComplaints);
}

if (searchComplaint) {
    searchComplaint.addEventListener("input", filterComplaints);
}

// ======================================
// LOAD MY COMPLAINTS FROM API
// EACH DETAILS LINK USES THAT COMPLAINT'S ID
// ======================================

if (complaintsList) {
    async function loadComplaints() {
        complaintsList.innerHTML = "<p>Loading complaints...</p>";

        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("HTTP " + response.status);
            }

            const complaints = await response.json();

            if (!Array.isArray(complaints) || complaints.length === 0) {
                complaintsList.innerHTML = "<p>No complaints found.</p>";
                return;
            }

            complaintsList.innerHTML = complaints.map(function (complaint) {
                const statusInfo = getStatusInfo(complaint.status);

                return `
<div class="complaint-card">
    <div class="complaint-card-header">
        <div>
            <span class="complaint-id">#${escapeHtml(complaint.id)}</span>
            <h2>Streetlight ${escapeHtml(complaint.streetlightId || "—")}</h2>
        </div>

        <span class="status-badge ${statusInfo.className}">
            ${statusInfo.label}
        </span>
    </div>

    <div class="complaint-details">
        <div>
            <span>Fault Type</span>
            <strong>${escapeHtml(complaint.faultType || "—")}</strong>
        </div>

        <div>
            <span>Location</span>
            <strong>${escapeHtml(complaint.location || "—")}</strong>
        </div>

        <div>
            <span>Priority</span>
            <strong>${escapeHtml(complaint.priority || "—")}</strong>
        </div>

        <div>
            <span>Description</span>
            <strong>${escapeHtml(complaint.description || "—")}</strong>
        </div>
    </div>

    <div class="complaint-card-footer">
        <p>${escapeHtml(complaint.description || "Track this complaint.")}</p>

        <a href="${getComplaintDetailsUrl(complaint.id)}"
           class="view-complaint">
            View Details →
        </a>
    </div>
</div>`;
            }).join("");

            filterComplaints();

        } catch (error) {
            console.error("Could not load complaints:", error);
            complaintsList.innerHTML =
                "<p>Unable to load complaints. Check that the backend is running.</p>";
        }
    }

    loadComplaints();
}

// ======================================
// ADMIN: LOAD COMPLAINTS TABLE
// ======================================

const adminComplaintsTable = document.querySelector("#admin-complaints-table tbody");

if (adminComplaintsTable) {
    async function loadAdminComplaints() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) throw new Error("HTTP " + response.status);

            const complaints = await response.json();

            if (complaints.length === 0) {
                adminComplaintsTable.innerHTML =
                    '<tr><td colspan="7">No complaints found.</td></tr>';
                return;
            }

            adminComplaintsTable.innerHTML = complaints.map(function (complaint) {
                const statusInfo = getStatusInfo(complaint.status);
                const priority = (complaint.priority || "medium").toLowerCase();
                const actionLabel =
                    (complaint.status || "SUBMITTED").toUpperCase() === "SUBMITTED"
                        ? "Review"
                        : "View";

                return `
<tr>
    <td>#${escapeHtml(complaint.id)}</td>
    <td>${escapeHtml(complaint.streetlightId || "—")}</td>
    <td>${escapeHtml(complaint.faultType || "—")}</td>
    <td>
        <span class="${getPriorityClass(priority)}">${escapeHtml(priority)}</span>
    </td>
    <td>—</td>
    <td>
        <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span>
    </td>
    <td>
        <a href="assign-technician.html?id=${encodeURIComponent(complaint.id)}"
           class="table-action">${actionLabel}</a>
        <a href="${getComplaintDetailsUrl(complaint.id)}"
           class="table-action">Details</a>
    </td>
</tr>`;
            }).join("");

        } catch (error) {
            console.error("Admin complaint loading error:", error);
            adminComplaintsTable.innerHTML =
                '<tr><td colspan="7">Unable to load complaints. Check the backend.</td></tr>';
        }
    }

    loadAdminComplaints();
}

// ======================================
// ADMIN DASHBOARD: REAL STATISTICS
// ======================================

const recentComplaintsBody = document.querySelector("#recent-complaints-body");

if (recentComplaintsBody) {
    async function loadAdminDashboard() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) throw new Error("HTTP " + response.status);

            const complaints = await response.json();

            const total = complaints.length;

            const pending = complaints.filter(function (complaint) {
                return ["SUBMITTED", "VERIFIED", "ASSIGNED"].includes(
                    (complaint.status || "SUBMITTED").toUpperCase()
                );
            }).length;

            const inProgress = complaints.filter(function (complaint) {
                return (complaint.status || "").toUpperCase() === "IN_PROGRESS";
            }).length;

            const resolved = complaints.filter(function (complaint) {
                return ["RESOLVED", "CLOSED"].includes(
                    (complaint.status || "").toUpperCase()
                );
            }).length;

            const setNumber = function (selector, value) {
                const element = document.querySelector(selector);
                if (element) element.textContent = value;
            };

            setNumber("#total-complaints", total);
            setNumber("#pending-complaints", pending);
            setNumber("#in-progress-complaints", inProgress);
            setNumber("#resolved-complaints", resolved);
            setNumber("#overview-resolved", resolved);

            const rate = total === 0 ? 0 : Math.round((resolved / total) * 100);
            setNumber("#resolution-rate", rate + "%");

            const recent = [...complaints].reverse().slice(0, 5);

            if (recent.length === 0) {
                recentComplaintsBody.innerHTML =
                    '<tr><td colspan="5">No complaints found.</td></tr>';
                return;
            }

            recentComplaintsBody.innerHTML = recent.map(function (complaint) {
                const statusInfo = getStatusInfo(complaint.status);

                return `
<tr>
    <td>#${escapeHtml(complaint.id)}</td>
    <td>${escapeHtml(complaint.streetlightId || "—")}</td>
    <td>${escapeHtml(complaint.faultType || "—")}</td>
    <td>${escapeHtml(complaint.priority || "—")}</td>
    <td>
        <span class="status-badge ${statusInfo.className}">${statusInfo.label}</span>
        <a href="${getComplaintDetailsUrl(complaint.id)}">Details</a>
    </td>
</tr>`;
            }).join("");

        } catch (error) {
            console.error("Admin dashboard error:", error);
            recentComplaintsBody.innerHTML =
                '<tr><td colspan="5">Unable to load complaints. Check the backend.</td></tr>';
        }
    }

    loadAdminDashboard();
}

// ======================================
// TECHNICIAN DASHBOARD: REAL COMPLAINTS
// ======================================

const technicianComplaintsBody = document.querySelector("#technician-complaints-body");

if (technicianComplaintsBody) {
    async function loadTechnicianDashboard() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) throw new Error("HTTP " + response.status);

            const complaints = await response.json();

            const pending = complaints.filter(function (complaint) {
                return ["SUBMITTED", "VERIFIED", "ASSIGNED"].includes(
                    (complaint.status || "SUBMITTED").toUpperCase()
                );
            }).length;

            const inProgress = complaints.filter(function (complaint) {
                return (complaint.status || "").toUpperCase() === "IN_PROGRESS";
            }).length;

            const resolved = complaints.filter(function (complaint) {
                return ["RESOLVED", "CLOSED"].includes(
                    (complaint.status || "").toUpperCase()
                );
            }).length;

            const setNumber = function (selector, value) {
                const element = document.querySelector(selector);
                if (element) element.textContent = value;
            };

            setNumber("#technician-total", complaints.length);
            setNumber("#technician-pending", pending);
            setNumber("#technician-progress", inProgress);
            setNumber("#technician-resolved", resolved);

            const recent = [...complaints].reverse().slice(0, 10);

            if (recent.length === 0) {
                technicianComplaintsBody.innerHTML =
                    '<tr><td colspan="6">No complaints found.</td></tr>';
                return;
            }

            technicianComplaintsBody.innerHTML = recent.map(function (complaint) {
                const statusInfo = getStatusInfo(complaint.status);
                const priority = (complaint.priority || "medium").toLowerCase();
                const status = (complaint.status || "SUBMITTED").toUpperCase();
                const actionLabel =
                    status === "RESOLVED" || status === "CLOSED" ? "View" : "Update";

                return `
<tr>
    <td>#${escapeHtml(complaint.id)}</td>
    <td>${escapeHtml(complaint.streetlightId || "—")}</td>
    <td>${escapeHtml(complaint.faultType || "—")}</td>
    <td><span class="${getPriorityClass(priority)}">${escapeHtml(priority)}</span></td>
    <td><span class="status-badge ${statusInfo.className}">${statusInfo.label}</span></td>
    <td>
        <a href="update-complaint.html?id=${encodeURIComponent(complaint.id)}"
           class="table-action">${actionLabel}</a>
        <a href="${getComplaintDetailsUrl(complaint.id)}"
           class="table-action">Details</a>
    </td>
</tr>`;
            }).join("");

        } catch (error) {
            console.error("Technician dashboard error:", error);
            technicianComplaintsBody.innerHTML =
                '<tr><td colspan="6">Unable to load complaints. Check the backend.</td></tr>';
        }
    }

    loadTechnicianDashboard();
}

// ======================================
// UPDATE COMPLAINT: LOAD AND SAVE DETAILS
// ======================================

const updateComplaintSelect = document.querySelector("#update-complaint-id");
const complaintUpdateForm = document.querySelector("#complaintUpdateForm");

if (updateComplaintSelect && complaintUpdateForm) {
    let updatePageComplaints = [];

    const updateMessage = document.querySelector("#update-message");
    const saveUpdateButton = document.querySelector("#save-complaint-update");

    function setUpdateMessage(message, isError) {
        if (!updateMessage) return;
        updateMessage.textContent = message;
        updateMessage.style.color = isError ? "#d94b4b" : "#24935a";
    }

    function showComplaintDetails(complaint) {
        const setText = function (selector, value) {
            const element = document.querySelector(selector);
            if (element) element.textContent = value || "—";
        };

        setText("#update-display-id", complaint ? "#" + complaint.id : "—");
        setText("#update-streetlight-id", complaint && complaint.streetlightId);
        setText("#update-fault-type", complaint && complaint.faultType);
        setText("#update-priority", complaint && complaint.priority);
        setText("#update-location", complaint && complaint.location);
        setText("#update-current-status", complaint && complaint.status);
        setText(
            "#update-description",
            complaint ? complaint.description || "No description provided." :
                "Select a complaint to view its details."
        );

        if (complaint) {
            const status = (complaint.status || "SUBMITTED").toUpperCase();
            const statusInput = document.querySelector("#status");
            const inspectionInput = document.querySelector("#inspection");
            const repairInput = document.querySelector("#repair");
            const partsInput = document.querySelector("#parts");

            if (statusInput) {
                statusInput.value =
                    status === "RESOLVED" || status === "CLOSED"
                        ? "RESOLVED"
                        : "IN_PROGRESS";
            }

            if (inspectionInput) inspectionInput.value = complaint.inspectionResult || "";
            if (repairInput) repairInput.value = complaint.repairDetails || "";
            if (partsInput) partsInput.value = complaint.partsReplaced || "";
        }
    }

    async function loadComplaintsForUpdate() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) throw new Error("HTTP " + response.status);

            updatePageComplaints = await response.json();
            updateComplaintSelect.innerHTML =
                '<option value="">Select a complaint</option>';

            updatePageComplaints.forEach(function (complaint) {
                const option = document.createElement("option");
                option.value = complaint.id;
                option.textContent =
                    "#" + complaint.id + " — " +
                    (complaint.streetlightId || "Unknown streetlight") +
                    " (" + (complaint.status || "SUBMITTED") + ")";
                updateComplaintSelect.appendChild(option);
            });

            const requestedId = new URLSearchParams(window.location.search).get("id");

            if (requestedId && updatePageComplaints.some(function (complaint) {
                return String(complaint.id) === requestedId;
            })) {
                updateComplaintSelect.value = requestedId;
            } else if (updatePageComplaints.length > 0) {
                updateComplaintSelect.value = String(updatePageComplaints[0].id);
            }

            const selectedComplaint = updatePageComplaints.find(function (complaint) {
                return String(complaint.id) === updateComplaintSelect.value;
            });

            showComplaintDetails(selectedComplaint || null);

        } catch (error) {
            console.error("Could not load update page complaints:", error);
            updateComplaintSelect.innerHTML =
                '<option value="">Unable to load complaints</option>';

            setUpdateMessage(
                "Could not load complaints. Check that the backend is running.",
                true
            );
        }
    }

    updateComplaintSelect.addEventListener("change", function () {
        const selectedComplaint = updatePageComplaints.find(function (complaint) {
            return String(complaint.id) === updateComplaintSelect.value;
        });

        showComplaintDetails(selectedComplaint || null);
        setUpdateMessage("", false);
    });

    complaintUpdateForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const complaintId = updateComplaintSelect.value;
        const statusInput = document.querySelector("#status");
        const inspectionInput = document.querySelector("#inspection");
        const repairInput = document.querySelector("#repair");
        const partsInput = document.querySelector("#parts");

        const status = statusInput ? statusInput.value : "";
        const inspection = inspectionInput ? inspectionInput.value.trim() : "";
        const repair = repairInput ? repairInput.value.trim() : "";
        const parts = partsInput ? partsInput.value.trim() : "";

        if (!complaintId) {
            setUpdateMessage("Please select a complaint.", true);
            return;
        }

        if (!inspection || !repair) {
            setUpdateMessage(
                "Please enter the inspection result and repair details.",
                true
            );
            return;
        }

        if (saveUpdateButton) {
            saveUpdateButton.disabled = true;
            saveUpdateButton.textContent = "Saving...";
        }

        try {
            const response = await fetch(
                API_URL + "/" + encodeURIComponent(complaintId) + "/status",
                {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: status,
                        inspectionResult: inspection,
                        repairDetails: repair,
                        partsReplaced: parts
                    })
                }
            );

            if (!response.ok) throw new Error("HTTP " + response.status);

            const updatedComplaint = await response.json();

            const index = updatePageComplaints.findIndex(function (complaint) {
                return String(complaint.id) === String(updatedComplaint.id);
            });

            if (index !== -1) updatePageComplaints[index] = updatedComplaint;

            showComplaintDetails(updatedComplaint);

            setUpdateMessage(
                "Complaint #" + updatedComplaint.id +
                " saved successfully. Status: " + updatedComplaint.status +
                ". Repair details saved to the database.",
                false
            );

            const selectedOption =
                updateComplaintSelect.options[updateComplaintSelect.selectedIndex];

            if (selectedOption) {
                selectedOption.textContent =
                    "#" + updatedComplaint.id + " — " +
                    (updatedComplaint.streetlightId || "Unknown streetlight") +
                    " (" + updatedComplaint.status + ")";
            }

        } catch (error) {
            console.error("Complaint update failed:", error);
            setUpdateMessage(
                "Could not save the update. Check the backend and try again.",
                true
            );

        } finally {
            if (saveUpdateButton) {
                saveUpdateButton.disabled = false;
                saveUpdateButton.textContent = "Save Update";
            }
        }
    });

    loadComplaintsForUpdate();
}
