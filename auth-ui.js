/**
 * Authentication UI Module for IskrClock
 * Provides UI components for login, registration, and user management
 */

// Translation strings for auth UI
const authTranslations = {
    ru: {
        login: 'Вход',
        register: 'Регистрация',
        logout: 'Выйти',
        email: 'Email',
        password: 'Пароль',
        confirmPassword: 'Подтвердите пароль',
        loginButton: 'Войти',
        registerButton: 'Зарегистрироваться',
        orLoginWith: 'Или войти через',
        googleLogin: 'Войти через Google',
        forgotPassword: 'Забыли пароль?',
        noAccount: 'Нет аккаунта?',
        haveAccount: 'Уже есть аккаунт?',
        resetPassword: 'Сбросить пароль',
        backToLogin: 'Назад ко входу',
        resetEmailSent: 'Письмо для сброса пароля отправлено на',
        syncEnabled: 'Синхронизация включена',
        syncDisabled: 'Войдите для синхронизации',
        signUpSuccess: 'Регистрация успешна!',
        loginSuccess: 'Вы вошли в систему!',
        logoutSuccess: 'Вы вышли из системы',
        passwordMismatch: 'Пароли не совпадают',
        invalidEmail: 'Неверный формат email',
        weakPassword: 'Пароль должен содержать минимум 6 символов',
        emailAlreadyInUse: 'Этот email уже используется',
        wrongPassword: 'Неверный email или пароль',
        userNotFound: 'Пользователь не найден',
        tooManyRequests: 'Слишком много попыток. Попробуйте позже',
        networkError: 'Ошибка сети. Проверьте подключение',
        unknownError: 'Произошла ошибка',
        manualSync: 'Синхронизировать',
        lastSync: 'Последняя синхронизация',
        never: 'никогда'
    },
    en: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        loginButton: 'Sign In',
        registerButton: 'Sign Up',
        orLoginWith: 'Or sign in with',
        googleLogin: 'Sign in with Google',
        forgotPassword: 'Forgot password?',
        noAccount: 'No account?',
        haveAccount: 'Already have an account?',
        resetPassword: 'Reset Password',
        backToLogin: 'Back to login',
        resetEmailSent: 'Password reset email sent to',
        syncEnabled: 'Sync enabled',
        syncDisabled: 'Sign in to sync',
        signUpSuccess: 'Registration successful!',
        loginSuccess: 'You are logged in!',
        logoutSuccess: 'You have been logged out',
        passwordMismatch: 'Passwords do not match',
        invalidEmail: 'Invalid email format',
        weakPassword: 'Password must be at least 6 characters',
        emailAlreadyInUse: 'This email is already in use',
        wrongPassword: 'Invalid email or password',
        userNotFound: 'User not found',
        tooManyRequests: 'Too many attempts. Try again later',
        networkError: 'Network error. Check your connection',
        unknownError: 'An error occurred',
        manualSync: 'Sync Now',
        lastSync: 'Last sync',
        never: 'never'
    }
};

let currentAuthLang = 'ru';

/**
 * Get translated text
 * @param {string} key - Translation key
 * @returns {string} Translated text
 */
function t(key) {
    return authTranslations[currentAuthLang][key] || key;
}

/**
 * Set language for auth UI
 * @param {string} lang - Language code (ru/en)
 */
function setAuthLanguage(lang) {
    currentAuthLang = lang;
    updateAuthModalContent();
}

/**
 * Show auth modal
 * @param {string} mode - 'login', 'register', or 'reset'
 */
function showAuthModal(mode = 'login') {
    let modal = document.getElementById('authModal');

    if (!modal) {
        createAuthModal();
        modal = document.getElementById('authModal');
    }

    updateAuthModalContent(mode);
    modal.style.display = 'flex';
}

/**
 * Hide auth modal
 */
function hideAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Create auth modal HTML structure
 */
function createAuthModal() {
    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.style.cssText = `
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        justify-content: center;
        align-items: center;
    `;

    modal.innerHTML = `
        <div id="authModalContent" style="
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 15px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            position: relative;
        ">
            <button onclick="hideAuthModal()" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: transparent;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 5px 10px;
            ">&times;</button>
            <div id="authFormContainer"></div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideAuthModal();
        }
    });
}

/**
 * Update auth modal content based on mode
 * @param {string} mode - 'login', 'register', or 'reset'
 */
function updateAuthModalContent(mode = 'login') {
    const container = document.getElementById('authFormContainer');
    if (!container) return;

    let html = '';

    if (mode === 'login') {
        html = `
            <h2 style="color: white; margin-bottom: 20px; text-align: center;">${t('login')}</h2>
            <div id="authError" style="
                color: #ffcccc;
                background: rgba(255, 0, 0, 0.2);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
            "></div>
            <input type="email" id="loginEmail" placeholder="${t('email')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <input type="password" id="loginPassword" placeholder="${t('password')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <button onclick="handleEmailLogin()" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 15px;
            ">${t('loginButton')}</button>
            <div style="text-align: center; color: white; margin-bottom: 15px;">${t('orLoginWith')}</div>
            <button onclick="handleGoogleLogin()" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #333;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            ">
                <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="M17.6 9.2l-.1-1.8H9v3.4h4.8C13.6 12 13 13 12 13.6v2.2h3a8.8 8.8 0 0 0 2.6-6.6z" fill="#4285F4"/><path d="M9 18c2.4 0 4.5-.8 6-2.2l-3-2.2a5.4 5.4 0 0 1-8-2.9H1V13a9 9 0 0 0 8 5z" fill="#34A853"/><path d="M4 10.7a5.4 5.4 0 0 1 0-3.4V5H1a9 9 0 0 0 0 8l3-2.3z" fill="#FBBC05"/><path d="M9 3.6c1.3 0 2.5.4 3.4 1.3L15 2.3A9 9 0 0 0 1 5l3 2.4a5.4 5.4 0 0 1 5-3.7z" fill="#EA4335"/></g></svg>
                ${t('googleLogin')}
            </button>
            <div style="text-align: center;">
                <a href="#" onclick="updateAuthModalContent('reset'); return false;" style="color: white; text-decoration: none; font-size: 14px;">${t('forgotPassword')}</a>
            </div>
            <div style="text-align: center; margin-top: 15px;">
                <span style="color: white; font-size: 14px;">${t('noAccount')} </span>
                <a href="#" onclick="updateAuthModalContent('register'); return false;" style="color: white; font-weight: bold; text-decoration: none;">${t('register')}</a>
            </div>
        `;
    } else if (mode === 'register') {
        html = `
            <h2 style="color: white; margin-bottom: 20px; text-align: center;">${t('register')}</h2>
            <div id="authError" style="
                color: #ffcccc;
                background: rgba(255, 0, 0, 0.2);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
            "></div>
            <input type="email" id="registerEmail" placeholder="${t('email')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <input type="password" id="registerPassword" placeholder="${t('password')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <input type="password" id="registerConfirmPassword" placeholder="${t('confirmPassword')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <button onclick="handleEmailRegister()" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 15px;
            ">${t('registerButton')}</button>
            <div style="text-align: center; margin-top: 15px;">
                <span style="color: white; font-size: 14px;">${t('haveAccount')} </span>
                <a href="#" onclick="updateAuthModalContent('login'); return false;" style="color: white; font-weight: bold; text-decoration: none;">${t('login')}</a>
            </div>
        `;
    } else if (mode === 'reset') {
        html = `
            <h2 style="color: white; margin-bottom: 20px; text-align: center;">${t('resetPassword')}</h2>
            <div id="authError" style="
                color: #ffcccc;
                background: rgba(255, 0, 0, 0.2);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
            "></div>
            <div id="authSuccess" style="
                color: #ccffcc;
                background: rgba(0, 255, 0, 0.2);
                padding: 10px;
                border-radius: 5px;
                margin-bottom: 15px;
                display: none;
            "></div>
            <input type="email" id="resetEmail" placeholder="${t('email')}" style="
                width: 100%;
                padding: 12px;
                margin-bottom: 15px;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                box-sizing: border-box;
            ">
            <button onclick="handlePasswordReset()" style="
                width: 100%;
                padding: 12px;
                background: white;
                color: #667eea;
                border: none;
                border-radius: 5px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 15px;
            ">${t('resetPassword')}</button>
            <div style="text-align: center;">
                <a href="#" onclick="updateAuthModalContent('login'); return false;" style="color: white; text-decoration: none; font-size: 14px;">${t('backToLogin')}</a>
            </div>
        `;
    }

    container.innerHTML = html;
}

/**
 * Show error message in auth modal
 * @param {string} message - Error message
 */
function showAuthError(message) {
    const errorDiv = document.getElementById('authError');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }
}

/**
 * Show success message in auth modal
 * @param {string} message - Success message
 */
function showAuthSuccess(message) {
    const successDiv = document.getElementById('authSuccess');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
    }
}

/**
 * Get error message for Firebase error code
 * @param {string} code - Firebase error code
 * @returns {string} Translated error message
 */
function getErrorMessage(code) {
    const errorMap = {
        'auth/email-already-in-use': t('emailAlreadyInUse'),
        'auth/invalid-email': t('invalidEmail'),
        'auth/weak-password': t('weakPassword'),
        'auth/user-not-found': t('userNotFound'),
        'auth/wrong-password': t('wrongPassword'),
        'auth/too-many-requests': t('tooManyRequests'),
        'auth/network-request-failed': t('networkError')
    };

    return errorMap[code] || t('unknownError');
}

/**
 * Handle email login
 */
async function handleEmailLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await window.authManager.signInWithEmail(email, password);
        showAuthSuccess(t('loginSuccess'));
        setTimeout(() => hideAuthModal(), 1500);
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

/**
 * Handle email registration
 */
async function handleEmailRegister() {
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showAuthError(t('passwordMismatch'));
        return;
    }

    try {
        await window.authManager.signUpWithEmail(email, password);
        showAuthSuccess(t('signUpSuccess'));
        setTimeout(() => hideAuthModal(), 1500);
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

/**
 * Handle Google login
 */
async function handleGoogleLogin() {
    try {
        await window.authManager.signInWithGoogle();
        showAuthSuccess(t('loginSuccess'));
        setTimeout(() => hideAuthModal(), 1500);
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

/**
 * Handle password reset
 */
async function handlePasswordReset() {
    const email = document.getElementById('resetEmail').value;

    try {
        await window.authManager.resetPassword(email);
        showAuthSuccess(`${t('resetEmailSent')} ${email}`);
    } catch (error) {
        showAuthError(getErrorMessage(error.code));
    }
}

// Export functions for global use
if (typeof window !== 'undefined') {
    window.showAuthModal = showAuthModal;
    window.hideAuthModal = hideAuthModal;
    window.setAuthLanguage = setAuthLanguage;
    window.handleEmailLogin = handleEmailLogin;
    window.handleEmailRegister = handleEmailRegister;
    window.handleGoogleLogin = handleGoogleLogin;
    window.handlePasswordReset = handlePasswordReset;
    window.updateAuthModalContent = updateAuthModalContent;
}
