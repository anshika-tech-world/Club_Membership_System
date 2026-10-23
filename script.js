(function () {
    "use strict";

    const STORAGE_KEY = "clubMembershipRequests";
    const exampleRequests = [
        { id: "example-anshika", name: "Anshika", email: "anshika@example.com", club: "Technical Club", status: "Pending" },
        { id: "example-khushmann", name: "Khushmann Preet", email: "khushmann@example.com", club: "Sports Club", status: "Pending" },
        { id: "example-ashmi", name: "Ashmi Pant", email: "ashmi@example.com", club: "Cultural Club", status: "Pending" }
    ];

    function getStorage() {
        try {
            return window.localStorage;
        } catch (error) {
            return null;
        }
    }

    function readRequests() {
        const storage = getStorage();
        if (!storage) return exampleRequests.map(function (request) { return Object.assign({}, request); });

        try {
            const saved = storage.getItem(STORAGE_KEY);
            if (saved === null) {
                const initial = exampleRequests.map(function (request) { return Object.assign({}, request); });
                storage.setItem(STORAGE_KEY, JSON.stringify(initial));
                return initial;
            }
            const requests = JSON.parse(saved);
            return Array.isArray(requests) ? requests : [];
        } catch (error) {
            return exampleRequests.map(function (request) { return Object.assign({}, request); });
        }
    }

    function saveRequests(requests) {
        const storage = getStorage();
        if (!storage) return false;
        try {
            storage.setItem(STORAGE_KEY, JSON.stringify(requests));
            return true;
        } catch (error) {
            return false;
        }
    }

    function renderRequests() {
        const table = document.getElementById("requestTable");
        if (!table) return;

        table.replaceChildren();
        readRequests().forEach(function (request) {
            const row = document.createElement("tr");
            row.dataset.requestId = request.id;
            [request.name, request.email, request.club, request.status].forEach(function (value) {
                const cell = document.createElement("td");
                cell.textContent = value || "";
                row.appendChild(cell);
            });

            const actions = document.createElement("td");
            if (request.status === "Pending") {
                ["Approve", "Reject"].forEach(function (label) {
                    const button = document.createElement("button");
                    button.type = "button";
                    button.textContent = label;
                    button.addEventListener("click", function () {
                        updateRequestStatus(request.id, label === "Approve" ? "Approved" : "Rejected");
                    });
                    actions.appendChild(button);
                    actions.appendChild(document.createTextNode(" "));
                });
            } else {
                actions.textContent = "—";
            }
            row.appendChild(actions);
            table.appendChild(row);
        });

        const pendingCount = document.getElementById("pendingRequestCount");
        if (pendingCount) {
            pendingCount.textContent = String(readRequests().filter(function (request) {
                return request.status === "Pending";
            }).length);
        }
    }

    function updateRequestStatus(id, status) {
        const requests = readRequests();
        const request = requests.find(function (item) { return item.id === id; });
        if (!request) return;
        request.status = status;
        const saved = saveRequests(requests);
        renderRequests();
        const message = document.getElementById("requestMessage");
        if (message) {
            message.textContent = saved
                ? "Membership request " + status.toLowerCase() + "."
                : "The request status could not be saved. Open the site using start-website.bat and try again.";
        }
    }

    const registrationForm = document.getElementById("registrationForm");
    if (registrationForm) {
        registrationForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const request = {
                id: "request-" + Date.now() + "-" + Math.random().toString(16).slice(2),
                name: document.getElementById("name").value.trim(),
                email: document.getElementById("email").value.trim(),
                phone: document.getElementById("phone").value.trim(),
                course: document.getElementById("course").value.trim(),
                club: document.getElementById("club").value,
                status: "Pending"
            };
            const requests = readRequests();
            requests.push(request);
            const saved = saveRequests(requests);
            const message = document.getElementById("message");

            if (saved) {
                message.textContent = "Registration submitted! Your request is now visible on the Requests page.";
                registrationForm.reset();
            } else {
                message.textContent = "Your request could not be saved. Open the site using start-website.bat, then submit again.";
            }
        });
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();
            const email = document.getElementById("loginEmail").value;
            document.getElementById("loginMessage").textContent = "Login submitted for " + email + ".";
        });
    }

    window.registerActivity = function (activityName) {
        const message = document.getElementById("activityMessage");
        if (message) message.textContent = "You have successfully registered for " + activityName + "!";
    };

    window.deleteMember = function (button) {
        const row = button.closest("tr");
        if (row) row.remove();
        const message = document.getElementById("memberMessage");
        if (message) message.textContent = "Member deleted successfully.";
    };

    window.searchMember = function () {
        const input = document.getElementById("searchMember");
        const table = document.getElementById("memberTable");
        if (!input || !table) return;
        const filter = input.value.toLowerCase();
        table.querySelectorAll("tr").forEach(function (row) {
            row.style.display = row.cells[0].textContent.toLowerCase().includes(filter) ? "" : "none";
        });
    };

    window.approveRequest = function (button) {
        const row = button.closest("tr");
        if (row) updateRequestStatus(row.dataset.requestId, "Approved");
    };

    window.rejectRequest = function (button) {
        const row = button.closest("tr");
        if (row) updateRequestStatus(row.dataset.requestId, "Rejected");
    };

    function setupScrollAnimations() {
        const targets = document.querySelectorAll("main > section, .feature, table");
        let cardIndex = 0;

        targets.forEach(function (element) {
            element.classList.add("scroll-reveal");
            if (element.classList.contains("feature")) {
                element.style.transitionDelay = (cardIndex % 3) * 100 + "ms";
                cardIndex += 1;
            }
        });

        const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReducedMotion || !("IntersectionObserver" in window)) {
            targets.forEach(function (element) { element.classList.add("is-visible"); });
            return;
        }

        const observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        targets.forEach(function (element) { observer.observe(element); });
    }

    renderRequests();
    setupScrollAnimations();
}());
