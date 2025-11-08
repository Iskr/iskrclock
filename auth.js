/**
 * Authentication Module for IskrClock
 * Handles user authentication using Firebase Authentication
 * Supports Email/Password and Google OAuth
 */

// Firebase Authentication instance (initialized in main app)
let auth = null;
let currentUser = null;

/**
 * Initialize Firebase Authentication
 * @param {Object} firebaseAuth - Firebase Auth instance
 */
function initAuth(firebaseAuth) {
    auth = firebaseAuth;

    // Listen for authentication state changes
    auth.onAuthStateChanged((user) => {
        currentUser = user;
        onAuthStateChanged(user);
    });
}

/**
 * Callback for authentication state changes
 * Override this in your main app to handle state changes
 * @param {Object} user - Current user object or null
 */
function onAuthStateChanged(user) {
    console.log('Auth state changed:', user ? `Logged in as ${user.email}` : 'Not logged in');
    updateAuthUI(user);

    // Trigger sync when user logs in
    if (user && typeof window.syncManager !== 'undefined') {
        window.syncManager.startSync();
    }
}

/**
 * Update UI based on authentication state
 * @param {Object} user - Current user object or null
 */
function updateAuthUI(user) {
    const loginButton = document.getElementById('loginButton');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    const logoutButton = document.getElementById('logoutButton');

    if (user) {
        // User is logged in
        if (loginButton) loginButton.style.display = 'none';
        if (userInfo) userInfo.style.display = 'flex';
        if (userEmail) userEmail.textContent = user.email;
        if (logoutButton) {
            logoutButton.style.display = 'inline-block';
            logoutButton.onclick = logout;
        }
    } else {
        // User is not logged in
        if (loginButton) loginButton.style.display = 'inline-block';
        if (userInfo) userInfo.style.display = 'none';
    }
}

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
async function signUpWithEmail(email, password) {
    try {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('User signed up:', userCredential.user.email);
        return userCredential;
    } catch (error) {
        console.error('Sign up error:', error);
        throw error;
    }
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} User credential
 */
async function signInWithEmail(email, password) {
    try {
        // Validate input
        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('User signed in:', userCredential.user.email);
        return userCredential;
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

/**
 * Sign in with Google
 * @returns {Promise<Object>} User credential
 */
async function signInWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        const userCredential = await auth.signInWithPopup(provider);
        console.log('User signed in with Google:', userCredential.user.email);
        return userCredential;
    } catch (error) {
        console.error('Google sign in error:', error);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
async function logout() {
    try {
        await auth.signOut();
        console.log('User signed out');

        // Stop sync when user logs out
        if (typeof window.syncManager !== 'undefined') {
            window.syncManager.stopSync();
        }
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
async function resetPassword(email) {
    try {
        if (!email) {
            throw new Error('Email is required');
        }

        await auth.sendPasswordResetEmail(email);
        console.log('Password reset email sent to:', email);
    } catch (error) {
        console.error('Password reset error:', error);
        throw error;
    }
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
function getCurrentUser() {
    return currentUser;
}

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is authenticated
 */
function isAuthenticated() {
    return currentUser !== null;
}

/**
 * Get user ID token
 * @returns {Promise<string>} User ID token
 */
async function getUserToken() {
    if (!currentUser) {
        throw new Error('No user is currently signed in');
    }

    try {
        const token = await currentUser.getIdToken();
        return token;
    } catch (error) {
        console.error('Error getting user token:', error);
        throw error;
    }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.authManager = {
        initAuth,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        logout,
        resetPassword,
        getCurrentUser,
        isAuthenticated,
        getUserToken,
        onAuthStateChanged: (callback) => {
            // Allow custom callback
            const originalCallback = onAuthStateChanged;
            onAuthStateChanged = (user) => {
                originalCallback(user);
                callback(user);
            };
        }
    };
}
