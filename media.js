// IskrCLOCK — media layer: built-in station catalog, custom stations storage
// (localStorage + IndexedDB) with migration of older formats, M3U/PLS parsing,
// hls.js loading, media adapters (HTML5 audio, HLS, YouTube) and the resilient
// playback engine used by alarms, the timer signal and station preview.

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

// ========= BUILT-IN STATIONS =========
// `key` values are stored in users' alarms — never rename them.
// A station has `url` or `urls` (mirrors: every reconnect attempt takes the next one),
// or `youtube` (video ID). `hls` streams go through hls.js / native HLS.
const BUILTIN_STATIONS = [
    { key: 'fip', name: 'FIP Radio', city: { ru: 'Париж', en: 'Paris' },
        url: 'https://icecast.radiofrance.fr/fip-hifi.aac' },
    { key: 'bbc-radio-1', name: 'BBC Radio 1', city: { ru: 'Лондон', en: 'London' }, hls: true,
        url: 'https://as-hls-ww-live.akamaized.net/pool_01505109/live/ww/bbc_radio_one/bbc_radio_one.isml/bbc_radio_one-audio=320000.norewind.m3u8' },
    { key: 'npr', name: 'NPR', city: { ru: 'США', en: 'USA' },
        url: 'https://streams.kut.org/4426_128.mp3?aw_0_1st.playerid=kut-free' },
    { key: 'ninja-chill', name: 'NINJA RADIO 24/7', city: { ru: 'Онлайн', en: 'Online' }, youtube: '7bdP1Ion2xk' },
    { key: 'nts-1', name: 'NTS Radio 1', city: { ru: 'Лондон', en: 'London' },
        url: 'https://stream-relay-geo.ntslive.net/stream' },
    { key: 'nts-2', name: 'NTS Radio 2', city: { ru: 'Лондон', en: 'London' },
        url: 'https://stream-relay-geo.ntslive.net/stream2' },
    { key: 'rinse-france', name: 'Rinse France', city: { ru: 'Париж', en: 'Paris' },
        url: 'https://radio10.pro-fhi.net/radio/9041/stream' },
    { key: 'rinse-uk', name: 'Rinse UK', city: { ru: 'Лондон', en: 'London' },
        urls: ['https://admin.stream.rinse.fm/proxy/rinse_uk/stream', 'https://streamer-uk.rinse.fm:8443/stream'] },
    { key: 'europa-plus', name: { ru: 'Европа Плюс', en: 'Europa Plus' }, city: { ru: 'Москва', en: 'Moscow' },
        url: 'https://ep128.hostingradio.ru:8030/ep128' },
    // Энерджи (Газпром-Медиа) — эфир 101.ru, канал 99; пробуем разные серверы 101.ru
    { key: 'radio-energy', name: 'Radio Energy', city: { ru: 'Москва', en: 'Moscow' },
        urls: ['https://pub0302.101.ru:8443/stream/air/aac/64/99', 'https://pub0102.101.ru:8443/stream/air/aac/64/99', 'https://pub0202.101.ru:8443/stream/air/aac/64/99'] },
    // Love Radio (Krutoy Media): без UID и с Referer чужого сайта сервер отдаёт голосовую заглушку
    { key: 'love-radio', name: 'Love Radio', city: { ru: 'Москва', en: 'Moscow' }, noReferrer: true,
        url: 'https://stream2.n340.com/12_love_64_reg_44?type=aac&UID=DDBAB47E03D454FADEDBBD4BFA3DA5EA' },
    { key: 'hit-fm', name: 'Hit FM', city: { ru: 'Москва', en: 'Moscow' },
        urls: ['https://hitfm.hostingradio.ru/hitfm96.aacp', 'https://hitfm.hostingradio.ru/hitfm128.mp3'] },
    { key: 'monte-carlo', name: 'Monte Carlo', city: { ru: 'Москва', en: 'Moscow' },
        url: 'https://montecarlo.hostingradio.ru/montecarlo96.aacp' },
    { key: 'studio-21', name: 'STUDIO 21', city: { ru: 'Москва', en: 'Moscow' },
        url: 'https://stream.studio21.ru/studio2196.aacp' },
    { key: 'radio-metro', name: { ru: 'Радио МЕТРО', en: 'Radio METRO' }, city: { ru: 'Санкт-Петербург', en: 'St. Petersburg' },
        url: 'https://stream.radiometro.ru:8443/metro.mp3' },
    { key: 'hermitage', name: { ru: 'Эрмитаж FM 90.1', en: 'Hermitage FM 90.1' }, city: { ru: 'Санкт-Петербург', en: 'St. Petersburg' },
        url: 'https://hermitage.hostingradio.ru/hermitage128.mp3' },
    { key: 'kurs-radio', name: 'KURS Radio', city: { ru: 'Санкт-Петербург', en: 'St. Petersburg' },
        url: 'https://listen9.myradio24.com/kursradio' },
    { key: 'classic', name: { ru: 'Классический', en: 'Classic' }, city: { ru: 'Сигнал без интернета', en: 'Works offline' }, classic: true }
];

function findBuiltinStation(key) {
    return BUILTIN_STATIONS.find(station => station.key === key) || null;
}

// ========= AUDIO FILES (IndexedDB) =========
// Records: { id, stationId, fileIndex, name, data } where data is a Blob
// (older versions stored base64 data URL strings — both are played).
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

function dbRequest(makeRequest) {
    return new Promise((resolve, reject) => {
        let request;
        try {
            request = makeRequest();
        } catch (e) {
            reject(e);
            return;
        }
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function loadFilesFromDB(stationId) {
    return dbRequest(() => dbStore('readonly').index('stationId').getAll(stationId))
        .then(files => files.sort((a, b) => a.fileIndex - b.fileIndex));
}

function getFileFromDB(fileId) {
    return dbRequest(() => dbStore('readonly').get(fileId));
}

function saveFileToDB(stationId, fileIndex, fileName, fileData) {
    return dbRequest(() => dbStore('readwrite').add({ stationId, fileIndex, name: fileName, data: fileData }));
}

function deleteFileFromDB(fileId) {
    return dbRequest(() => dbStore('readwrite').delete(fileId));
}

// A stored track can be a Blob or (legacy) a data URL string
function trackSource(data) {
    if (typeof data === 'string') {
        return { url: data, release: null };
    }
    const url = URL.createObjectURL(data);
    return { url, release: () => URL.revokeObjectURL(url) };
}

function fileSizeOf(data) {
    if (!data) return 0;
    if (typeof data === 'string') {
        const comma = data.indexOf(',');
        return Math.round((data.length - comma - 1) * 3 / 4);
    }
    return data.size || 0;
}

// "MP3 · 6,1 МБ"
function describeFile(name, size, lang = 'ru') {
    const ext = (String(name).split('.').pop() || '').toUpperCase();
    const mb = (size / 1048576).toFixed(1);
    return `${ext} · ${lang === 'ru' ? mb.replace('.', ',') + ' МБ' : mb + ' MB'}`;
}

// ========= LINKS =========
function extractYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    urlOrId = String(urlOrId).trim();
    if (/^[\w-]{11}$/.test(urlOrId)) {
        return urlOrId;
    }
    const match = urlOrId.match(/(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/live\/)([\w-]{11})/);
    return match ? match[1] : null;
}

function hostnameOf(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        return url;
    }
}

// Kind of a stream URL: 'hls' (.m3u8), 'm3u' (.m3u/.pls playlist or a stored playlist file), 'stream'
function streamKind(url) {
    if (url.startsWith('data:')) return 'm3u';
    if (/\.m3u8($|\?)/i.test(url)) return 'hls';
    if (/\.(m3u|pls)($|\?)/i.test(url)) return 'm3u';
    return 'stream';
}

// Turns pasted text (links separated by spaces, commas or new lines) into playlist items
function parseLinks(text) {
    return String(text).split(/[\s,]+/).filter(Boolean).map(link => {
        const list = link.match(/[?&]list=([\w-]+)/);
        if (list && /youtu/.test(link)) return { k: 'ytlist', list: list[1] };
        const videoId = /youtu/.test(link) || /^[\w-]{11}$/.test(link) ? extractYouTubeId(link) : null;
        if (videoId) return { k: 'youtube', vid: videoId };
        if (!/^https?:\/\/\S+$/i.test(link)) return null;
        return { k: streamKind(link), url: link };
    }).filter(Boolean);
}

// Parse an M3U / PLS playlist and extract the first stream URL
async function parsePlaylistFile(url, proxyIndex = 0) {
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
        let response;
        if (url.startsWith('http:')) {
            response = await fetch(getProxiedURL(url, proxyIndex));
        } else {
            // https: directly; a server without CORS headers is read through a proxy
            try {
                response = await fetch(url);
            } catch (e) {
                response = await fetch(getProxiedURL(url, proxyIndex));
            }
        }
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        text = await response.text();
    }

    // M3U: a bare URL per line; PLS: "File1=http://…"
    for (const line of text.split('\n')) {
        const match = line.trim().match(/^(?:File\d+=)?(https?:\/\/\S+)/i);
        if (match) return match[1];
    }
    const error = new Error('No stream URL found in playlist');
    error.permanent = true;
    throw error;
}

// ========= CUSTOM STATIONS =========
// Format v2 (localStorage "customStations"):
//   { id, name, items: [item], shuffle, loop }
//   item: { k: 'stream'|'hls'|'m3u', url } | { k: 'youtube', vid } | { k: 'ytlist', list }
//       | { k: 'file', fileId, name, size }   (fileId → IndexedDB record; legacy: inline `data`)
// Older formats ({ type: 'radio'|'hls'|'local'|'youtube', url, videoIds, fileCount, files })
// are converted once by migrateCustomStations(); the original value stays in "customStations_v1".
const STATIONS_KEY = 'customStations';
const STATIONS_BACKUP_KEY = 'customStations_v1';
const SCHEMA_KEY = 'iskrSchema';
const SCHEMA_VERSION = 2;

function readJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value == null ? fallback : value;
    } catch (e) {
        return fallback;
    }
}

function loadCustomStations() {
    const stations = readJSON(STATIONS_KEY, []);
    return Array.isArray(stations) ? stations.filter(s => s && Array.isArray(s.items)) : [];
}

function saveCustomStations(stations) {
    localStorage.setItem(STATIONS_KEY, JSON.stringify(stations));
}

function newId(prefix) {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function migrateOldStation(old, index, dbReady) {
    const station = {
        id: old.id || 'legacy' + index,
        name: old.name || 'Station ' + (index + 1),
        items: [],
        shuffle: false,
        loop: true
    };

    if (old.type === 'local') {
        if (Array.isArray(old.files)) {
            // The earliest format kept base64 files in localStorage — move them to IndexedDB
            try {
                for (let i = 0; i < old.files.length; i++) {
                    const file = old.files[i];
                    const item = { k: 'file', name: file.name, size: fileSizeOf(file.data) };
                    if (dbReady) {
                        item.fileId = await saveFileToDB(station.id, i, file.name, file.data);
                    } else {
                        item.data = file.data;
                    }
                    station.items.push(item);
                }
            } catch (e) {
                // The station is retried later from the start: don't leave half of it stored twice
                await Promise.all(station.items.filter(item => item.fileId != null).map(item => deleteFileFromDB(item.fileId).catch(() => {})));
                throw e;
            }
        } else if (old.id) {
            if (!dbReady) throw new Error('IndexedDB is not available');
            const records = await loadFilesFromDB(old.id);
            station.items = records.map(record => ({ k: 'file', fileId: record.id, name: record.name, size: fileSizeOf(record.data) }));
        }
    } else if (old.type === 'youtube') {
        const ids = old.isPlaylist && Array.isArray(old.videoIds) && old.videoIds.length
            ? old.videoIds
            : [extractYouTubeId(old.url)];
        station.items = ids.filter(Boolean).map(vid => ({ k: 'youtube', vid }));
    } else if (old.url) {
        // 'radio' and the legacy 'hls' type
        station.items = [{ k: streamKind(old.url), url: old.url }];
    }
    return station;
}

// Converts custom stations from older versions; runs on every load and does nothing
// once everything is converted. A station whose files can't be read yet (IndexedDB
// unavailable or failing) keeps its original data in `legacy` and is finished on a later
// load — nothing is dropped. Returns a map old selection value → new key, so the alarm
// keeps its station ("custom-3" by index or "custom-<id>").
async function migrateCustomStations(dbReady) {
    const keyMap = {};
    const raw = localStorage.getItem(STATIONS_KEY);
    const list = readJSON(STATIONS_KEY, []);
    const needsWork = Array.isArray(list) && list.some(s => s && (!Array.isArray(s.items) || s.legacy));
    if (!needsWork) {
        localStorage.setItem(SCHEMA_KEY, String(SCHEMA_VERSION));
        return keyMap;
    }
    if (raw && localStorage.getItem(STATIONS_BACKUP_KEY) == null) {
        // A big old list (files inside) may not fit twice: convert without the copy then
        try {
            localStorage.setItem(STATIONS_BACKUP_KEY, raw);
        } catch (e) {
            console.warn('⚠️ No room for a backup copy of the stations:', e);
        }
    }

    let pending = false;
    const migrated = [];
    for (let i = 0; i < list.length; i++) {
        const entry = list[i] || {};
        let station = entry;
        if (!Array.isArray(entry.items) || entry.legacy) {
            const old = entry.legacy || entry;
            try {
                const converted = await migrateOldStation(old, i, dbReady);
                // Items the user added while the station was waiting for its files stay too
                station = { ...converted, ...(entry.legacy ? { name: entry.name, shuffle: entry.shuffle, loop: entry.loop } : {}), items: [...converted.items, ...(entry.legacy ? entry.items : [])] };
            } catch (error) {
                console.warn('⚠️ Station kept for a later migration:', old.name, error);
                pending = true;
                station = { id: old.id || 'legacy' + i, name: entry.name || old.name || 'Station ' + (i + 1), items: entry.legacy ? entry.items : [], shuffle: false, loop: true, legacy: old };
            }
        }
        migrated.push(station);
        keyMap['custom-' + i] = 'custom-' + station.id;
        const oldId = (entry.legacy || entry).id;
        if (oldId) keyMap['custom-' + oldId] = 'custom-' + station.id;
    }
    saveCustomStations(migrated);
    localStorage.setItem(SCHEMA_KEY, pending ? '1' : String(SCHEMA_VERSION));
    return keyMap;
}

function findCustomStation(key, stations = loadCustomStations()) {
    if (!key || !key.startsWith('custom-')) return null;
    const id = key.slice('custom-'.length);
    return stations.find(station => station.id === id) || null;
}

// ========= YOUTUBE PLAYER =========
// One hidden player per page (#youtube-player). Its events are routed to the
// playback that currently owns it (youtubeEventTarget).
let youtubePlayer = null;
let youtubePlayerReady = false;
let youtubeEventTarget = null; // { ctx, permanentErrors, onEnded }

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
                    (youtubeEventTarget.onEnded || youtubeEventTarget.ctx.ended)();
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
        script.onerror = () => {
            script.remove(); // a later retry adds a fresh tag instead of piling them up
            reject(new Error('Failed to load ' + src));
        };
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

function youtubeAdapter(ctx, target) {
    youtubeEventTarget = target;
    return {
        getTime: () => {
            try { return youtubePlayer.getCurrentTime(); } catch (e) { return 0; }
        },
        setVolume: (v) => {
            try { youtubePlayer.setVolume(Math.round(v * 100)); } catch (e) { /* player not ready */ }
        },
        destroy: () => {
            if (youtubeEventTarget === target) youtubeEventTarget = null;
            try { youtubePlayer.stopVideo(); } catch (e) { /* ignore */ }
        }
    };
}

function requireYouTube() {
    if (!youtubePlayerReady) {
        throw new Error('YouTube player is not ready');
    }
}

function createYouTubeAdapter(videoId, ctx, permanentErrors) {
    requireYouTube();
    const adapter = youtubeAdapter(ctx, { ctx, permanentErrors });
    youtubePlayer.setVolume(Math.round(ctx.volume() * 100));
    youtubePlayer.loadVideoById(videoId);
    return adapter;
}

// A YouTube playlist (list=…) plays through on its own; the item ends after its last video
function createYouTubeListAdapter(listId, ctx, shuffle) {
    requireYouTube();
    const target = {
        ctx,
        permanentErrors: false,
        onEnded: () => {
            let last = true;
            try {
                const ids = youtubePlayer.getPlaylist() || [];
                last = youtubePlayer.getPlaylistIndex() >= ids.length - 1;
            } catch (e) { /* treat as the end */ }
            if (last) ctx.ended();
        }
    };
    const adapter = youtubeAdapter(ctx, target);
    youtubePlayer.setVolume(Math.round(ctx.volume() * 100));
    youtubePlayer.loadPlaylist({ list: listId, listType: 'playlist', index: 0 });
    try { youtubePlayer.setShuffle(!!shuffle); } catch (e) { /* not ready for shuffle yet */ }
    return adapter;
}

// A live stream never really ends — "ended" means the connection dropped, so reconnect
function streamContext(ctx) {
    return { ...ctx, ended: () => ctx.fail('stream ended') };
}

// Radio stream URL of a custom item: resolves .m3u/.pls playlists, picks HLS or plain audio,
// routes plain-HTTP streams through a CORS proxy (a different one on every attempt).
async function createStreamAdapter(streamUrl, ctx, attempt) {
    ctx = streamContext(ctx);
    let url = streamUrl;
    const proxyIndex = Math.max(0, attempt - 1);
    // A playlist may point to another playlist
    for (let depth = 0; streamKind(url) === 'm3u'; depth++) {
        if (depth === 3) {
            const error = new Error('Playlist nesting is too deep');
            error.permanent = true;
            throw error;
        }
        url = await parsePlaylistFile(url, proxyIndex);
    }
    if (streamKind(url) === 'hls') {
        return createHlsAdapter(url, ctx, proxyIndex);
    }
    return createAudioAdapter(url.startsWith('http:') ? getProxiedURL(url, proxyIndex) : url, ctx);
}

async function createItemAdapter(item, ctx, attempt) {
    switch (item.k) {
        case 'youtube':
            return createYouTubeAdapter(item.vid, ctx, false);
        case 'ytlist':
            return createYouTubeListAdapter(item.list, ctx, false);
        case 'file': {
            let data = item.data;
            if (!data) {
                let record = null;
                try {
                    if (item.fileId != null) record = await getFileFromDB(item.fileId);
                } catch (e) {
                    console.warn('⚠️ IndexedDB:', e);
                }
                if (!record) {
                    const error = new Error('File not found in IndexedDB');
                    error.permanent = true;
                    throw error;
                }
                data = record.data;
            }
            const source = trackSource(data);
            return createAudioAdapter(source.url, ctx, source.release);
        }
        default:
            return createStreamAdapter(item.url, ctx, attempt);
    }
}

// ========= PLAYBACK ENGINE =========
// One engine per page; one source plays at a time. A session keeps the source playing:
// when a stream errors out, stops or stalls it reconnects for RECONNECT_WINDOW_MS first.
// Alarm and timer sessions then turn on the backup signal (and keep retrying in the
// background, switching back as soon as the stream plays); preview sessions just stop.
const PLAYBACK = {
    FADE_MS: 30000,               // нарастание громкости 0 → выбранная громкость
    RECONNECT_WINDOW_MS: 15000,   // сколько пытаемся переподключиться до резервного сигнала
    RETRY_DELAYS_MS: [1000, 2000, 3000, 4000],
    BACKGROUND_RETRY_MS: 20000,   // пока играет резервный сигнал, продолжаем пробовать поток
    CONNECT_TIMEOUT_MS: 10000,    // подключение, которое не заиграло за это время, считается неудачным
    STALL_TIMEOUT_MS: 8000        // поток «завис», если позиция не меняется столько времени
};

function shuffledOrder(n) {
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
}

// hooks: getVolume() → 0..1, onChange(state)
function createPlaybackEngine(hooks) {
    let session = null;
    let lastError = null;

    // ----- classic (backup) signal: Web Audio, works offline -----
    let audioContext = null;
    let classicInterval = null;
    let classicGain = null;
    let classicVolume = null;

    function getAudioContext() {
        if (!audioContext) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return null;
            audioContext = new Ctx();
        }
        if (audioContext.state === 'suspended') {
            audioContext.resume().catch(() => {});
        }
        return audioContext;
    }

    // The synthesized chord is quieter than music, so 50 % sounds like the old fixed level
    function classicLevel() {
        return hooks.getVolume() * 2;
    }

    function playClassic(fade) {
        stopClassic();
        const ctx = getAudioContext();
        if (!ctx) return;

        // notes → gain (fade-in) → classicVolume (volume slider) → speakers
        const volume = ctx.createGain();
        volume.gain.value = classicLevel();
        volume.connect(ctx.destination);
        classicVolume = volume;

        const gain = ctx.createGain();
        gain.connect(volume);
        gain.gain.setValueAtTime(fade ? 0.3 : 1, ctx.currentTime);
        if (fade) {
            gain.gain.linearRampToValueAtTime(1, ctx.currentTime + PLAYBACK.FADE_MS / 1000);
        }
        classicGain = gain;

        const frequencies = [523, 659, 784]; // C, E, G
        const playChord = () => {
            if (classicGain !== gain) return;
            const start = ctx.currentTime;
            frequencies.forEach((freq, index) => {
                const oscillator = ctx.createOscillator();
                const noteGain = ctx.createGain();
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(freq, start);
                oscillator.connect(noteGain);
                noteGain.connect(gain);

                const noteStart = start + index * 0.1;
                noteGain.gain.setValueAtTime(0, noteStart);
                noteGain.gain.linearRampToValueAtTime(0.1, noteStart + 0.1);
                noteGain.gain.linearRampToValueAtTime(0, noteStart + 2);
                oscillator.start(noteStart);
                oscillator.stop(noteStart + 2);
            });
        };

        playChord();
        classicInterval = setInterval(playChord, 3000);
    }

    function stopClassic() {
        clearInterval(classicInterval);
        classicInterval = null;
        if (classicGain) {
            classicGain.disconnect();
            classicGain = null;
        }
        if (classicVolume) {
            classicVolume.disconnect();
            classicVolume = null;
        }
    }

    // ----- sources -----
    // Resolves a station key into { items, shuffle, loop, factory(s, ctx) }
    function resolveSource(key) {
        const builtin = findBuiltinStation(key);
        if (builtin) {
            if (builtin.classic) return { classic: true };
            if (builtin.youtube) {
                return { items: [builtin], factory: (s, ctx) => createYouTubeAdapter(builtin.youtube, ctx, false) };
            }
            const urls = builtin.urls || [builtin.url];
            const pick = s => urls[(s.attempt - 1) % urls.length];
            if (builtin.hls) {
                return { items: [builtin], factory: (s, ctx) => createHlsAdapter(pick(s), streamContext(ctx), s.attempt - 1) };
            }
            return { items: [builtin], factory: (s, ctx) => createAudioAdapter(pick(s), streamContext(ctx), null, { noReferrer: !!builtin.noReferrer }) };
        }

        const station = findCustomStation(key);
        if (!station || !station.items.length) return null;
        return {
            items: station.items,
            shuffle: !!station.shuffle,
            loop: station.loop !== false,
            factory: (s, ctx) => createItemAdapter(station.items[s.order[s.pos % s.order.length]], ctx, s.attempt)
        };
    }

    function snapshot() {
        if (!session) {
            return { playing: false, key: null, error: lastError };
        }
        const s = session;
        return {
            playing: true,
            key: s.key,
            purpose: s.purpose,
            status: s.status,
            failures: s.failures,
            itemIndex: s.order ? s.order[s.pos % s.order.length] : 0,
            itemCount: s.order ? s.order.length : 1,
            fallback: s.fallbackActive,
            error: null
        };
    }

    function notify() {
        if (hooks.onChange) hooks.onChange(snapshot());
    }

    function sessionVolume(s) {
        const volume = hooks.getVolume();
        if (!s.fade) return volume;
        return volume * Math.min(1, (Date.now() - s.fadeStart) / PLAYBACK.FADE_MS);
    }

    function disposeMedia(s) {
        if (s.media) {
            try {
                s.media.destroy();
            } catch (e) {
                console.warn('⚠️ Error releasing media:', e);
            }
            s.media = null;
        }
    }

    // options: { purpose: 'preview' | 'alarm' | 'timer', fade, startAt }
    function play(key, options = {}) {
        stop(true);
        lastError = null;
        getAudioContext(); // unlock audio while we may still have a user gesture

        const purpose = options.purpose || 'preview';
        const fade = !!options.fade;
        const source = resolveSource(key);

        const s = {
            key,
            purpose,
            fade,
            fadeStart: Date.now(),
            media: null,
            ctx: null,
            stopped: false,
            attempt: 0,
            failures: 0,
            consecutiveErrors: 0,
            phase: 'idle',
            phaseSince: Date.now(),
            unhealthySince: Date.now(),
            lastTime: -1,
            lastProgressAt: 0,
            fallbackActive: false,
            retryTimer: null,
            ticker: null,
            status: 'connecting',
            order: null,
            pos: 0,
            loop: true
        };
        session = s;

        if (!source || source.classic) {
            // The classic signal, or an unknown / empty station (alarms must still ring)
            if (!source && purpose === 'preview') {
                session = null;
                lastError = 'unavailable';
                notify();
                return;
            }
            s.status = '';
            s.classicOnly = true;
            playClassic(fade);
            notify();
            return;
        }

        const n = source.items.length;
        s.order = source.shuffle ? shuffledOrder(n) : Array.from({ length: n }, (_, i) => i);
        s.loop = purpose === 'preview' ? source.loop !== false : true; // alarms never go silent
        s.factory = source.factory;
        if (options.startAt != null) {
            const at = s.order.indexOf(options.startAt);
            s.pos = at >= 0 ? at : 0;
        }

        s.ticker = setInterval(() => supervise(s), 1000);
        notify();
        connect(s);
    }

    function stop(silent) {
        const s = session;
        session = null;
        if (s) {
            s.stopped = true;
            clearTimeout(s.retryTimer);
            clearInterval(s.ticker);
            disposeMedia(s);
        }
        stopClassic();
        if (!silent) notify();
    }

    async function connect(s) {
        if (s.stopped) return;
        s.attempt++;
        disposeMedia(s);

        const attempt = s.attempt;
        const ctx = {
            dead: false,
            isCurrent: () => !ctx.dead && !s.stopped && s.attempt === attempt,
            playing: () => { if (ctx.isCurrent()) onPlaying(s); },
            fail: (reason, permanent) => {
                if (!ctx.isCurrent()) return;
                ctx.dead = true;
                onFailure(s, reason, permanent);
            },
            ended: () => {
                if (!ctx.isCurrent()) return;
                ctx.dead = true;
                onEnded(s);
            },
            volume: () => sessionVolume(s)
        };
        s.ctx = ctx;
        s.phase = 'connecting';
        s.phaseSince = Date.now();

        try {
            const media = await s.factory(s, ctx);
            if (!ctx.isCurrent()) {
                if (media) media.destroy();
                return;
            }
            s.media = media;
        } catch (error) {
            ctx.fail(error && error.message ? error.message : String(error), error && error.permanent);
        }
    }

    function onPlaying(s) {
        if (s.phase === 'playing') return;
        s.phase = 'playing';
        s.phaseSince = Date.now();
        s.lastTime = -1;
        s.lastProgressAt = Date.now();
        s.unhealthySince = null;
        s.failures = 0;
        s.consecutiveErrors = 0;
        if (s.fallbackActive) {
            s.fallbackActive = false;
            stopClassic();
        }
        s.status = '';
        notify();
    }

    // A file or a video finished: go to the next item (a single item plays again)
    function onEnded(s) {
        s.pos++;
        if (s.purpose === 'preview' && !s.loop && s.pos >= s.order.length) {
            stop();
            return;
        }
        notify();
        connect(s);
    }

    function startFallback(s, status) {
        if (s.fallbackActive) return;
        if (s.purpose === 'preview') {
            // Preview doesn't beep — it gives up and reports the error
            lastError = status === 'unavailable' ? 'unavailable' : 'failed';
            stop();
            return;
        }
        s.fallbackActive = true;
        s.status = status;
        playClassic(s.fade);
        notify();
    }

    function onFailure(s, reason, permanent) {
        console.warn(`⚠️ Playback problem (${reason})${permanent ? ' — permanent' : ''}`);
        disposeMedia(s);
        s.phase = 'waiting';
        s.phaseSince = Date.now();
        s.failures++;
        if (!s.unhealthySince) s.unhealthySince = Date.now();

        const n = s.order.length;
        if (n > 1) {
            // Playlist: skip the broken item; it's a real failure only if every item fails
            s.consecutiveErrors++;
            s.pos++;
            // A playlist that doesn't loop ends after its last item, even a broken one
            if (s.purpose === 'preview' && !s.loop && s.pos >= n) {
                if (s.consecutiveErrors >= n) lastError = 'failed';
                stop();
                return;
            }
            if (s.consecutiveErrors >= n * 2) {
                startFallback(s, 'fallback');
                if (s.stopped) return;
            }
        }

        if (permanent && n === 1) {
            startFallback(s, 'unavailable');
        } else if (Date.now() - s.unhealthySince >= PLAYBACK.RECONNECT_WINDOW_MS) {
            startFallback(s, 'fallback');
        }
        if (s.stopped) return;

        if (!s.fallbackActive) {
            s.status = 'reconnecting';
        }
        notify();

        let delay = n > 1 && s.consecutiveErrors < n
            ? 300
            : PLAYBACK.RETRY_DELAYS_MS[Math.min(s.failures - 1, PLAYBACK.RETRY_DELAYS_MS.length - 1)];
        if (s.fallbackActive) {
            delay = permanent ? PLAYBACK.BACKGROUND_RETRY_MS * 3 : PLAYBACK.BACKGROUND_RETRY_MS;
        }
        clearTimeout(s.retryTimer);
        s.retryTimer = setTimeout(() => connect(s), delay);
    }

    function supervise(s) {
        if (s.stopped) return;
        const now = Date.now();

        if (s.media) {
            s.media.setVolume(sessionVolume(s));
        }

        if (s.phase === 'connecting' && now - s.phaseSince > PLAYBACK.CONNECT_TIMEOUT_MS) {
            s.ctx.fail('connection timeout');
        } else if (s.phase === 'playing' && s.media) {
            const time = s.media.getTime();
            if (time !== s.lastTime) {
                s.lastTime = time;
                s.lastProgressAt = now;
            } else if (now - s.lastProgressAt > PLAYBACK.STALL_TIMEOUT_MS) {
                s.ctx.fail('playback stalled');
            }
        }

        // Still not playing after the reconnect window — let the backup signal play meanwhile
        if (!s.stopped && s.unhealthySince && now - s.unhealthySince >= PLAYBACK.RECONNECT_WINDOW_MS) {
            startFallback(s, 'fallback');
        }
    }

    // Previous / next item of a playlist
    function step(delta) {
        const s = session;
        if (!s || !s.order || s.order.length < 2) return false;
        s.pos = (s.pos + delta + s.order.length) % s.order.length;
        s.consecutiveErrors = 0;
        clearTimeout(s.retryTimer);
        notify();
        connect(s);
        return true;
    }

    // The playing playlist was edited: take its new items and order without interrupting
    // the current one (`currentIndex` — its index in the new list, or -1 if it was removed)
    function refresh(currentIndex) {
        const s = session;
        if (!s || !s.order || s.classicOnly) return;
        const source = resolveSource(s.key);
        if (!source || source.classic || !source.items.length) return;
        const n = source.items.length;
        s.order = source.shuffle ? shuffledOrder(n) : Array.from({ length: n }, (_, i) => i);
        s.loop = s.purpose === 'preview' ? source.loop !== false : true;
        s.factory = source.factory;
        const at = currentIndex == null ? -1 : s.order.indexOf(currentIndex);
        s.pos = at >= 0 ? at : Math.min(s.pos, n - 1);
        notify();
    }

    function applyVolume() {
        if (session && session.media) {
            session.media.setVolume(sessionVolume(session));
        }
        if (classicVolume) {
            classicVolume.gain.value = classicLevel();
        }
    }

    return {
        play,
        stop: () => stop(),
        step,
        refresh,
        applyVolume,
        getState: snapshot,
        unlock: getAudioContext
    };
}
