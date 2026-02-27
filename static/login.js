/* ================================================
   Samadhan Setu Login / Signup Frontend Logic
   ================================================ */

(function () {
  'use strict';

  const state = {
    signupCaptcha: '',
    loginCaptcha: '',
    signupPhone: '',
    loginPhone: '',
    loginUser: null
  };

  const els = {
    slides: document.querySelectorAll('.carousel__slide'),
    dots: document.querySelectorAll('.carousel__dot'),
    carousel: document.getElementById('carousel'),

    authTabs: document.getElementById('authTabs'),
    authTabButtons: document.querySelectorAll('.auth-tab'),
    signupPanel: document.getElementById('signupPanel'),
    loginPanel: document.getElementById('loginPanel'),

    signupForm: document.getElementById('signupForm'),
    signupName: document.getElementById('signupName'),
    signupMobile: document.getElementById('signupMobile'),
    signupCaptchaInput: document.getElementById('signupCaptchaInput'),
    signupCaptchaCanvas: document.getElementById('signupCaptchaCanvas'),
    signupCaptchaRefresh: document.getElementById('signupCaptchaRefresh'),
    signupSendOtpBtn: document.getElementById('signupSendOtpBtn'),
    signupOtpSection: document.getElementById('signupOtpSection'),
    signupOtpInputs: document.querySelectorAll('#signupOtpGroup .otp-group__input'),
    signupVerifyOtpBtn: document.getElementById('signupVerifyOtpBtn'),

    loginModeToggle: document.getElementById('loginModeToggle'),
    modeButtons: document.querySelectorAll('.mode-btn'),
    userLoginPanel: document.getElementById('userLoginPanel'),
    adminLoginPanel: document.getElementById('adminLoginPanel'),

    userLoginForm: document.getElementById('userLoginForm'),
    loginIdentifier: document.getElementById('loginIdentifier'),
    loginCaptchaInput: document.getElementById('loginCaptchaInput'),
    loginCaptchaCanvas: document.getElementById('loginCaptchaCanvas'),
    loginCaptchaRefresh: document.getElementById('loginCaptchaRefresh'),
    loginSendOtpBtn: document.getElementById('loginSendOtpBtn'),
    loginOtpSection: document.getElementById('loginOtpSection'),
    loginOtpInputs: document.querySelectorAll('#loginOtpGroup .otp-group__input'),
    loginVerifyOtpBtn: document.getElementById('loginVerifyOtpBtn'),

    adminLoginForm: document.getElementById('adminLoginForm'),
    adminEmail: document.getElementById('adminEmail'),
    adminPassword: document.getElementById('adminPassword'),
    passwordToggle: document.getElementById('passwordToggle'),

    toast: document.getElementById('toast'),
    toastMsg: document.getElementById('toastMsg'),
    errorToast: document.getElementById('errorToast'),
    errorToastMsg: document.getElementById('errorToastMsg')
  };

  function showToast(message) {
    els.toastMsg.textContent = message;
    els.toast.classList.add('show');
    setTimeout(() => els.toast.classList.remove('show'), 3200);
  }

  function showErrorToast(message) {
    els.errorToastMsg.textContent = message;
    els.errorToast.classList.add('show');
    setTimeout(() => els.errorToast.classList.remove('show'), 3800);
  }

  function setFieldError(errorId, message) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    errorEl.textContent = message;
    const field = errorEl.closest('.field');
    const input = field ? field.querySelector('.field__input') : null;
    if (input) input.classList.add('error');
  }

  function clearFieldError(errorId) {
    const errorEl = document.getElementById(errorId);
    if (!errorEl) return;
    errorEl.textContent = '';
    const field = errorEl.closest('.field');
    const input = field ? field.querySelector('.field__input') : null;
    if (input) input.classList.remove('error');
  }

  function setButtonLoading(buttonEl, loading) {
    if (!buttonEl) return;
    buttonEl.classList.toggle('btn--loading', loading);
    buttonEl.disabled = loading;
  }

  function sanitizePhone(raw) {
    return (raw || '').replace(/\D/g, '').slice(0, 10);
  }

  function toFullPhone(number10) {
    return `+91${number10}`;
  }

  function generateCaptcha(length = 6) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let value = '';
    for (let i = 0; i < length; i++) {
      value += chars[Math.floor(Math.random() * chars.length)];
    }
    return value;
  }

  function drawCaptcha(canvas, text) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#F3F6FA';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.strokeStyle = `hsl(${210 + Math.random() * 60}, 45%, 75%)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = '700 22px Inter, sans-serif';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      ctx.translate(12 + i * 18, height / 2 + (Math.random() * 8 - 4));
      ctx.rotate((Math.random() - 0.5) * 0.32);
      ctx.fillStyle = `hsl(${210 + Math.random() * 45}, 70%, 34%)`;
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    for (let i = 0; i < 24; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 0, 0, ${Math.random() * 0.2})`;
      ctx.fill();
    }
  }

  function refreshSignupCaptcha() {
    state.signupCaptcha = generateCaptcha();
    drawCaptcha(els.signupCaptchaCanvas, state.signupCaptcha);
    els.signupCaptchaInput.value = '';
    clearFieldError('signupCaptchaError');
  }

  function refreshLoginCaptcha() {
    state.loginCaptcha = generateCaptcha();
    drawCaptcha(els.loginCaptchaCanvas, state.loginCaptcha);
    els.loginCaptchaInput.value = '';
    clearFieldError('loginCaptchaError');
  }

  async function sendOtp(phone) {
    const response = await fetch('/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch (_err) {
      payload = {};
    }

    if (!response.ok || payload.status !== 'success') {
      throw new Error(payload.message || 'Failed to send OTP');
    }
  }

  async function verifyOtp(phone, otp) {
    const response = await fetch('/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp })
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch (_err) {
      payload = {};
    }

    if (!response.ok || payload.status !== 'success') {
      throw new Error(payload.message || 'OTP verification failed');
    }
  }

  function generateUserId() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'USR-';
    for (let i = 0; i < 6; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  function setActiveAuthTab(tab) {
    const isLogin = tab === 'login';
    els.authTabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    els.authTabs.classList.toggle('login-active', isLogin);
    els.signupPanel.classList.toggle('active', !isLogin);
    els.loginPanel.classList.toggle('active', isLogin);
  }

  function setLoginMode(mode) {
    const isAdmin = mode === 'admin';
    els.modeButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    els.loginModeToggle.classList.toggle('admin-active', isAdmin);
    els.userLoginPanel.classList.toggle('active', !isAdmin);
    els.adminLoginPanel.classList.toggle('active', isAdmin);
  }

  function setupOtpInputs(inputs) {
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 1);
        input.classList.toggle('filled', Boolean(input.value));
        if (input.value && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !input.value && index > 0) {
          inputs[index - 1].focus();
        }
      });

      input.addEventListener('paste', event => {
        const pasted = (event.clipboardData || window.clipboardData)
          .getData('text')
          .replace(/\D/g, '')
          .slice(0, inputs.length);

        if (!pasted) return;

        inputs.forEach((otpInput, otpIndex) => {
          otpInput.value = pasted[otpIndex] || '';
          otpInput.classList.toggle('filled', Boolean(otpInput.value));
        });

        const lastFilledIndex = Math.min(pasted.length, inputs.length) - 1;
        if (lastFilledIndex >= 0) {
          inputs[lastFilledIndex].focus();
        }

        event.preventDefault();
      });
    });
  }

  function getOtpValue(inputs) {
    return Array.from(inputs).map(input => input.value).join('');
  }

  function markOtpError(inputs, hasError) {
    inputs.forEach(input => input.classList.toggle('error', hasError));
  }

  async function findUserByIdentifier(identifier) {
    const value = (identifier || '').trim();

    if (/^\d{10}$/.test(value)) {
      const phone = toFullPhone(value);
      return {
        phone,
        user: {
          name: 'Citizen',
          phone,
          userId: ''
        }
      };
    }

    if (!/^USR-[A-Z0-9]{6}$/i.test(value)) {
      throw new Error('Use a 10-digit mobile number or valid User ID (USR-XXXXXX)');
    }

    const normalizedId = value.toUpperCase();
    if (!window.db || !window.db.collection) {
      throw new Error('User lookup is unavailable right now. Try mobile number login.');
    }

    const snapshot = await db
      .collection('users')
      .where('userId', '==', normalizedId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new Error('User ID not found. Please sign up first or login with mobile number.');
    }

    const userData = snapshot.docs[0].data() || {};
    if (!userData.phone || !/^\+91\d{10}$/.test(userData.phone)) {
      throw new Error('User profile is missing a valid phone number.');
    }

    return {
      phone: userData.phone,
      user: {
        name: userData.name || 'Citizen',
        phone: userData.phone,
        userId: userData.userId || normalizedId
      }
    };
  }

  function saveUserSession(user) {
    localStorage.setItem('grievanceUser', JSON.stringify(user));
  }

  function setupCarousel() {
    if (!els.slides.length || !els.dots.length || !els.carousel) return;

    let currentIndex = 0;
    let intervalId = null;

    function goTo(index) {
      els.slides[currentIndex].classList.remove('active');
      els.dots[currentIndex].classList.remove('active');
      currentIndex = (index + els.slides.length) % els.slides.length;
      els.slides[currentIndex].classList.add('active');
      els.dots[currentIndex].classList.add('active');
    }

    function startAutoPlay() {
      intervalId = setInterval(() => goTo(currentIndex + 1), 4500);
    }

    function stopAutoPlay() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    els.dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        stopAutoPlay();
        goTo(index);
        startAutoPlay();
      });
    });

    els.carousel.addEventListener('mouseenter', stopAutoPlay);
    els.carousel.addEventListener('mouseleave', startAutoPlay);
    startAutoPlay();
  }

  function bindEvents() {
    setupCarousel();

    els.authTabButtons.forEach(btn => {
      btn.addEventListener('click', () => setActiveAuthTab(btn.dataset.tab));
    });

    els.modeButtons.forEach(btn => {
      btn.addEventListener('click', () => setLoginMode(btn.dataset.mode));
    });

    els.signupMobile.addEventListener('input', () => {
      els.signupMobile.value = sanitizePhone(els.signupMobile.value);
      clearFieldError('signupMobileError');
    });

    els.signupName.addEventListener('input', () => clearFieldError('signupNameError'));
    els.signupCaptchaInput.addEventListener('input', () => clearFieldError('signupCaptchaError'));

    els.loginIdentifier.addEventListener('input', () => clearFieldError('loginIdentifierError'));
    els.loginCaptchaInput.addEventListener('input', () => clearFieldError('loginCaptchaError'));

    els.adminEmail.addEventListener('input', () => clearFieldError('adminEmailError'));
    els.adminPassword.addEventListener('input', () => clearFieldError('adminPasswordError'));

    els.signupCaptchaRefresh.addEventListener('click', refreshSignupCaptcha);
    els.loginCaptchaRefresh.addEventListener('click', refreshLoginCaptcha);

    setupOtpInputs(els.signupOtpInputs);
    setupOtpInputs(els.loginOtpInputs);

    els.signupForm.addEventListener('submit', async event => {
      event.preventDefault();

      let valid = true;
      const name = els.signupName.value.trim();
      const mobile = sanitizePhone(els.signupMobile.value);
      const captcha = els.signupCaptchaInput.value.trim();

      if (!name) {
        setFieldError('signupNameError', 'Please enter your full name');
        valid = false;
      } else {
        clearFieldError('signupNameError');
      }

      if (!/^\d{10}$/.test(mobile)) {
        setFieldError('signupMobileError', 'Mobile number must be exactly 10 digits');
        valid = false;
      } else {
        clearFieldError('signupMobileError');
      }

      if (!captcha) {
        setFieldError('signupCaptchaError', 'Please enter the captcha');
        valid = false;
      } else if (captcha !== state.signupCaptcha) {
        setFieldError('signupCaptchaError', 'Captcha does not match');
        valid = false;
      } else {
        clearFieldError('signupCaptchaError');
      }

      if (!valid) return;

      const phone = toFullPhone(mobile);
      setButtonLoading(els.signupSendOtpBtn, true);
      try {
        await sendOtp(phone);
        state.signupPhone = phone;
        els.signupOtpSection.classList.add('visible');
        els.signupSendOtpBtn.querySelector('.btn__text').textContent = 'Resend OTP';
        els.signupOtpInputs[0].focus();
        showToast('OTP sent to your mobile number');
      } catch (error) {
        showErrorToast(error.message);
      } finally {
        setButtonLoading(els.signupSendOtpBtn, false);
      }
    });

    els.signupVerifyOtpBtn.addEventListener('click', async () => {
      const otp = getOtpValue(els.signupOtpInputs);
      if (otp.length !== 6) {
        document.getElementById('signupOtpError').textContent = 'Please enter all 6 OTP digits';
        markOtpError(els.signupOtpInputs, true);
        return;
      }

      if (!state.signupPhone) {
        showErrorToast('Please send OTP first');
        return;
      }

      document.getElementById('signupOtpError').textContent = '';
      markOtpError(els.signupOtpInputs, false);

      setButtonLoading(els.signupVerifyOtpBtn, true);
      try {
        await verifyOtp(state.signupPhone, otp);

        const user = {
          name: els.signupName.value.trim(),
          phone: state.signupPhone,
          userId: generateUserId()
        };

        if (window.db && window.db.collection) {
          try {
            await db.collection('users').doc(state.signupPhone).set({
              ...user,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          } catch (firebaseError) {
            console.warn('Firestore save skipped:', firebaseError.message);
          }
        }

        saveUserSession(user);
        showToast('OTP verified successfully');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1200);
      } catch (error) {
        markOtpError(els.signupOtpInputs, true);
        document.getElementById('signupOtpError').textContent = error.message;
      } finally {
        setButtonLoading(els.signupVerifyOtpBtn, false);
      }
    });

    els.userLoginForm.addEventListener('submit', async event => {
      event.preventDefault();

      let valid = true;
      const identifier = els.loginIdentifier.value.trim();
      const captcha = els.loginCaptchaInput.value.trim();

      if (!identifier) {
        setFieldError('loginIdentifierError', 'Please enter mobile number or User ID');
        valid = false;
      } else {
        clearFieldError('loginIdentifierError');
      }

      if (!captcha) {
        setFieldError('loginCaptchaError', 'Please enter the captcha');
        valid = false;
      } else if (captcha !== state.loginCaptcha) {
        setFieldError('loginCaptchaError', 'Captcha does not match');
        valid = false;
      } else {
        clearFieldError('loginCaptchaError');
      }

      if (!valid) return;

      setButtonLoading(els.loginSendOtpBtn, true);
      try {
        const match = await findUserByIdentifier(identifier);
        state.loginPhone = match.phone;
        state.loginUser = match.user;

        await sendOtp(state.loginPhone);
        els.loginOtpSection.classList.add('visible');
        els.loginSendOtpBtn.querySelector('.btn__text').textContent = 'Resend OTP';
        els.loginOtpInputs[0].focus();
        showToast('OTP sent to your registered mobile');
      } catch (error) {
        showErrorToast(error.message);
      } finally {
        setButtonLoading(els.loginSendOtpBtn, false);
      }
    });

    els.loginVerifyOtpBtn.addEventListener('click', async () => {
      const otp = getOtpValue(els.loginOtpInputs);
      if (otp.length !== 6) {
        document.getElementById('loginOtpError').textContent = 'Please enter all 6 OTP digits';
        markOtpError(els.loginOtpInputs, true);
        return;
      }

      if (!state.loginPhone) {
        showErrorToast('Please send OTP first');
        return;
      }

      document.getElementById('loginOtpError').textContent = '';
      markOtpError(els.loginOtpInputs, false);

      setButtonLoading(els.loginVerifyOtpBtn, true);
      try {
        await verifyOtp(state.loginPhone, otp);

        const user = state.loginUser || {
          name: 'Citizen',
          phone: state.loginPhone,
          userId: ''
        };

        if (window.db && window.db.collection) {
          try {
            const doc = await db.collection('users').doc(state.loginPhone).get();
            if (doc.exists) {
              const data = doc.data() || {};
              user.name = data.name || user.name;
              user.userId = data.userId || user.userId;
            }
          } catch (firebaseError) {
            console.warn('Firestore fetch skipped:', firebaseError.message);
          }
        }

        saveUserSession(user);
        showToast('Login successful');
        setTimeout(() => {
          window.location.href = '/home';
        }, 1000);
      } catch (error) {
        markOtpError(els.loginOtpInputs, true);
        document.getElementById('loginOtpError').textContent = error.message;
      } finally {
        setButtonLoading(els.loginVerifyOtpBtn, false);
      }
    });

    els.passwordToggle.addEventListener('click', () => {
      const isPassword = els.adminPassword.type === 'password';
      els.adminPassword.type = isPassword ? 'text' : 'password';
      const eyeOpen = els.passwordToggle.querySelector('.eye-open');
      const eyeClosed = els.passwordToggle.querySelector('.eye-closed');
      eyeOpen.style.display = isPassword ? 'none' : 'block';
      eyeClosed.style.display = isPassword ? 'block' : 'none';
    });

    els.adminLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      let valid = true;
      const email = els.adminEmail.value.trim();
      const password = els.adminPassword.value.trim();

      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setFieldError('adminEmailError', 'Please enter a valid admin email');
        valid = false;
      } else {
        clearFieldError('adminEmailError');
      }

      if (!password || password.length < 6) {
        setFieldError('adminPasswordError', 'Password must be at least 6 characters');
        valid = false;
      } else {
        clearFieldError('adminPasswordError');
      }

      if (!valid) return;

      const submitBtn = els.adminLoginForm.querySelector('button[type="submit"]');
      setButtonLoading(submitBtn, true);

      try {
        const res = await fetch('/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success) {
          localStorage.setItem('adminSession', JSON.stringify({ email, role: 'admin', name: data.name || email.split('@')[0] }));
          showToast('Admin login successful');
          setTimeout(() => { window.location.href = '/admin'; }, 800);
        } else {
          showErrorToast(data.error || 'Invalid admin credentials');
        }
      } catch (err) {
        showErrorToast('Server error. Please try again.');
      } finally {
        setButtonLoading(submitBtn, false);
      }
    });
  }

  function init() {
    setActiveAuthTab('signup');
    setLoginMode('user');
    refreshSignupCaptcha();
    refreshLoginCaptcha();
    bindEvents();
  }

  init();
})();
