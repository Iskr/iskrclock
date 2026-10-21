// IskrCLOCK — shared media code for index.html and custom-stations.html:
// custom stations storage (localStorage + IndexedDB), CORS proxies, M3U parsing,
// hls.js loading and media adapters for HTML5 audio, HLS and YouTube.

// ========= CORS PROXIES =========
const corsProxies = [
    'https://corsproxy.io/?',
    'https://proxy.cors.sh/',
    'https://thingproxy.freeboard.io/fetch/',
    'https://api.allorigins.win/raw?url='
];

function getProxiedURL(url, proxyIndex = 0) {
    return corsProxies[proxyIndex % corsProxies.length] + encodeURIComponent(url);
}

// ========= CUSTOM STATIONS (localStorage) =========
function loadCustomStations() {
    try {
        const saved = JSON.parse(localStorage.getItem('customStations'));
        return Array.isArray(saved) ? saved : [];
    } catch (e) {
        return [];
    }
}

function saveCustomStations(stations) {
    localStorage.setItem('customStations', JSON.stringify(stations));
}

// Custom stations are referenced by their id ("custom-<id>"), so deleting
// another station doesn't silently switch the alarm to a different one.
// Old selections stored as "custom-<index>" are still understood.
function customStationValue(station, index) {
    return 'custom-' + (station.id || index);
}

function findCustomStation(value) {
    const key = value.slice('custom-'.length);
    const stations = loadCustomStations();
    const byId = stations.find(station => station.id === key);
    if (byId) return byId;
    return /^\d+$/.test(key) ? stations[parseInt(key, 10)] || null : null;
}

// ========= AUDIO FILES (IndexedDB) =========
// Files are stored as Blobs (older versions stored base64 data URLs — both work).
let db = null;
const DB_NAME = 'IskrClockDB';
const DB_VERSION = 1;
const STORE_NAME = 'audioFiles';

function initDB() {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not available'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('stationId', 'stationId', { unique: false });
            }
        };
    });
}

function dbStore(mode) {
    if (!db) throw new Error('Database is not available');
    return db.transaction([STORE_NAME], mode).objectStore(STORE_NAME);
}

function loadFilesFromDB(stationId) {
    return new Promise((resolve, reject) => {
        const request = dbStore('readonly').index('stationId').getAll(stationId);
        request.onsuccess = () => resolve(request.result.sort((a, b) => a.fileIndex - b.fileIndex));
        request.onerror = () => reject(request.error);
    });
}

function saveFileToDB(stationId, fileIndex, fileName, fileData) {
    return new Promise((resolve, reject) => {
        const request = dbStore('readwrite').add({ stationId, fileIndex, name: fileName, data: fileData });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function deleteFilesFromDB(stationId) {
    return new Promise((resolve, reject) => {
        const store = dbStore('readwrite');
        const request = store.index('stationId').getAllKeys(stationId);
        request.onsuccess = () => {
            request.result.forEach(key => store.delete(key));
            store.transaction.oncomplete = () => resolve();
            store.transaction.onerror = () => reject(store.transaction.error);
        };
        request.onerror = () => reject(request.error);
    });
}

// A stored track can be a Blob or (legacy) a data URL string
function trackSource(track) {
    if (typeof track.data === 'string') {
        return { url: track.data, release: null };
    }
    const url = URL.createObjectURL(track.data);
    return { url, release: () => URL.revokeObjectURL(url) };
}

// ========= PLAYLISTS & YOUTUBE IDS =========
// Parse M3U playlist and extract the first stream URL
async function parseM3UPlaylist(url) {
    let text;
    if (url.startsWith('data:')) {
        const [header, payload] = url.split(',');
        if (header.includes(';base64')) {
            const bytes = Uint8Array.from(atob(payload), c => c.charCodeAt(0));
            text = new TextDecoder().decode(bytes);
        } else {
            text = decodeURIComponent(payload);
        }
    } else {
        const response = await fetch(url.startsWith('http:') ? getProxiedURL(url) : url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        text = await response.text();
    }

    const streamUrl = text.split('\n')
        .map(line => line.trim())
        .find(line => line.startsWith('http://') || line.startsWith('https://'));
    if (!streamUrl) {
        const error = new Error('No stream URL found in playlist');
        error.permanent = true;
        throw error;
    }
    return streamUrl;
}

function isPlainM3U(url) {
    return url.startsWith('data:') || /\.m3u($|\?)/i.test(url);
}

function extractYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    urlOrId = urlOrId.trim();
    if (/^[\w-]{11}$/.test(urlOrId)) {
        return urlOrId;
    }

    const match = urlOrId.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{11})/);
    return match ? match[1] : null;
}

// ========= YOUTUBE PLAYER =========
// One hidden player per page (#youtube-player). Its events are routed to the
// playback that currently owns it (youtubeEventTarget).
let youtubePlayer = null;
let youtubePlayerReady = false;
let youtubeEventTarget = null; // { ctx, permanentErrors }

function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-player', {
        height: '1',
        width: '1',
        videoId: '',
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0
        },
        events: {
            'onReady': function() {
                youtubePlayerReady = true;
            },
            'onStateChange': function(event) {
                if (!youtubeEventTarget) return;
                if (event.data === YT.PlayerState.PLAYING) {
                    youtubeEventTarget.ctx.playing();
                } else if (event.data === YT.PlayerState.ENDED) {
                    youtubeEventTarget.ctx.ended();
                }
            },
            'onError': function(event) {
                if (!youtubeEventTarget) return;
                // 2, 100, 101, 150 — bad ID / removed / embedding forbidden: retrying won't help
                const permanent = [2, 100, 101, 150].includes(event.data) && youtubeEventTarget.permanentErrors;
                youtubeEventTarget.ctx.fail('YouTube error ' + event.data, permanent);
            }
        }
    });
}

// Loaded from code (not a <script> in <head>) so the callback above is always defined first
function loadYouTubeAPI() {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);
}

// ========= HLS =========
const HLS_FALLBACK_URL = 'https://unpkg.com/hls.js@1/dist/hls.min.js';
let hlsLoadPromise = null;

function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Failed to load ' + src));
        document.head.appendChild(script);
    });
}

// hls.js comes from jsDelivr (see <head>); if that CDN is unreachable, try a mirror
function ensureHls() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (!hlsLoadPromise) {
        hlsLoadPromise = loadScript(HLS_FALLBACK_URL)
            .then(() => {
                if (!window.Hls) throw new Error('hls.js is not available');
                return window.Hls;
            })
            .catch(error => {
                hlsLoadPromise = null;
                throw error;
            });
    }
    return hlsLoadPromise;
}

function makeProxyLoader(Hls, proxyIndex) {
    return class extends Hls.DefaultConfig.loader {
        load(context, config, callbacks) {
            if (context.url.startsWith('http:')) {
                context.url = getProxiedURL(context.url, proxyIndex);
            }
            super.load(context, config, callbacks);
        }
    };
}

// ========= MEDIA ADAPTERS =========
// Every source is wrapped into an adapter with the same interface:
//   { getTime(), setVolume(v), destroy() }
// and reports what happens through ctx:
//   ctx.playing(), ctx.fail(reason, permanent), ctx.ended(), ctx.volume()

function playAudio(audio, ctx) {
    // NotAllowedError = autoplay blocked: retrying won't help
    audio.play().catch(err => ctx.fail(err.name || 'play() failed', err.name === 'NotAllowedError'));
}

function releaseAudio(audio) {
    audio.pause();
    // Drop the source so a live stream stops downloading in the background
    audio.removeAttribute('src');
    audio.load();
}

// Some stations (Love Radio) serve a "go to our website" message instead of the
// broadcast when the request carries a Referer from another site. An <audio> element
// has no referrerpolicy attribute, and a page-wide no-referrer policy would break the
// YouTube embed, so such streams are played by an element owned by a hidden
// same-origin iframe whose document has a no-referrer policy.
let noReferrerFrame = null;

function getNoReferrerDocument() {
    if (!noReferrerFrame || !noReferrerFrame.isConnected) {
        noReferrerFrame = document.createElement('iframe');
        noReferrerFrame.style.display = 'none';
        noReferrerFrame.setAttribute('aria-hidden', 'true');
        document.body.appendChild(noReferrerFrame);
        const frameDoc = noReferrerFrame.contentDocument;
        const meta = frameDoc.createElement('meta');
        meta.name = 'referrer';
        meta.content = 'no-referrer';
        frameDoc.head.appendChild(meta);
    }
    return noReferrerFrame.contentDocument;
}

function createAudioAdapter(url, ctx, onDestroy, options = {}) {
    const audio = options.noReferrer ? getNoReferrerDocument().createElement('audio') : new Audio();
    audio.preload = 'auto';
    audio.addEventListener('playing', ctx.playing);
    audio.addEventListener('ended', ctx.ended);
    audio.addEventListener('error', () => {
        ctx.fail('media error ' + (audio.error ? audio.error.code : ''));
    });
    audio.volume = ctx.volume();
    audio.src = url;
    playAudio(audio, ctx);

    return {
        getTime: () => audio.currentTime,
        setVolume: (v) => { audio.volume = v; },
        destroy: () => {
            releaseAudio(audio);
            if (onDestroy) onDestroy();
        }
    };
}

async function createHlsAdapter(url, ctx, proxyIndex = 0) {
    let Hls = null;
    try {
        Hls = await ensureHls();
    } catch (e) {
        console.warn('⚠️ hls.js unavailable, trying native HLS', e);
    }

    if (!Hls || !Hls.isSupported()) {
        // Safari / iOS play HLS natively
        if (document.createElement('audio').canPlayType('application/vnd.apple.mpegurl')) {
            return createAudioAdapter(url, ctx);
        }
        const error = new Error('HLS is not supported in this browser');
        error.permanent = !!Hls;
        throw error;
    }

    const audio = new Audio();
    const config = { enableWorker: true, lowLatencyMode: true };
    if (url.startsWith('http:')) {
        config.loader = makeProxyLoader(Hls, proxyIndex);
    }
    const hls = new Hls(config);

    audio.addEventListener('playing', ctx.playing);
    audio.addEventListener('ended', ctx.ended);
    audio.volume = ctx.volume();

    hls.on(Hls.Events.MANIFEST_PARSED, () => playAudio(audio, ctx));
    hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data.fatal) return;
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
        } else {
            ctx.fail('HLS ' + data.details);
        }
    });

    hls.loadSource(url);
    hls.attachMedia(audio);

    return {
        getTime: () => audio.currentTime,
        setVolume: (v) => { audio.volume = v; },
        destroy: () => {
            hls.destroy();
            releaseAudio(audio);
        }
    };
}

function createYouTubeAdapter(videoId, ctx, permanentErrors) {
    if (!youtubePlayerReady) {
        throw new Error('YouTube player is not ready');
    }
    youtubeEventTarget = { ctx, permanentErrors };
    youtubePlayer.setVolume(Math.round(ctx.volume() * 100));
    youtubePlayer.loadVideoById(videoId);

    return {
        getTime: () => {
            try { return youtubePlayer.getCurrentTime(); } catch (e) { return 0; }
        },
        setVolume: (v) => {
            try { youtubePlayer.setVolume(Math.round(v * 100)); } catch (e) { /* player not ready */ }
        },
        destroy: () => {
            if (youtubeEventTarget && youtubeEventTarget.ctx === ctx) youtubeEventTarget = null;
            try { youtubePlayer.stopVideo(); } catch (e) { /* ignore */ }
        }
    };
}

// Radio stream of a custom station: resolves .m3u playlists, picks HLS or plain audio,
// routes plain-HTTP streams through a CORS proxy (a different one on every attempt).
async function createCustomRadioAdapter(stationUrl, ctx, attempt) {
    let url = stationUrl;
    if (isPlainM3U(url)) {
        url = await parseM3UPlaylist(url);
    }
    const proxyIndex = Math.max(0, attempt - 1);
    if (url.includes('.m3u8')) {
        return createHlsAdapter(url, ctx, proxyIndex);
    }
    return createAudioAdapter(url.startsWith('http:') ? getProxiedURL(url, proxyIndex) : url, ctx);
}
