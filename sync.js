/**
 * Synchronization Module for IskrClock
 * Handles syncing playlists and settings with Firestore
 * Provides real-time sync across devices
 */

// Firestore instance (initialized in main app)
let db = null;
let unsubscribe = null;
let syncEnabled = false;

/**
 * Initialize Firestore Sync
 * @param {Object} firestore - Firestore instance
 */
function initSync(firestore) {
    db = firestore;
    console.log('Sync manager initialized');
}

/**
 * Start syncing data for current user
 */
async function startSync() {
    const user = window.authManager?.getCurrentUser();
    if (!user) {
        console.log('Cannot start sync: No user logged in');
        return;
    }

    syncEnabled = true;
    console.log('Starting sync for user:', user.uid);

    // Load data from Firestore
    await loadFromCloud();

    // Listen for real-time updates
    listenToChanges();
}

/**
 * Stop syncing data
 */
function stopSync() {
    syncEnabled = false;

    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    console.log('Sync stopped');
}

/**
 * Load user data from Firestore
 */
async function loadFromCloud() {
    const user = window.authManager?.getCurrentUser();
    if (!user) return;

    try {
        const docRef = db.collection('users').doc(user.uid);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            console.log('Loaded data from cloud:', data);

            // Merge cloud data with local data
            await mergeData(data);
        } else {
            // First time user - upload local data to cloud
            console.log('New user - uploading local data to cloud');
            await uploadLocalData();
        }
    } catch (error) {
        console.error('Error loading from cloud:', error);
        throw error;
    }
}

/**
 * Merge cloud data with local data
 * Cloud data takes precedence unless it's older
 * @param {Object} cloudData - Data from Firestore
 */
async function mergeData(cloudData) {
    // Get local data
    const localStations = JSON.parse(localStorage.getItem('customStations') || '[]');
    const localSelected = localStorage.getItem('selectedStation');
    const localLanguage = localStorage.getItem('language');

    // Check if cloud data is newer
    const cloudTimestamp = cloudData.lastModified?.toDate() || new Date(0);
    const localTimestamp = new Date(localStorage.getItem('lastModified') || 0);

    if (cloudTimestamp > localTimestamp) {
        // Cloud data is newer - use it
        if (cloudData.customStations) {
            localStorage.setItem('customStations', JSON.stringify(cloudData.customStations));
            console.log('Updated custom stations from cloud');

            // Refresh UI if there's a callback
            if (typeof window.onStationsUpdated === 'function') {
                window.onStationsUpdated();
            }
        }

        if (cloudData.selectedStation) {
            localStorage.setItem('selectedStation', cloudData.selectedStation);
        }

        if (cloudData.language) {
            localStorage.setItem('language', cloudData.language);
        }

        localStorage.setItem('lastModified', cloudTimestamp.getTime().toString());
    } else {
        // Local data is newer or same - upload to cloud
        await uploadLocalData();
    }
}

/**
 * Upload local data to Firestore
 */
async function uploadLocalData() {
    const user = window.authManager?.getCurrentUser();
    if (!user) return;

    try {
        const customStations = JSON.parse(localStorage.getItem('customStations') || '[]');
        const selectedStation = localStorage.getItem('selectedStation');
        const language = localStorage.getItem('language') || 'ru';

        const data = {
            customStations,
            selectedStation,
            language,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('users').doc(user.uid).set(data, { merge: true });
        console.log('Uploaded local data to cloud');

        // Update local timestamp
        localStorage.setItem('lastModified', Date.now().toString());
    } catch (error) {
        console.error('Error uploading to cloud:', error);
        throw error;
    }
}

/**
 * Save custom stations to cloud
 * @param {Array} stations - Array of custom stations
 */
async function saveStationsToCloud(stations) {
    const user = window.authManager?.getCurrentUser();
    if (!user || !syncEnabled) {
        // Just save locally if not syncing
        localStorage.setItem('customStations', JSON.stringify(stations));
        return;
    }

    try {
        // Save to Firestore
        await db.collection('users').doc(user.uid).set({
            customStations: stations,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // Also save locally
        localStorage.setItem('customStations', JSON.stringify(stations));
        localStorage.setItem('lastModified', Date.now().toString());

        console.log('Saved stations to cloud:', stations.length, 'stations');
    } catch (error) {
        console.error('Error saving stations to cloud:', error);
        // Still save locally even if cloud save fails
        localStorage.setItem('customStations', JSON.stringify(stations));
        throw error;
    }
}

/**
 * Save selected station to cloud
 * @param {string} stationId - ID of selected station
 */
async function saveSelectedStationToCloud(stationId) {
    const user = window.authManager?.getCurrentUser();
    if (!user || !syncEnabled) {
        localStorage.setItem('selectedStation', stationId);
        return;
    }

    try {
        await db.collection('users').doc(user.uid).set({
            selectedStation: stationId,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        localStorage.setItem('selectedStation', stationId);
        localStorage.setItem('lastModified', Date.now().toString());

        console.log('Saved selected station to cloud:', stationId);
    } catch (error) {
        console.error('Error saving selected station to cloud:', error);
        localStorage.setItem('selectedStation', stationId);
        throw error;
    }
}

/**
 * Save language preference to cloud
 * @param {string} language - Language code (ru/en)
 */
async function saveLanguageToCloud(language) {
    const user = window.authManager?.getCurrentUser();
    if (!user || !syncEnabled) {
        localStorage.setItem('language', language);
        return;
    }

    try {
        await db.collection('users').doc(user.uid).set({
            language: language,
            lastModified: firebase.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        localStorage.setItem('language', language);
        localStorage.setItem('lastModified', Date.now().toString());

        console.log('Saved language to cloud:', language);
    } catch (error) {
        console.error('Error saving language to cloud:', error);
        localStorage.setItem('language', language);
        throw error;
    }
}

/**
 * Listen for real-time changes from Firestore
 */
function listenToChanges() {
    const user = window.authManager?.getCurrentUser();
    if (!user) return;

    // Unsubscribe from previous listener if exists
    if (unsubscribe) {
        unsubscribe();
    }

    // Listen to user document changes
    unsubscribe = db.collection('users').doc(user.uid).onSnapshot((doc) => {
        if (!doc.exists || !syncEnabled) return;

        const data = doc.data();
        console.log('Received update from cloud:', data);

        // Check if this update is from another device
        const cloudTimestamp = data.lastModified?.toDate()?.getTime() || 0;
        const localTimestamp = parseInt(localStorage.getItem('lastModified') || '0');

        if (cloudTimestamp > localTimestamp) {
            console.log('Applying changes from another device');

            // Update local storage
            if (data.customStations) {
                localStorage.setItem('customStations', JSON.stringify(data.customStations));

                // Refresh UI if there's a callback
                if (typeof window.onStationsUpdated === 'function') {
                    window.onStationsUpdated();
                }
            }

            if (data.selectedStation) {
                localStorage.setItem('selectedStation', data.selectedStation);
            }

            if (data.language) {
                const currentLang = localStorage.getItem('language');
                if (data.language !== currentLang) {
                    localStorage.setItem('language', data.language);
                    // Trigger language change if there's a callback
                    if (typeof window.switchLanguage === 'function') {
                        window.switchLanguage(data.language);
                    }
                }
            }

            localStorage.setItem('lastModified', cloudTimestamp.toString());
        }
    }, (error) => {
        console.error('Error listening to changes:', error);
    });
}

/**
 * Manually trigger sync
 */
async function manualSync() {
    if (!syncEnabled) {
        console.log('Sync is not enabled');
        return;
    }

    try {
        await uploadLocalData();
        await loadFromCloud();
        console.log('Manual sync completed');
    } catch (error) {
        console.error('Manual sync failed:', error);
        throw error;
    }
}

/**
 * Delete all user data from cloud
 */
async function deleteCloudData() {
    const user = window.authManager?.getCurrentUser();
    if (!user) return;

    try {
        await db.collection('users').doc(user.uid).delete();
        console.log('Deleted cloud data');
    } catch (error) {
        console.error('Error deleting cloud data:', error);
        throw error;
    }
}

// Export functions for use in other modules
if (typeof window !== 'undefined') {
    window.syncManager = {
        initSync,
        startSync,
        stopSync,
        loadFromCloud,
        uploadLocalData,
        saveStationsToCloud,
        saveSelectedStationToCloud,
        saveLanguageToCloud,
        manualSync,
        deleteCloudData,
        isSyncEnabled: () => syncEnabled
    };
}
