/* ================================================
   Samadhan Setu – Admin Dashboard JS
   Firebase-connected, real-time search, sortable tables
   ================================================ */

(function () {
  'use strict';

  /* ── Auth Guard ── */
  const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
  if (!session || session.role !== 'admin') {
    window.location.href = 'login.html';
    return;
  }

  /* ── Set Admin Info from session ── */
  const email = session.email || 'admin@samadhansetu.gov.in';
  const adminDisplayName = session.name || email.split('@')[0];
  const initials = adminDisplayName.substring(0, 2).toUpperCase();

  const setEl = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  setEl('adminAvatar', initials);
  setEl('adminName', adminDisplayName);
  setEl('dropdownAvatar', initials);
  setEl('dropdownName', adminDisplayName);
  setEl('dropdownEmail', email);

  /* ══════════════════════════════════════════
     SIDEBAR NAVIGATION
     ══════════════════════════════════════════ */
  const menuItems = document.querySelectorAll('.menu-item[data-target]');
  const pages = document.querySelectorAll('.page-content');

  function navigateTo(target) {
    menuItems.forEach(m => m.classList.remove('active'));
    pages.forEach(p => p.classList.remove('active'));

    const activeMenu = document.querySelector(`.menu-item[data-target="${target}"]`);
    const activePage = document.getElementById(target);

    if (activeMenu) activeMenu.classList.add('active');
    if (activePage) activePage.classList.add('active');
  }

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.target);
    });
  });

  /* ══════════════════════════════════════════
     EMERGENCY BANNER DISMISS
     ══════════════════════════════════════════ */
  const closeBanner = document.querySelector('.close-alert');
  if (closeBanner) {
    closeBanner.addEventListener('click', () => {
      const banner = closeBanner.closest('.emergency-banner');
      if (banner) banner.style.display = 'none';
    });
  }

  /* ══════════════════════════════════════════
     PROFILE DROPDOWN (Dynamic with View Profile, Logout)
     ══════════════════════════════════════════ */
  const profileBtn = document.getElementById('adminProfileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
      if (!profileDropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        profileDropdown.classList.remove('visible');
      }
    });

    // Dropdown nav items
    profileDropdown.querySelectorAll('.dropdown-item[data-target]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        profileDropdown.classList.remove('visible');
        navigateTo(item.dataset.target);
      });
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('adminSession');
      window.location.href = 'login.html';
    });
  }

  /* ══════════════════════════════════════════
     FIREBASE DATA – REAL-TIME COMPLAINTS (onSnapshot)
     ══════════════════════════════════════════ */
  let allComplaints = [];
  let unsubscribeComplaints = null;

  function startRealtimeComplaints() {
    if (typeof db === 'undefined' || !db.collection) {
      console.warn('Firebase not available, cannot start real-time listener');
      renderComplaints([]);
      return;
    }

    // Use onSnapshot for real-time updates instead of one-time get()
    unsubscribeComplaints = db.collection('complaints').onSnapshot(
      (snap) => {
        allComplaints = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Update stat cards
        const total = allComplaints.length;
        const pending = allComplaints.filter(c => !c.status || c.status === 'Pending').length;
        const resolved = allComplaints.filter(c => c.status === 'Resolved').length;
        const highPriority = allComplaints.filter(c => c.priority === 'High' || c.priority === 'Urgent').length;

        setEl('statsTotal', total);
        setEl('statsPending', pending);
        setEl('statsResolved', resolved);
        setEl('statsHighPriority', highPriority);

        // Update sidebar badge
        const badge = document.querySelector('.menu-item[data-target="complaints"] .badge');
        if (badge) badge.textContent = total;

        // Re-apply current filters if any
        applyFilters();
        renderCharts(allComplaints);

        // Re-trigger search if the search box has text
        const searchInput = document.getElementById('globalSearch');
        if (searchInput && searchInput.value.trim().length >= 2) {
          performSearch(searchInput.value.trim().toLowerCase());
        }
      },
      (err) => {
        console.warn('Error with real-time complaints listener:', err.message);
        renderComplaints([]);
      }
    );
  }

  function renderComplaints(complaints) {
    const tbody = document.getElementById('complaintsTableBody');
    const empty = document.getElementById('complaintsEmpty');
    if (!tbody) return;

    if (complaints.length === 0) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = 'block';
      return;
    }

    if (empty) empty.style.display = 'none';

    tbody.innerHTML = complaints.map(c => {
      const status = c.status || 'Pending';
      const statusClass = status === 'Resolved' ? 'status-resolved' :
        status === 'In Progress' ? 'status-in-progress' :
          status === 'Urgent' ? 'status-urgent' : 'status-pending';

      const priority = c.priority || 'Medium';
      const priorityClass = priority === 'High' || priority === 'Urgent' ? 'priority-high' :
        priority === 'Low' ? 'priority-low' : 'priority-medium';

      let date = '—';
      try {
        if (c.createdAt && c.createdAt.toDate) date = c.createdAt.toDate().toLocaleDateString('en-IN');
        else if (c.createdAt) date = new Date(c.createdAt).toLocaleDateString('en-IN');
      } catch (_) { }

      const name = c.userName || c.name || '—';
      const dept = c.department || '—';
      const location = c.location || '—';
      const title = c.title || (c.description ? c.description.substring(0, 40) : '—');
      const cid = c.complaintId || c.id;

      return `<tr>
        <td><input type="checkbox" class="complaint-check" data-id="${c.id}"></td>
        <td><strong>${cid}</strong></td>
        <td>${name}</td>
        <td>${dept}</td>
        <td>${location}</td>
        <td><span class="status-badge ${statusClass}">${status}</span></td>
        <td><span class="priority-badge ${priorityClass}">${priority}</span></td>
        <td>${date}</td>
        <td>
          <button class="btn btn-outline" style="padding:0.35rem 0.6rem;font-size:0.75rem;" title="View" onclick="alert('Complaint: ${cid}\\n${title}')"><i class="fa-solid fa-eye"></i></button>
        </td>
      </tr>`;
    }).join('');
  }

  /* ══════════════════════════════════════════
     TABLE SORTING (Fixed)
     ══════════════════════════════════════════ */
  let sortField = null;
  let sortDir = 'asc';

  function sortComplaints(field) {
    if (sortField === field) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDir = 'asc';
    }

    // Update header icons
    document.querySelectorAll('#complaintsTable .sortable').forEach(h => {
      h.classList.remove('sort-asc', 'sort-desc');
      if (h.dataset.sort === field) {
        h.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
    });

    // Get the current filtered list and sort it
    const currentComplaints = getFilteredComplaints();

    const sorted = [...currentComplaints].sort((a, b) => {
      let valA, valB;

      switch (field) {
        case 'id':
          valA = (a.complaintId || a.id || '').toLowerCase();
          valB = (b.complaintId || b.id || '').toLowerCase();
          break;
        case 'name':
          valA = (a.userName || a.name || '').toLowerCase();
          valB = (b.userName || b.name || '').toLowerCase();
          break;
        case 'department':
          valA = (a.department || '').toLowerCase();
          valB = (b.department || '').toLowerCase();
          break;
        case 'status':
          valA = (a.status || 'Pending').toLowerCase();
          valB = (b.status || 'Pending').toLowerCase();
          break;
        case 'priority': {
          const order = { urgent: 0, high: 1, medium: 2, low: 3 };
          valA = order[(a.priority || 'medium').toLowerCase()] ?? 2;
          valB = order[(b.priority || 'medium').toLowerCase()] ?? 2;
          break;
        }
        case 'date':
          try {
            valA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
            valB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
          } catch (_) { valA = 0; valB = 0; }
          break;
        default: valA = ''; valB = '';
      }

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    renderComplaints(sorted);
  }

  // Bind sorting using event delegation on the table (works even after DOM changes)
  const complaintsTable = document.getElementById('complaintsTable');
  if (complaintsTable) {
    complaintsTable.addEventListener('click', (e) => {
      const th = e.target.closest('.sortable');
      if (th && th.dataset.sort) {
        sortComplaints(th.dataset.sort);
      }
    });
  }

  /* ══════════════════════════════════════════
     FILTER BAR
     ══════════════════════════════════════════ */
  const filterSelects = document.querySelectorAll('#complaints .filter-select');
  filterSelects.forEach(sel => sel.addEventListener('change', applyFilters));

  function getFilteredComplaints() {
    const selects = document.querySelectorAll('#complaints .filter-select');
    const deptFilter = selects[0] ? selects[0].value : '';
    const statusFilter = selects[1] ? selects[1].value : '';

    let filtered = [...allComplaints];

    if (deptFilter && deptFilter !== 'All Departments') {
      filtered = filtered.filter(c => (c.department || '').toLowerCase().includes(deptFilter.toLowerCase()));
    }

    if (statusFilter && statusFilter !== 'All Status') {
      filtered = filtered.filter(c => (c.status || 'Pending') === statusFilter);
    }

    return filtered;
  }

  function applyFilters() {
    const filtered = getFilteredComplaints();

    // If there's an active sort, apply it
    if (sortField) {
      const sorted = [...filtered].sort((a, b) => {
        let valA, valB;
        switch (sortField) {
          case 'id':
            valA = (a.complaintId || a.id || '').toLowerCase();
            valB = (b.complaintId || b.id || '').toLowerCase();
            break;
          case 'name':
            valA = (a.userName || a.name || '').toLowerCase();
            valB = (b.userName || b.name || '').toLowerCase();
            break;
          case 'department':
            valA = (a.department || '').toLowerCase();
            valB = (b.department || '').toLowerCase();
            break;
          case 'status':
            valA = (a.status || 'Pending').toLowerCase();
            valB = (b.status || 'Pending').toLowerCase();
            break;
          case 'priority': {
            const order = { urgent: 0, high: 1, medium: 2, low: 3 };
            valA = order[(a.priority || 'medium').toLowerCase()] ?? 2;
            valB = order[(b.priority || 'medium').toLowerCase()] ?? 2;
            break;
          }
          case 'date':
            try {
              valA = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
              valB = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
            } catch (_) { valA = 0; valB = 0; }
            break;
          default: valA = ''; valB = '';
        }
        if (valA < valB) return sortDir === 'asc' ? -1 : 1;
        if (valA > valB) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
      renderComplaints(sorted);
    } else {
      renderComplaints(filtered);
    }
  }

  /* ══════════════════════════════════════════
     SELECT ALL CHECKBOX
     ══════════════════════════════════════════ */
  const selectAll = document.getElementById('selectAllComplaints');
  if (selectAll) {
    selectAll.addEventListener('change', () => {
      document.querySelectorAll('.complaint-check').forEach(cb => { cb.checked = selectAll.checked; });
    });
  }

  /* ══════════════════════════════════════════
     LIVE GLOBAL SEARCH (Real-time from Firebase data)
     ══════════════════════════════════════════ */
  const searchInput = document.getElementById('globalSearch');
  const searchResults = document.getElementById('searchResults');
  let searchTimeout;

  function performSearch(q) {
    if (!searchResults) return;

    const matches = allComplaints.filter(c => {
      const cid = (c.complaintId || c.id || '').toLowerCase();
      const name = (c.userName || c.name || '').toLowerCase();
      const title = (c.title || '').toLowerCase();
      const dept = (c.department || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      const loc = (c.location || '').toLowerCase();
      const status = (c.status || '').toLowerCase();
      return cid.includes(q) || name.includes(q) || title.includes(q) || dept.includes(q) || desc.includes(q) || loc.includes(q) || status.includes(q);
    });

    if (matches.length === 0) {
      searchResults.innerHTML = '<div class="search-no-results"><i class="fa-solid fa-magnifying-glass" style="opacity:0.3;display:block;font-size:1.5rem;margin-bottom:0.5rem;"></i>No complaints found</div>';
    } else {
      searchResults.innerHTML = matches.slice(0, 8).map(c => {
        const status = c.status || 'Pending';
        const statusClass = status === 'Resolved' ? 'status-resolved' :
          status === 'In Progress' ? 'status-in-progress' :
            status === 'Urgent' ? 'status-urgent' : 'status-pending';
        return `
          <div class="search-result-item" data-id="${c.complaintId || c.id}">
            <span class="sr-id">${c.complaintId || c.id}</span>
            <span class="sr-title">${c.title || (c.description ? c.description.substring(0, 50) : 'No title')}</span>
            <span class="status-badge ${statusClass}" style="font-size:0.65rem;padding:0.15rem 0.5rem;">${status}</span>
            <span class="sr-dept">${c.department || '—'}</span>
          </div>
        `;
      }).join('');

      if (matches.length > 8) {
        searchResults.innerHTML += `<div class="search-more-results">${matches.length - 8} more results...</div>`;
      }

      searchResults.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          searchResults.classList.remove('visible');
          searchInput.value = '';
          navigateTo('complaints');
        });
      });
    }

    searchResults.classList.add('visible');
  }

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const q = searchInput.value.trim().toLowerCase();

      if (q.length < 2) {
        searchResults.classList.remove('visible');
        return;
      }

      searchTimeout = setTimeout(() => {
        performSearch(q);
      }, 200);
    });

    document.addEventListener('click', (e) => {
      if (!searchResults.contains(e.target) && e.target !== searchInput) {
        searchResults.classList.remove('visible');
      }
    });

    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) {
        performSearch(searchInput.value.trim().toLowerCase());
      }
    });
  }

  /* ══════════════════════════════════════════
     CHARTS (Chart.js – only if canvas exists)
     ══════════════════════════════════════════ */
  let trendChartInstance = null;
  let categoryChartInstance = null;

  function renderCharts(complaints) {
    // Monthly Trend
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx && typeof Chart !== 'undefined') {
      if (trendChartInstance) trendChartInstance.destroy();

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const counts = new Array(12).fill(0);
      const resolved = new Array(12).fill(0);

      complaints.forEach(c => {
        try {
          const d = c.createdAt && c.createdAt.toDate ? c.createdAt.toDate() : (c.createdAt ? new Date(c.createdAt) : null);
          if (d) {
            counts[d.getMonth()]++;
            if (c.status === 'Resolved') resolved[d.getMonth()]++;
          }
        } catch (_) { }
      });

      trendChartInstance = new Chart(trendCtx, {
        type: 'line',
        data: {
          labels: months,
          datasets: [
            { label: 'Total Filed', data: counts, borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,.1)', fill: true, tension: 0.4, borderWidth: 2 },
            { label: 'Resolved', data: resolved, borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,.1)', fill: true, tension: 0.4, borderWidth: 2 },
          ]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      });
    }

    // Category Doughnut
    const catCtx = document.getElementById('categoryChart');
    if (catCtx && typeof Chart !== 'undefined') {
      if (categoryChartInstance) categoryChartInstance.destroy();

      const deptCounts = {};
      complaints.forEach(c => { const d = c.department || 'Other'; deptCounts[d] = (deptCounts[d] || 0) + 1; });

      const labels = Object.keys(deptCounts);
      const data = Object.values(deptCounts);
      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

      categoryChartInstance = new Chart(catCtx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors.slice(0, labels.length), borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 11 } } } } }
      });
    }
  }

  /* ══════════════════════════════════════════
     DEPARTMENTS TABLE (from Firebase)
     ══════════════════════════════════════════ */
  async function loadDepartments() {
    const tbody = document.getElementById('departmentsTableBody');
    if (!tbody) return;

    try {
      const snap = await db.collection('departments').get();

      if (snap.empty) {
        // Fallback to default rows if no departments in Firebase
        const defaults = [
          { name: 'Water Supply', keywords: 'water, pipe, supply, leak', officers: 8 },
          { name: 'Electricity', keywords: 'electricity, power, light, wire', officers: 12 },
          { name: 'Sanitation', keywords: 'garbage, waste, drain, sewer', officers: 10 },
          { name: 'Roads & Infrastructure', keywords: 'road, pothole, bridge, footpath', officers: 6 },
        ];
        tbody.innerHTML = defaults.map(d => `
          <tr>
            <td><strong>${d.name}</strong></td>
            <td style="font-size:.75rem;color:#6B7280;">${d.keywords}</td>
            <td>${d.officers}</td>
            <td><span class="status-badge status-resolved">Active</span></td>
            <td><button class="btn btn-outline" style="padding:0.35rem 0.6rem;font-size:0.75rem;"><i class="fa-solid fa-pen"></i></button></td>
          </tr>
        `).join('');
        return;
      }

      tbody.innerHTML = snap.docs.map(d => {
        const dept = d.data();
        return `
          <tr>
            <td><strong>${dept.name}</strong></td>
            <td style="font-size:.75rem;color:#6B7280;">${dept.keywords || '—'}</td>
            <td>${dept.officers || 0}</td>
            <td><span class="status-badge ${dept.active !== false ? 'status-resolved' : 'status-pending'}">${dept.active !== false ? 'Active' : 'Inactive'}</span></td>
            <td><button class="btn btn-outline" style="padding:0.35rem 0.6rem;font-size:0.75rem;"><i class="fa-solid fa-pen"></i></button></td>
          </tr>
        `;
      }).join('');
    } catch (err) {
      console.warn('Error loading departments:', err.message);
    }
  }

  /* ══════════════════════════════════════════
     FETCH ADMIN PROFILE FROM FIREBASE
     ══════════════════════════════════════════ */
  async function loadAdminProfile() {
    if (typeof db === 'undefined' || !db.collection) return;

    try {
      const snap = await db.collection('admins').where('email', '==', email).limit(1).get();
      if (!snap.empty) {
        const adminData = snap.docs[0].data();
        const name = adminData.name || adminDisplayName;
        const ini = name.substring(0, 2).toUpperCase();

        setEl('adminAvatar', ini);
        setEl('adminName', name);
        setEl('dropdownAvatar', ini);
        setEl('dropdownName', name);

        // Also update the greeting
        const subtitle = document.querySelector('#dashboard .page-subtitle');
        if (subtitle) subtitle.textContent = `Welcome back ${name}, here's what's happening today.`;
      }
    } catch (err) {
      console.warn('Could not load admin profile:', err.message);
    }
  }

  /* ══════════════════════════════════════════
     INIT
     ══════════════════════════════════════════ */
  startRealtimeComplaints();
  loadDepartments();
  loadAdminProfile();

  // Cleanup listener on page unload
  window.addEventListener('beforeunload', () => {
    if (unsubscribeComplaints) unsubscribeComplaints();
  });

})();
