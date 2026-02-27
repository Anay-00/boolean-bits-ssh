/* ================================================
   Complaint Page JS — Form + Upload + Firestore + i18n
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    /* ── Translation Dictionary ── */
    const translations = {
        hi: {
            brand: 'समाधान सेतु',
            nav_home: 'होम', nav_about: 'हमारे बारे में', nav_how: 'कैसे काम करता है',
            nav_faq: 'अक्सर पूछे जाने वाले प्रश्न', nav_support: 'सहायता',
            login_btn: 'लॉगिन', logout_btn: 'लॉगआउट',
            complaint_breadcrumb: 'शिकायत दर्ज करें',
            complaint_heading: 'अपनी शिकायत दर्ज करें',
            complaint_subtext: 'नीचे विवरण भरें और हमारा AI सिस्टम आपकी शिकायत को सही विभाग में भेजेगा।',
            info_step1: 'अपनी समस्या बताएं', info_step2: 'विभाग चुनें',
            info_step3: 'सबूत संलग्न करें', info_step4: 'जमा करें और ट्रैक करें',
            form_title_label: 'समस्या का शीर्षक', form_title_ph: 'अपनी समस्या का संक्षिप्त शीर्षक',
            form_dept_label: 'जिम्मेदार विभाग', form_dept_ph: 'विभाग चुनें',
            dept_water: 'जल आपूर्ति', dept_elec: 'बिजली', dept_roads: 'सड़कें और बुनियादी ढांचा',
            dept_sanitation: 'स्वच्छता', dept_education: 'शिक्षा', dept_health: 'स्वास्थ्य',
            dept_transport: 'सार्वजनिक परिवहन', dept_revenue: 'राजस्व', dept_police: 'पुलिस', dept_other: 'अन्य',
            form_desc_label: 'समस्या का विवरण', form_desc_ph: 'अपनी समस्या का विस्तार से वर्णन करें...',
            form_upload_label: 'फोटो / वीडियो अपलोड करें (वैकल्पिक)',
            upload_text: 'फाइलें यहां खींचें या ब्राउज़ करें',
            upload_hint: 'PNG, JPG, MP4 – अधिकतम 10MB प्रत्येक',
            form_submit: 'शिकायत जमा करें',
            modal_title: 'शिकायत जमा हो गई!',
            modal_desc: 'आपकी शिकायत दर्ज कर ली गई है और हमारे AI सिस्टम द्वारा संसाधित की जा रही है।',
            modal_id_label: 'आपकी शिकायत आईडी',
            modal_note: 'अपनी शिकायत की स्थिति ट्रैक करने के लिए यह आईडी सहेजें।',
            modal_home: 'होम पर जाएं', modal_new: 'नई शिकायत'
        },
        en: {
            brand: 'Samadhan Setu',
            nav_home: 'Home', nav_about: 'About Us', nav_how: 'How It Works',
            nav_faq: 'FAQ', nav_support: 'Help & Support',
            login_btn: 'Login', logout_btn: 'Logout',
            complaint_breadcrumb: 'Register Complaint',
            complaint_heading: 'Register Your Grievance',
            complaint_subtext: 'Fill in the details below and our AI system will classify and route your complaint to the correct department for swift resolution.',
            info_step1: 'Describe your issue', info_step2: 'Select department',
            info_step3: 'Attach evidence', info_step4: 'Submit & track',
            form_title_label: 'Title of the Problem', form_title_ph: 'Brief title of your issue',
            form_dept_label: 'Department Responsible', form_dept_ph: 'Select Department',
            dept_water: 'Water Supply', dept_elec: 'Electricity', dept_roads: 'Roads & Infrastructure',
            dept_sanitation: 'Sanitation', dept_education: 'Education', dept_health: 'Healthcare',
            dept_transport: 'Public Transport', dept_revenue: 'Revenue', dept_police: 'Police', dept_other: 'Other',
            form_desc_label: 'Description of the Problem', form_desc_ph: 'Describe your issue in detail...',
            form_upload_label: 'Upload Photos / Videos (Optional)',
            upload_text: 'Drag & drop files here or browse',
            upload_hint: 'PNG, JPG, MP4 – Max 10MB each',
            form_submit: 'Submit Complaint',
            modal_title: 'Complaint Submitted!',
            modal_desc: 'Your grievance has been registered and is being processed by our AI system.',
            modal_id_label: 'Your Complaint ID',
            modal_note: 'Save this ID to track your complaint status.',
            modal_home: 'Go to Home', modal_new: 'New Complaint'
        }
    };

    let currentLang = localStorage.getItem('lang') || 'en';

    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);
        const dict = translations[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                if (el.tagName === 'OPTION') el.textContent = dict[key];
                else if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') { /* skip */ }
                else el.innerHTML = dict[key];
            }
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });
        const langLabel = document.getElementById('langLabel');
        if (langLabel) langLabel.textContent = lang === 'en' ? 'हिन्दी' : 'English';
        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
    }

    /* Language toggle */
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        langToggle.addEventListener('click', () => {
            applyLanguage(currentLang === 'en' ? 'hi' : 'en');
        });
    }

    /* Apply stored language */
    applyLanguage(currentLang);

    /* ── Auth Check ── */
    const userArea = document.getElementById('userArea');
    const user = JSON.parse(localStorage.getItem('grievanceUser') || 'null');

    if (user && userArea) {
        userArea.innerHTML = `
      <div class="user-info">
        <i class="fa-solid fa-user-circle"></i>
        <span class="user-name">${user.name}</span>
        <button class="btn btn-outline btn-small logout-btn" id="logoutBtn" data-i18n="logout_btn">${currentLang === 'hi' ? 'लॉगआउट' : 'Logout'}</button>
      </div>`;
        document.getElementById('logoutBtn').addEventListener('click', () => {
            localStorage.removeItem('grievanceUser');
            window.location.href = '/';
        });
    }

    /* ── Mobile Menu ── */
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (mobileMenuBtn && mainNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-xmark');
        });
    }

    /* ── DOM Refs ── */
    const form = document.getElementById('complaintForm');
    const titleInput = document.getElementById('complaintTitle');
    const deptSelect = document.getElementById('department');
    const descInput = document.getElementById('description');
    const charCount = document.getElementById('charCount');
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    const filePreviews = document.getElementById('filePreviews');
    const submitBtn = document.getElementById('submitBtn');
    const successModal = document.getElementById('successModal');
    const complaintIdEl = document.getElementById('complaintId');
    const newComplaintBtn = document.getElementById('newComplaintBtn');
    const errorToast = document.getElementById('errorToast');
    const errorToastMsg = document.getElementById('errorToastMsg');

    let uploadedFiles = [];

    /* ── Character Counter ── */
    descInput.addEventListener('input', () => {
        const len = descInput.value.length;
        charCount.textContent = len;
        if (len > 1000) {
            descInput.value = descInput.value.substring(0, 1000);
            charCount.textContent = '1000';
        }
    });

    /* ── Drag & Drop ── */
    ['dragenter', 'dragover'].forEach(evt => {
        uploadZone.addEventListener(evt, (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });
    });

    ['dragleave', 'drop'].forEach(evt => {
        uploadZone.addEventListener(evt, (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
        });
    });

    uploadZone.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = '';
    });

    function handleFiles(files) {
        for (const file of files) {
            if (uploadedFiles.length >= 5) {
                showErrorToast('Maximum 5 files allowed');
                break;
            }
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast(`${file.name} exceeds 10MB limit`);
                continue;
            }
            uploadedFiles.push(file);
            addPreview(file, uploadedFiles.length - 1);
        }
    }

    function addPreview(file, index) {
        const div = document.createElement('div');
        div.className = 'file-preview';
        div.dataset.index = index;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'file-preview-remove';
        removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        removeBtn.addEventListener('click', () => {
            uploadedFiles[index] = null;
            div.remove();
        });

        const nameEl = document.createElement('div');
        nameEl.className = 'file-preview-name';
        nameEl.textContent = file.name;

        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            div.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            div.appendChild(video);
            const playIcon = document.createElement('div');
            playIcon.className = 'file-preview-video-icon';
            playIcon.innerHTML = '<i class="fa-solid fa-play"></i>';
            div.appendChild(playIcon);
        }

        div.appendChild(removeBtn);
        div.appendChild(nameEl);
        filePreviews.appendChild(div);
    }

    /* ── Error helpers ── */
    function showFieldError(id, msg) {
        document.getElementById(id).textContent = msg;
    }
    function clearFieldError(id) {
        document.getElementById(id).textContent = '';
    }

    function showErrorToast(msg) {
        errorToastMsg.textContent = msg;
        errorToast.classList.add('show');
        setTimeout(() => errorToast.classList.remove('show'), 4000);
    }

    titleInput.addEventListener('input', () => { clearFieldError('titleError'); titleInput.classList.remove('error'); });
    deptSelect.addEventListener('change', () => { clearFieldError('deptError'); deptSelect.classList.remove('error'); });
    descInput.addEventListener('input', () => { clearFieldError('descError'); descInput.classList.remove('error'); });

    /* ── Generate Complaint ID ── */
    function generateComplaintId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id = 'GRV-';
        for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
        return id;
    }

    /* ── Submit Form ── */
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let valid = true;

        if (!titleInput.value.trim()) { showFieldError('titleError', 'Please enter a title'); titleInput.classList.add('error'); valid = false; }
        if (!deptSelect.value) { showFieldError('deptError', 'Please select a department'); deptSelect.classList.add('error'); valid = false; }
        if (!descInput.value.trim()) { showFieldError('descError', 'Please describe the problem'); descInput.classList.add('error'); valid = false; }
        else if (descInput.value.trim().length < 20) { showFieldError('descError', 'Description must be at least 20 characters'); descInput.classList.add('error'); valid = false; }

        if (!valid) return;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        const grvId = generateComplaintId();
        const complaint = {
            complaintId: grvId,
            title: titleInput.value.trim(),
            department: deptSelect.value,
            description: descInput.value.trim(),
            fileCount: uploadedFiles.filter(f => f !== null).length,
            status: 'Submitted',
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            user: user ? { name: user.name, phone: user.phone, userId: user.userId } : null
        };

        try {
            await db.collection('complaints').doc(grvId).set(complaint);
            console.log('✅ Complaint saved to Firestore:', complaint);
        } catch (fbErr) {
            console.warn('⚠️ Firebase save failed:', fbErr.message);
        }

        /* Show success modal */
        complaintIdEl.textContent = grvId;
        successModal.classList.add('show');
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    });

    /* ── Modal Actions ── */
    newComplaintBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        form.reset();
        charCount.textContent = '0';
        filePreviews.innerHTML = '';
        uploadedFiles = [];
    });

    /* ── Sticky Header ── */
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }
    });
});
