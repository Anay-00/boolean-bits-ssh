// Admin Dashboard Interactivity & Dynamic State

// --- State Management ---
let departmentsData = [
    { id: 1, name: "Water Board", keywords: ["water", "pipe", "leak", "drainage"], officers: 12, status: "Active" },
    { id: 2, name: "Sanitation", keywords: ["garbage", "trash", "clean", "sweeper"], officers: 24, status: "Active" },
    { id: 3, name: "Electricity", keywords: ["power", "cut", "wire", "pole", "light"], officers: 18, status: "Active" },
    { id: 4, name: "Public Works (PWD)", keywords: ["road", "pothole", "bridge", "construction"], officers: 30, status: "Active" }
];

let complaintsData = [
    { id: "#G-4092", name: "Rahul Singh", category: "Garbage", dept: "Sanitation", location: "Sector 4, Main Road", status: "Pending", priority: "High", date: "Oct 12, 2026" },
    { id: "#W-1104", name: "Priya Patel", category: "Pipe Leak", dept: "Water Board", location: "Civil Lines", status: "Resolved", priority: "Normal", date: "Oct 11, 2026" },
    { id: "#E-8832", name: "Amit Sharma", category: "Power Cut", dept: "Electricity", location: "Vijay Nagar", status: "In Progress", priority: "Medium", date: "Oct 10, 2026" },
    { id: "#P-5021", name: "Neha Gupta", category: "Pothole", dept: "Public Works (PWD)", location: "Ring Road", status: "Pending", priority: "High", date: "Oct 12, 2026" },
    { id: "#W-1105", name: "Vikash Rao", category: "No Water", dept: "Water Board", location: "Indira Nagar", status: "Resolved", priority: "Normal", date: "Oct 09, 2026" }
];

// Chart Instances
let trendChartInstance = null;
let categoryChartInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // 1. Sidebar Navigation Logic
    const menuItems = document.querySelectorAll('.menu-item');
    const pageContents = document.querySelectorAll('.page-content');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            // Remove active from all menu items
            menuItems.forEach(mi => mi.classList.remove('active'));
            // Add active to clicked item
            item.classList.add('active');

            // Find target section
            const targetId = item.getAttribute('data-target');

            // Hide all content sections
            pageContents.forEach(content => content.classList.remove('active'));

            // Show target content section
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');

                if (targetId === 'live-map') {
                    window.dispatchEvent(new Event('samadhan:open-live-map'));
                }
            }
        });
    });

    // 2. Initial Render
    renderComplaints();
    renderDepartments();
    updateDashboardStats();

    // 3. Department Form Listener
    const newDeptForm = document.getElementById('newDeptForm');
    if (newDeptForm) {
        newDeptForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('deptNameInput').value;
            const keywordsInput = document.getElementById('deptKeywordsInput').value;

            const newDept = {
                id: departmentsData.length + 1,
                name: nameInput,
                keywords: keywordsInput.split(',').map(k => k.trim()),
                officers: 0,
                status: "Active"
            };

            departmentsData.push(newDept);
            renderDepartments();

            // reset and hide form
            newDeptForm.reset();
            document.getElementById('addDeptForm').style.display = 'none';
        });
    }
});

// --- Render Functions ---

function renderComplaints() {
    const tbody = document.getElementById('complaintsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    complaintsData.forEach(comp => {
        let statusClass = 'status-pending';
        if (comp.status === 'Resolved') statusClass = 'status-resolved';
        if (comp.status === 'In Progress') statusClass = 'status-in-progress';

        let priorityHtml = `<span style="color:var(--text-muted);">${comp.priority}</span>`;
        if (comp.priority === 'High') {
            priorityHtml = `<span style="color:var(--danger);"><i class="fa-solid fa-circle-exclamation"></i> High</span>`;
        } else if (comp.priority === 'Medium') {
            priorityHtml = `<span style="color:var(--warning);"><i class="fa-solid fa-triangle-exclamation"></i> Medium</span>`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td>${comp.id}</td>
            <td>${comp.name}</td>
            <td>${comp.category} / ${comp.dept}</td>
            <td>${comp.location}</td>
            <td><span class="status-badge ${statusClass}">${comp.status}</span></td>
            <td>${priorityHtml}</td>
            <td>${comp.date}</td>
            <td><button class="btn btn-outline btn-small">View</button></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderDepartments() {
    const tbody = document.getElementById('departmentsTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    departmentsData.forEach(dept => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${dept.name}</strong></td>
            <td><span style="font-size:0.8rem; color:var(--text-muted);">${dept.keywords.join(', ')}</span></td>
            <td>${dept.officers}</td>
            <td><span class="status-badge status-resolved">${dept.status}</span></td>
            <td>
                <button class="btn btn-outline btn-small"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-outline btn-small" style="color:var(--danger); border-color:var(--danger);"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function updateDashboardStats() {
    const total = complaintsData.length;
    const pending = complaintsData.filter(c => c.status === 'Pending').length;
    const resolved = complaintsData.filter(c => c.status === 'Resolved').length;
    const highPriority = complaintsData.filter(c => c.priority === 'High').length;

    if (document.getElementById('statsTotal')) document.getElementById('statsTotal').innerText = total;
    if (document.getElementById('statsPending')) document.getElementById('statsPending').innerText = pending;
    if (document.getElementById('statsResolved')) document.getElementById('statsResolved').innerText = resolved;
    if (document.getElementById('statsHighPriority')) document.getElementById('statsHighPriority').innerText = highPriority;

    updateCharts();
}

function updateCharts() {
    // Top 5 Departments for Chart
    const deptCounts = {};
    complaintsData.forEach(comp => {
        deptCounts[comp.dept] = (deptCounts[comp.dept] || 0) + 1;
    });

    const labels = Object.keys(deptCounts);
    const data = Object.values(deptCounts);
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#9CA3AF'];

    // Category Chart
    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        if (categoryChartInstance) {
            categoryChartInstance.destroy();
        }
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: { position: 'bottom', labels: { padding: 20 } }
                }
            }
        });
    }

    // Trend Chart (dummy but matching total sum roughly)
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx && !trendChartInstance) {
        trendChartInstance = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Complaints Received',
                    data: [12, 18, 15, complaintsData.length], // making last point dynamic
                    borderColor: '#1A56DB',
                    backgroundColor: 'rgba(26, 86, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#E5E7EB' } },
                    x: { grid: { display: false } }
                }
            }
        });
    } else if (trendChartInstance) {
        // update last point if already exists
        trendChartInstance.data.datasets[0].data[3] = complaintsData.length;
        trendChartInstance.update();
    }
}
