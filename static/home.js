/* ================================================
   Home Page JS — Navigation + FAQ + i18n + Auth
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
            hero_title: 'समाधान सेतु',
            hero_tagline: '"नागरिकों को त्वरित और स्मार्ट शिकायत समाधान से जोड़ना।"',
            hero_desc: 'समाधान सेतु एक AI-संचालित शिकायत वर्गीकरण मंच है जो बुद्धिमानी से सार्वजनिक शिकायतों को उचित विभागों में वर्गीकृत और रूट करता है, तेजी से समाधान और पारदर्शी शासन सुनिश्चित करता है।',
            hero_register: 'शिकायत दर्ज करें <i class="fa-solid fa-arrow-right"></i>',
            hero_track: 'शिकायत ट्रैक करें <i class="fa-solid fa-magnifying-glass"></i>',
            stat_resolved: 'शिकायतें समाधान', stat_dept: 'सरकारी विभाग', stat_tracking: 'AI ट्रैकिंग',
            about_title: 'समाधान सेतु के बारे में',
            about_p1: 'इस मंच का उद्देश्य नागरिकों और सरकारी अधिकारियों के बीच की खाई को सहज रूप से पाटना है। उन्नत कृत्रिम बुद्धिमत्ता का लाभ उठाकर, समाधान सेतु स्वचालित रूप से शिकायतों को जिम्मेदार विभाग में वर्गीकृत और रूट करता है, मैनुअल देरी को पूरी तरह से समाप्त करता है।',
            about_p2: 'हमारा अंतिम लक्ष्य शासन दक्षता में सुधार, पूर्ण पारदर्शिता सुनिश्चित करना और पूरे देश में उच्च नागरिक संतुष्टि प्राप्त करना है।',
            feat_ai: 'AI वर्गीकरण', feat_ai_desc: 'मुद्दों का स्मार्ट वर्गीकरण',
            feat_route: 'तेज़ रूटिंग', feat_route_desc: 'संबंधित अधिकारियों को सीधे',
            feat_trans: 'पारदर्शिता', feat_trans_desc: 'खुली और जवाबदेह प्रक्रिया',
            feat_track: 'रीयल-टाइम ट्रैकिंग', feat_track_desc: 'अपनी आवेदन स्थिति जानें',
            process_title: 'कैसे काम करता है',
            step1_title: '1. जमा करें', step1_desc: 'अपनी शिकायत ऑनलाइन दर्ज करें।',
            step2_title: '2. वर्गीकृत', step2_desc: 'AI स्मार्ट रूप से मुद्दे को टैग करता है।',
            step3_title: '3. रूट', step3_desc: 'सही अधिकारी को भेजा गया।',
            step4_title: '4. समाधान', step4_desc: 'अधिकारी कार्रवाई करते हैं।',
            step5_title: '5. ट्रैक', step5_desc: 'नागरिक को रीयल-टाइम अपडेट मिलते हैं।',
            faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
            faq1_q: 'मैं शिकायत कैसे दर्ज करूं?',
            faq1_a: 'आप हमारे होमपेज पर "शिकायत दर्ज करें" बटन पर क्लिक करके, अपनी समस्या से संबंधित आवश्यक विवरण भरकर और फॉर्म जमा करके आसानी से शिकायत दर्ज कर सकते हैं।',
            faq2_q: 'मैं अपनी शिकायत की स्थिति कैसे ट्रैक करूं?',
            faq2_a: 'होमपेज पर "शिकायत ट्रैक करें" सुविधा का उपयोग करें। रीयल-टाइम अपडेट देखने के लिए जमा करते समय उत्पन्न अपनी अद्वितीय शिकायत आईडी दर्ज करें।',
            faq3_q: 'क्या मेरी व्यक्तिगत जानकारी सुरक्षित है?',
            faq3_a: 'हां, हम सरकारी-स्तर की एन्क्रिप्शन का उपयोग करते हैं। आपका व्यक्तिगत डेटा पूर्णतः गोपनीय है और केवल आपकी समस्या हल करने वाले विभाग के साथ साझा किया जाता है।',
            faq4_q: 'समाधान में कितना समय लगता है?',
            faq4_a: 'समाधान का समय समस्या की जटिलता पर निर्भर करता है, लेकिन हमारी AI-संचालित रूटिंग न्यूनतम देरी सुनिश्चित करती है। अधिकांश सामान्य शिकायतों का 7 से 14 कार्य दिवसों में समाधान किया जाता है।',
            faq5_q: 'क्या मैं हिंदी में शिकायत दर्ज कर सकता हूं?',
            faq5_a: 'हां! मंच पूरी तरह से हिंदी का समर्थन करता है। इंटरफ़ेस और सबमिशन फॉर्म को हिंदी में बदलने के लिए ऊपर दाएं कोने में भाषा टॉगल का उपयोग करें।',
            support_title: 'सहायता चाहिए?',
            support_sub: 'हम आपके प्रश्नों और चिंताओं में आपकी सहायता के लिए यहां हैं।',
            support_phone: 'हेल्पलाइन नंबर', support_phone_hrs: 'सुबह 8 बजे से रात 8 बजे तक उपलब्ध',
            support_email: 'ईमेल सहायता', support_email_hrs: '24 घंटे के भीतर जवाब',
            support_chat: 'चैटबॉट सहायक', support_chat_btn: 'अभी चैट करें',
            footer_desc: 'पारदर्शी शासन के लिए AI-संचालित पहल।',
            footer_badge: 'सुरक्षित सरकारी मंच',
            footer_quick: 'त्वरित लिंक', footer_legal: 'कानूनी',
            footer_privacy: 'गोपनीयता नीति', footer_terms: 'नियम और शर्तें', footer_access: 'अभिगम्यता वक्तव्य',
            footer_connect: 'हमसे जुड़ें', footer_copy: '© 2026 समाधान सेतु। सर्वाधिकार सुरक्षित।'
        },
        en: {
            brand: 'Samadhan Setu',
            nav_home: 'Home', nav_about: 'About Us', nav_how: 'How It Works',
            nav_faq: 'FAQ', nav_support: 'Help & Support',
            login_btn: 'Login', logout_btn: 'Logout',
            hero_title: 'Samadhan Setu',
            hero_tagline: '\u201CConnecting Citizens to Quick and Smart Grievance Resolution.\u201D',
            hero_desc: 'Samadhan Setu is an AI-powered grievance classification platform that intelligently categorizes and routes public complaints to the appropriate departments, ensuring faster resolution and transparent governance.',
            hero_register: 'Register Complaint <i class="fa-solid fa-arrow-right"></i>',
            hero_track: 'Track Complaint <i class="fa-solid fa-magnifying-glass"></i>',
            stat_resolved: 'Complaints Resolved', stat_dept: 'Govt. Departments', stat_tracking: 'AI Tracking',
            about_title: 'About Samadhan Setu',
            about_p1: 'The purpose of the platform is to bridge the gap between citizens and government authorities seamlessly. By leveraging advanced Artificial Intelligence, Samadhan Setu automatically classifies and routes complaints to the exact department responsible, completely removing manual delays.',
            about_p2: 'Our ultimate goal is improving governance efficiency, ensuring absolute transparency, and driving higher citizen satisfaction across the nation.',
            feat_ai: 'AI Classification', feat_ai_desc: 'Smart categorization of issues',
            feat_route: 'Faster Routing', feat_route_desc: 'Direct to concerned authorities',
            feat_trans: 'Transparency', feat_trans_desc: 'Open and accountable process',
            feat_track: 'Real-time Tracking', feat_track_desc: 'Know your application status',
            process_title: 'How It Works',
            step1_title: '1. Submit', step1_desc: 'Register your grievance online.',
            step2_title: '2. Classify', step2_desc: 'AI smartly tags the issue.',
            step3_title: '3. Route', step3_desc: 'Sent to the correct authority.',
            step4_title: '4. Resolve', step4_desc: 'Authority takes action.',
            step5_title: '5. Track', step5_desc: 'Citizen gets real-time updates.',
            faq_title: 'Frequently Asked Questions',
            faq1_q: 'How do I register a complaint?',
            faq1_a: 'You can easily register a complaint by clicking on the "Register Complaint" button on our homepage, filling out the required details regarding your issue, and submitting the form.',
            faq2_q: 'How can I track my complaint status?',
            faq2_a: 'Use the "Track Complaint" feature on the homepage. Enter your unique complaint ID generated at the time of submission to view real-time updates.',
            faq3_q: 'Is my personal information secure?',
            faq3_a: 'Yes, we use government-grade encryption. Your personal data is strictly confidential and only shared with the department resolving your issue.',
            faq4_q: 'How long does resolution take?',
            faq4_a: 'Resolution time varies depending on the complexity of the issue, but our AI-driven routing ensures minimal delays. Most common grievances are addressed within 7 to 14 working days.',
            faq5_q: 'Can I submit complaints in Hindi?',
            faq5_a: 'Yes! The platform fully supports Hindi. Use the language toggle in the top right corner to switch the interface and submission forms to Hindi.',
            support_title: 'Need Help?',
            support_sub: 'We are here to assist you with your queries and concerns.',
            support_phone: 'Helpline Number', support_phone_hrs: 'Available 8 AM to 8 PM',
            support_email: 'Email Support', support_email_hrs: 'Response within 24 hours',
            support_chat: 'Chatbot Assistant', support_chat_btn: 'Chat Now',
            footer_desc: 'An AI-Powered Initiative for Transparent Governance.',
            footer_badge: 'Secure Government Platform',
            footer_quick: 'Quick Links', footer_legal: 'Legal',
            footer_privacy: 'Privacy Policy', footer_terms: 'Terms & Conditions', footer_access: 'Accessibility Statement',
            footer_connect: 'Connect With Us', footer_copy: '\u00A9 2026 Samadhan Setu. All rights reserved.'
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
                else el.innerHTML = dict[key];
            }
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

    /* ── Auth: Show user info or login button ── */
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

    /* ── 1. Sticky Header Effect & Active Link highlighting ── */
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            header.style.padding = '0';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
        }

        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (scrollY >= (sectionTop - 100)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    /* ── 2. Mobile Menu Toggle ── */
    const mobileMenuBtn = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if (mainNav.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('active')) {
                mainNav.classList.remove('active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    });

    /* ── 3. FAQ Accordion ── */
    const accordionItems = document.querySelectorAll('.accordion-item');

    accordionItems.forEach(item => {
        const headerBtn = item.querySelector('.accordion-header');
        headerBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            accordionItems.forEach(acc => {
                acc.classList.remove('active');
                acc.querySelector('.accordion-content').style.maxHeight = null;
            });
            if (!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.accordion-content');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    /* ── 4. Smooth scrolling ── */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: "smooth" });
            }
        });
    });

    /* ── 5. Scroll Reveal Animations ── */
    const revealElements = document.querySelectorAll('.feature-card, .process-step, .support-card, .accordion-item, .stat-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
