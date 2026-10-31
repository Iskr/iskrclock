// IskrCLOCK v6 — single-page app: alarms, timer, stopwatch, stations, sleep calculator.
// Playback, storage and stations live in media.js; the landscape is <iskr-sky> (iskr-sky.js).
'use strict';

// ========= TRANSLATIONS =========
const I18N = {
    ru: {
        locale: 'ru-RU',
        documentTitle: 'IskrCLOCK — будильник с радио онлайн',
        tabAlarms: 'Будильники',
        tabTimer: 'Таймер',
        tabStopwatch: 'Секундомер',
        tabStations: 'Станции',
        tabSleep: 'Калькулятор сна',
        tabAlarmsShort: 'Будильник',
        tabTimerShort: 'Таймер',
        tabStopwatchShort: 'Секундомер',
        tabStationsShort: 'Станции',
        tabSleepShort: 'Сон',
        alarmDefault: 'Будильник',
        alarmN: 'Будильник {n}',
        alarmLabelAria: 'Название будильника',
        rename: 'Переименовать будильник',
        until: (h, m) => 'через ' + (h ? h + ' ч ' : '') + m + ' мин',
        alarmOff: 'выключен',
        toggleOn: 'Включить будильник',
        toggleOff: 'Выключить будильник',
        more: 'Ещё {n}',
        allAlarms: 'Все будильники · {n}',
        close: 'Закрыть',
        addAlarm: 'Добавить будильник',
        nowPlaying: 'Сейчас играет',
        alarmSignal: 'Сигнал будильника',
        timerSignal: 'Сигнал по окончании',
        swMusic: 'Музыка, пока идёт отсчёт',
        stopped: 'Остановлено',
        change: 'Изменить',
        hide: 'Скрыть',
        snoozeLabel: 'Подремать',
        minutes: '{n} мин',
        fadeLabel: 'Нарастание',
        fadeOn: '30 секунд',
        fadeOff: 'Выкл.',
        volumeLabel: 'Громкость',
        daysLabel: 'Дни',
        dayNames: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
        everyDay: 'Каждый день',
        once: 'Один раз',
        weekdays: 'Будни',
        weekends: 'Выходные',
        delete: 'Удалить',
        alarmHint: 'Будильник срабатывает, пока эта вкладка открыта. Экран не будет гаснуть, пока есть включённый будильник.',
        unlockHint: 'Нажмите в любом месте страницы, чтобы будильник смог включить звук',
        timerHint: 'Пробел — старт или пауза, R — сброс',
        stopwatchHint: 'Пробел — старт или пауза, L — круг, R — сброс',
        timerRunning: 'Таймер запущен',
        paused: 'Пауза',
        timeUp: 'Время вышло',
        start: 'Старт',
        pause: 'Пауза',
        resume: 'Продолжить',
        reset: 'Сброс',
        lap: 'Круг',
        lapN: 'Круг {n}',
        minShort: '{n} мин',
        radio: 'Радио',
        myStations: 'Мои станции и плейлисты',
        noStations: 'Здесь появятся ваши станции и плейлисты',
        newStation: 'Новая станция или плейлист',
        addStation: '+ Добавить станцию',
        namePh: 'Название',
        linksPh: 'Ссылки на потоки, .m3u или YouTube',
        addLinkPh: 'Добавить ссылку: поток, .m3u, YouTube',
        add: 'Добавить',
        files: 'Файлы…',
        formHelp: 'Потоки MP3, AAC, OGG, HLS (.m3u8), плейлисты .m3u и .pls, файлы MP3, FLAC, WAV, OGG, OPUS, M4A, видео и плейлисты YouTube. Можно смешивать.',
        save: 'Сохранить',
        draftNote: n => `Станет плейлистом из ${n} ${plural(n, 'элемента', 'элементов', 'элементов')}. Порядок можно поменять потом.`,
        backToMine: '← Мои станции',
        items: n => `${n} ${plural(n, 'элемент', 'элемента', 'элементов')}`,
        playlistOf: n => `Плейлист · ${n} ${plural(n, 'элемент', 'элемента', 'элементов')}`,
        shuffle: 'Перемешать',
        loop: 'По кругу',
        onAlarm: 'На будильнике',
        toAlarm: 'На будильник',
        playFrom: 'Играть отсюда',
        up: 'Выше',
        down: 'Ниже',
        remove: 'Убрать',
        kinds: { stream: 'Поток', hls: 'HLS', m3u: '.m3u', file: 'Файл', youtube: 'YouTube', ytlist: 'YouTube-плейлист' },
        ytVideo: 'Видео YouTube',
        ytList: 'Плейлист YouTube',
        m3uFile: 'Плейлист потока',
        trackOf: 'Трек {n} из {m} · {label}',
        prevTrack: 'Предыдущий трек',
        nextTrack: 'Следующий трек',
        prevStation: 'Предыдущая станция',
        nextStation: 'Следующая станция',
        confirmDelete: 'Удалить «{name}»?',
        fileTooLarge: 'Файл «{name}» слишком большой (больше 350 МБ)',
        badLinks: 'Не удалось распознать ссылку',
        saveError: 'Не удалось сохранить файлы: {error}',
        dbError: 'Хранилище файлов недоступно — локальные файлы не сохранятся',
        statusConnecting: '📡 Подключение…',
        statusReconnecting: '📡 Нет связи, переподключаюсь… (попытка {n})',
        statusFallback: '🔔 Поток недоступен — играет резервный сигнал, продолжаю попытки',
        statusUnavailable: '🔔 Источник недоступен — играет резервный сигнал',
        playFailed: 'Не удалось воспроизвести',
        wantWake: 'Хочу встать в',
        goingBed: 'Ложусь в',
        now: 'Сейчас',
        setAlarmHere: 'Поставить будильник на это время',
        bedAt: 'Лечь спать стоит в',
        wakeAt: 'Проснуться стоит в',
        cycles: n => `${n} ${plural(n, 'цикл', 'цикла', 'циклов')}`,
        sleepHours: h => `${String(h).replace('.', ',')} ч сна`,
        best: 'Лучше',
        plusAlarm: '+ Будильник',
        fromSleep: 'Из калькулятора сна',
        alarmAdded: 'Будильник на {time} добавлен',
        sleepFoot: 'Цикл сна — около 90 минут, плюс 15 минут, чтобы уснуть',
        demo: 'Демо',
        exitDemo: 'Выйти из демо',
        demoTitle: 'Демо: прокрутить год и сутки',
        year: 'Год',
        day: 'Сутки',
        prevDay: 'Предыдущий день',
        nextDay: 'Следующий день',
        demoCollapse: 'Свернуть пульт',
        demoExpand: 'Развернуть пульт',
        fullscreen: 'Полноэкранный режим',
        ringTitle: 'Будильник · {label}',
        ringPlays: 'Играет {station}',
        ringStop: 'Выключить',
        ringSnooze: 'Подремать {n} мин',
        ringFade: 'Громкость нарастает 30 секунд',
        timerNotifyTitle: '⏲ Время вышло',
        timerNotifyBody: 'Таймер IskrCLOCK завершён',
        play: 'Слушать',
        pauseAria: 'Остановить'
    },
    en: {
        locale: 'en-GB',
        documentTitle: 'IskrCLOCK — online alarm clock with radio',
        tabAlarms: 'Alarms',
        tabTimer: 'Timer',
        tabStopwatch: 'Stopwatch',
        tabStations: 'Stations',
        tabSleep: 'Sleep calculator',
        tabAlarmsShort: 'Alarms',
        tabTimerShort: 'Timer',
        tabStopwatchShort: 'Stopwatch',
        tabStationsShort: 'Stations',
        tabSleepShort: 'Sleep',
        alarmDefault: 'Alarm',
        alarmN: 'Alarm {n}',
        alarmLabelAria: 'Alarm name',
        rename: 'Rename alarm',
        until: (h, m) => 'in ' + (h ? h + ' h ' : '') + m + ' min',
        alarmOff: 'off',
        toggleOn: 'Turn alarm on',
        toggleOff: 'Turn alarm off',
        more: '{n} more',
        allAlarms: 'All alarms · {n}',
        close: 'Close',
        addAlarm: 'Add alarm',
        nowPlaying: 'Now playing',
        alarmSignal: 'Alarm sound',
        timerSignal: 'Sound when done',
        swMusic: 'Music while it runs',
        stopped: 'Stopped',
        change: 'Change',
        hide: 'Hide',
        snoozeLabel: 'Snooze',
        minutes: '{n} min',
        fadeLabel: 'Fade in',
        fadeOn: '30 seconds',
        fadeOff: 'Off',
        volumeLabel: 'Volume',
        daysLabel: 'Days',
        dayNames: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
        everyDay: 'Every day',
        once: 'Once',
        weekdays: 'Weekdays',
        weekends: 'Weekends',
        delete: 'Delete',
        alarmHint: 'Alarms ring while this tab is open. The screen stays on while an alarm is enabled.',
        unlockHint: 'Click anywhere on the page so the alarm is allowed to play sound',
        timerHint: 'Space — start or pause, R — reset',
        stopwatchHint: 'Space — start or pause, L — lap, R — reset',
        timerRunning: 'Timer running',
        paused: 'Paused',
        timeUp: 'Time is up',
        start: 'Start',
        pause: 'Pause',
        resume: 'Resume',
        reset: 'Reset',
        lap: 'Lap',
        lapN: 'Lap {n}',
        minShort: '{n} min',
        radio: 'Radio',
        myStations: 'My stations & playlists',
        noStations: 'Your stations and playlists will appear here',
        newStation: 'New station or playlist',
        addStation: '+ Add a station',
        namePh: 'Name',
        linksPh: 'Stream links, .m3u or YouTube',
        addLinkPh: 'Add a link: stream, .m3u, YouTube',
        add: 'Add',
        files: 'Files…',
        formHelp: 'MP3, AAC, OGG and HLS (.m3u8) streams, .m3u and .pls playlists, MP3, FLAC, WAV, OGG, OPUS, M4A files, YouTube videos and playlists. Mix freely.',
        save: 'Save',
        draftNote: n => `Becomes a playlist of ${n} items. You can reorder it later.`,
        backToMine: '← My stations',
        items: n => `${n} ${n === 1 ? 'item' : 'items'}`,
        playlistOf: n => `Playlist · ${n} ${n === 1 ? 'item' : 'items'}`,
        shuffle: 'Shuffle',
        loop: 'Repeat',
        onAlarm: 'On alarm',
        toAlarm: 'Use for alarm',
        playFrom: 'Play from here',
        up: 'Up',
        down: 'Down',
        remove: 'Remove',
        kinds: { stream: 'Stream', hls: 'HLS', m3u: '.m3u', file: 'File', youtube: 'YouTube', ytlist: 'YouTube playlist' },
        ytVideo: 'YouTube video',
        ytList: 'YouTube playlist',
        m3uFile: 'Stream playlist',
        trackOf: 'Track {n} of {m} · {label}',
        prevTrack: 'Previous track',
        nextTrack: 'Next track',
        prevStation: 'Previous station',
        nextStation: 'Next station',
        confirmDelete: 'Delete "{name}"?',
        fileTooLarge: 'File "{name}" is too large (over 350 MB)',
        badLinks: 'Could not recognise the link',
        saveError: 'Could not save the files: {error}',
        dbError: 'File storage is unavailable — local files will not be saved',
        statusConnecting: '📡 Connecting…',
        statusReconnecting: '📡 Connection lost, reconnecting… (attempt {n})',
        statusFallback: '🔔 Stream unavailable — playing the backup signal, still retrying',
        statusUnavailable: '🔔 Source unavailable — playing the backup signal',
        playFailed: 'Could not play',
        wantWake: 'Wake up at',
        goingBed: 'Going to bed at',
        now: 'Now',
        setAlarmHere: 'Set an alarm for this time',
        bedAt: 'Go to bed at',
        wakeAt: 'Wake up at',
        cycles: n => `${n} ${n === 1 ? 'cycle' : 'cycles'}`,
        sleepHours: h => `${h} h of sleep`,
        best: 'Best',
        plusAlarm: '+ Alarm',
        fromSleep: 'From the sleep calculator',
        alarmAdded: 'Alarm for {time} added',
        sleepFoot: 'A sleep cycle is about 90 minutes, plus 15 minutes to fall asleep',
        demo: 'Demo',
        exitDemo: 'Exit demo',
        demoTitle: 'Demo: run through the year and the day',
        year: 'Year',
        day: 'Day',
        prevDay: 'Previous day',
        nextDay: 'Next day',
        demoCollapse: 'Collapse controls',
        demoExpand: 'Expand controls',
        fullscreen: 'Fullscreen',
        ringTitle: 'Alarm · {label}',
        ringPlays: 'Playing {station}',
        ringStop: 'Stop',
        ringSnooze: 'Snooze {n} min',
        ringFade: 'Volume rises over 30 seconds',
        timerNotifyTitle: '⏲ Time is up',
        timerNotifyBody: 'IskrCLOCK timer finished',
        play: 'Play',
        pauseAria: 'Stop'
    }
};

let lang = localStorage.getItem('language') === 'en' ? 'en' : 'ru';

function plural(n, one, few, many) {
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
    return many;
}

// t('key', { n: 3 }) — fills {placeholders}; function entries are called with the arguments
function t(key, vars) {
    const value = I18N[lang][key];
    if (typeof value === 'function') return value(...(Array.isArray(vars) ? vars : [vars]));
    if (typeof value !== 'string' || !vars) return value;
    return value.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
}

function localized(value) {
    return value && typeof value === 'object' ? value[lang] : value;
}

// ========= HELPERS =========
const $ = id => document.getElementById(id);
const pad = n => String(n).padStart(2, '0');

function h(tag, props = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value == null || value === false) continue;
        if (key === 'class') node.className = value;
        else if (key === 'text') node.textContent = value;
        else if (key.startsWith('on')) node.addEventListener(key.slice(2), value);
        else node.setAttribute(key, value === true ? '' : value);
    }
    for (const child of children.flat()) {
        if (child == null || child === false) continue;
        node.append(child.nodeType ? child : document.createTextNode(child));
    }
    return node;
}

function setText(id, text) {
    const node = $(id);
    if (node && node.textContent !== text) node.textContent = text;
}

function writeJSON(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('⚠️ Could not save', key, e);
    }
}

// Buttons made of <a role="button">: activate them with Enter/Space as well
function onActivate(node, handler) {
    node.addEventListener('click', handler);
    node.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handler(e);
        }
    });
}

// ========= STATE =========
const TABS = ['alarms', 'timer', 'stopwatch', 'stations', 'sleep'];
const MAX_FILE_SIZE = 350 * 1024 * 1024;
const MAX_LATE_MS = 60 * 60 * 1000;   // a ring missed by more than this (computer asleep) is skipped
const TIMER_SIGNAL_MS = 60000;        // the timer signal stops by itself after a minute

const state = {
    tab: 'alarms',
    alarms: [],
    selectedAlarmId: null,
    volume: 50,
    playerKey: 'hermitage',
    timer: { h: 0, m: 5, s: 0, total: 0, remain: 0, end: 0, running: false, done: false, station: 'classic' },
    sw: { acc: 0, start: 0, running: false, laps: [] },
    sleep: { mode: 'wake', h: 7, m: 30 },
    ringing: null,           // alarm id while the ring screen is shown
    popup: null,             // 'al' | 'tm' | 'sw' — open station list
    chipsOpen: false,
    editId: null,            // custom station open in the editor
    draft: [],               // items of the "new station" form (files stay in memory until saved)
    demo: { on: false, paused: false, speed: 1, doy: 1, hour: 12, collapsed: false },
    dbReady: false
};

const armed = {};            // alarm id → timestamp of its next ring
let alarmTimeout = null;
let timerSignalTimeout = null;
let wakeLock = null;

function newAlarm(h, m, label) {
    return { id: newId('a'), h, m, days: [false, false, false, false, false, false, false], label: label || '', on: true, station: state.playerKey || 'classic', snooze: 5, fade: true, snoozeUntil: null };
}

function saveAlarms() {
    writeJSON('alarmSettings', { v: 2, alarms: state.alarms, selectedAlarmId: state.selectedAlarmId, volume: state.volume });
}

function validStation(key) {
    if (!key) return false;
    return key.startsWith('custom-') ? !!findCustomStation(key) : !!findBuiltinStation(key);
}

// While old stations couldn't be converted (e.g. storage full), a choice of one of them is
// kept as is: the conversion is retried on the next load and the station comes back
let stationsMigrationFailed = false;
function keepStation(key) {
    return validStation(key) || (stationsMigrationFailed && !!key && key.startsWith('custom-'));
}

// Reads alarms; converts the single alarm of older versions (keeping its station)
function loadAlarms(keyMap) {
    const saved = readJSON('alarmSettings', null);
    const savedAlarms = saved && saved.v === 2 && Array.isArray(saved.alarms) ? saved.alarms.filter(a => a && typeof a === 'object') : [];
    if (savedAlarms.length) {
        // Damaged values fall back to defaults instead of breaking the page
        const num = (v, min, max, def) => { const n = Number(v); return Number.isInteger(n) && n >= min && n <= max ? n : def; };
        state.alarms = savedAlarms.map(a => {
            const alarm = { ...newAlarm(7, 30), ...a };
            alarm.id = typeof a.id === 'string' && a.id ? a.id : newId('a');
            alarm.h = num(a.h, 0, 23, 7);
            alarm.m = num(a.m, 0, 59, 30);
            alarm.snooze = num(a.snooze, 1, 30, 5);
            alarm.label = typeof a.label === 'string' ? a.label : '';
            alarm.on = !!a.on;
            alarm.fade = a.fade !== false;
            alarm.snoozeUntil = Number.isFinite(a.snoozeUntil) ? a.snoozeUntil : null;
            alarm.days = Array.isArray(a.days) && a.days.length === 7 ? a.days.map(Boolean) : [false, false, false, false, false, false, false];
            return alarm;
        });
        state.selectedAlarmId = saved.selectedAlarmId;
        state.volume = Number.isFinite(saved.volume) ? saved.volume : 50;
    } else {
        if (saved && localStorage.getItem('alarmSettings_v1') == null) {
            writeJSON('alarmSettings_v1', saved);
        }
        const old = saved || {};
        let station = localStorage.getItem('selectedStation') || 'hermitage';
        station = keyMap[station] || station;
        const hour = parseInt(old.hour, 10), minute = parseInt(old.minute, 10), snooze = parseInt(old.snooze, 10), volume = parseInt(old.volume, 10);
        const alarm = newAlarm(hour >= 0 && hour <= 23 ? hour : 7, minute >= 0 && minute <= 59 ? minute : 30);
        alarm.on = false; // the old page never remembered whether the alarm was on
        alarm.station = station;
        if (snooze >= 1) alarm.snooze = Math.min(30, snooze);
        if (typeof old.fade === 'boolean') alarm.fade = old.fade;
        state.alarms = [alarm];
        state.selectedAlarmId = alarm.id;
        state.volume = volume >= 0 && volume <= 100 ? volume : 50;
    }

    state.alarms.forEach(a => {
        if (!keepStation(a.station)) a.station = 'classic';
    });
    if (!state.alarms.some(a => a.id === state.selectedAlarmId)) {
        state.selectedAlarmId = state.alarms[0].id;
    }
    saveAlarms();
}

function selectedAlarm() {
    return state.alarms.find(a => a.id === state.selectedAlarmId) || state.alarms[0];
}

function loadOtherState() {
    const key = localStorage.getItem('playerStation');
    if (keepStation(key)) state.playerKey = key;

    const timer = readJSON('timerState', null);
    if (timer && typeof timer === 'object') {
        Object.assign(state.timer, timer);
        if (!keepStation(state.timer.station)) state.timer.station = 'classic';
        if (state.timer.running && state.timer.end <= Date.now()) {
            // Finished while the page was closed: show it as done, without the sound
            Object.assign(state.timer, { running: false, remain: 0, done: true });
        }
    }

    const sw = readJSON('stopwatchState', null);
    if (sw && typeof sw.elapsedTime === 'number') {
        state.sw = { acc: sw.elapsedTime, start: sw.startTime || 0, running: !!sw.isRunning, laps: Array.isArray(sw.laps) ? sw.laps : [] };
    }

    const sleep = readJSON('sleepCalc', null);
    if (sleep && (sleep.mode === 'wake' || sleep.mode === 'bed')) state.sleep = { ...state.sleep, ...sleep };
}

function saveTimer() {
    writeJSON('timerState', state.timer);
}

function saveStopwatch() {
    const sw = state.sw;
    writeJSON('stopwatchState', { startTime: sw.start, elapsedTime: sw.acc, isRunning: sw.running, laps: sw.laps });
}

// ========= STATIONS =========
function builtinEntry(station) {
    return { key: station.key, name: localized(station.name), sub: localized(station.city) };
}

function itemLabel(item) {
    switch (item.k) {
        case 'file': return item.name || t('kinds').file;
        case 'youtube': return item.title || t('ytVideo');
        case 'ytlist': return t('ytList');
        default:
            if (item.url && item.url.startsWith('data:')) return item.name || t('m3uFile');
            return item.name || hostnameOf(item.url || '');
    }
}

function itemSub(item) {
    switch (item.k) {
        case 'file': return describeFile(item.name || '', item.size || 0, lang);
        case 'youtube': return item.vid;
        case 'ytlist': return item.list;
        default:
            return item.url && item.url.startsWith('data:') ? t('m3uFile') : item.url;
    }
}

function customEntry(station) {
    const n = station.items.length;
    const sub = n > 1 ? t('playlistOf', n) : n === 1 ? `${t('kinds')[station.items[0].k]} · ${itemLabel(station.items[0])}` : '—';
    return { key: 'custom-' + station.id, name: station.name, sub, station };
}

function allStations() {
    return [
        ...BUILTIN_STATIONS.map(builtinEntry),
        ...loadCustomStations().map(customEntry)
    ];
}

function stationEntry(key) {
    const builtin = findBuiltinStation(key);
    if (builtin) return builtinEntry(builtin);
    const custom = findCustomStation(key);
    if (custom) return customEntry(custom);
    return builtinEntry(findBuiltinStation('classic'));
}

// ========= PLAYBACK =========
const engine = createPlaybackEngine({
    getVolume: () => state.volume / 100,
    onChange: () => renderPlayback()
});

function playingKey() {
    const s = engine.getState();
    return s.playing ? s.key : null;
}

// There is one player for the whole app: whatever is played becomes "the" station
// that the players on every tab show
function previewPlay(key, options = {}) {
    setPlayerKey(key);
    engine.play(key, { purpose: 'preview', startAt: options.startAt });
}

// ▶ / ❚❚ for a station: preview it, or stop it if it is what's playing now
function togglePreview(key, options = {}) {
    if (playingKey() === key && options.startAt == null) {
        engine.stop();
        return;
    }
    previewPlay(key, options);
}

// The ▶ / ❚❚ button of a tab's player: stops whatever plays, otherwise plays `key`
function togglePlayer(key) {
    if (playingKey()) engine.stop();
    else previewPlay(key);
}

function setPlayerKey(key) {
    state.playerKey = key;
    localStorage.setItem('playerStation', key);
}

function statusText(s) {
    if (!s.playing) return s.error ? t('playFailed') : '';
    switch (s.status) {
        case 'connecting': return t('statusConnecting');
        case 'reconnecting': return t('statusReconnecting', { n: s.failures });
        case 'fallback': return t('statusFallback');
        case 'unavailable': return t('statusUnavailable');
        default: return '';
    }
}

// ========= ALARM SCHEDULER =========
function nextRing(alarm, from = Date.now()) {
    const anyDay = alarm.days.some(Boolean);
    for (let k = 0; k < 8; k++) {
        const d = new Date(from);
        d.setDate(d.getDate() + k);
        d.setHours(alarm.h, alarm.m, 0, 0);
        if (d.getTime() <= from) continue;
        if (anyDay && !alarm.days[(d.getDay() + 6) % 7]) continue;
        return d.getTime();
    }
    return null;
}

function arm(alarm) {
    if (!alarm.on) {
        armed[alarm.id] = null;
        return;
    }
    const snooze = alarm.snoozeUntil;
    armed[alarm.id] = snooze && snooze > Date.now() - MAX_LATE_MS ? snooze : nextRing(alarm);
}

function armAll() {
    state.alarms.forEach(arm);
    scheduleAlarmTimeout();
    updateWakeLock();
}

// Besides the 1-second check, a one-shot timeout fires exactly at the earliest ring:
// background tabs throttle repeating timers, but a single timeout still runs on time.
function scheduleAlarmTimeout() {
    clearTimeout(alarmTimeout);
    const times = Object.values(armed).filter(Boolean);
    if (!times.length) return;
    const delay = Math.min(Math.max(0, Math.min(...times) - Date.now()) + 50, 2147483000);
    alarmTimeout = setTimeout(checkAlarms, delay);
}

function checkAlarms() {
    if (state.ringing) return;
    const now = Date.now();
    const due = state.alarms
        .filter(a => armed[a.id] && now >= armed[a.id])
        .sort((a, b) => armed[a.id] - armed[b.id]);
    if (!due.length) return;

    const first = due[0];
    const at = armed[first.id];
    if (now - at > MAX_LATE_MS) {
        // Missed long ago (the computer was asleep) — don't ring hours late
        first.snoozeUntil = null;
        arm(first);
        saveAlarms();
        scheduleAlarmTimeout();
        checkAlarms();
        return;
    }
    // Alarms due within the same minute ring once
    due.slice(1).forEach(a => {
        if (Math.abs(armed[a.id] - at) < 60000) {
            a.snoozeUntil = null;
            if (!a.days.some(Boolean)) a.on = false;
            arm(a);
        }
    });
    ring(first);
}

function ring(alarm) {
    state.ringing = alarm.id;
    armed[alarm.id] = null;
    state.popup = null;
    document.body.classList.add('ringing');
    $('ring').hidden = false;
    renderRing();
    requestWakeLock();
    engine.play(alarm.station, { purpose: 'alarm', fade: alarm.fade });
    document.title = '⏰ ' + (alarm.label ? t('ringTitle', { label: alarm.label }) : t('alarmDefault'));
}

function finishRing(snooze) {
    const alarm = state.alarms.find(a => a.id === state.ringing);
    state.ringing = null;
    engine.stop();
    $('ring').hidden = true;
    document.body.classList.remove('ringing');
    document.title = t('documentTitle');
    if (alarm) {
        if (snooze) {
            alarm.snoozeUntil = Date.now() + alarm.snooze * 60000;
        } else {
            alarm.snoozeUntil = null;
            if (!alarm.days.some(Boolean)) alarm.on = false; // one-time alarm
        }
    }
    saveAlarms();
    // Only the alarm that rang is re-armed: another one that came due meanwhile must still ring
    if (alarm) arm(alarm);
    scheduleAlarmTimeout();
    updateWakeLock();
    renderAlarms();
    checkAlarms();
}

async function requestWakeLock() {
    if (!('wakeLock' in navigator) || wakeLock || document.visibilityState !== 'visible') return;
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        wakeLock.addEventListener('release', () => {
            wakeLock = null;
        });
    } catch (e) {
        console.warn('⚠️ Wake Lock unavailable:', e.message);
    }
}

function updateWakeLock() {
    if (state.alarms.some(a => a.on) || state.ringing) {
        requestWakeLock();
    } else if (wakeLock) {
        wakeLock.release().catch(() => {});
        wakeLock = null;
    }
}

// ========= AUDIO UNLOCK =========
// Browsers only allow sound after the user has interacted with the page. Alarms are now
// remembered as "on" across reloads, so after a reload nobody may have clicked yet:
// unlock audio on the first interaction and ask for one while an alarm is waiting.
let audioUnlocked = false;

function hasUserActivation() {
    return audioUnlocked || !!(navigator.userActivation && navigator.userActivation.hasBeenActive);
}

function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    engine.unlock();
    renderUnlockHint();
}

function renderUnlockHint() {
    $('unlockHint').hidden = hasUserActivation() || !state.alarms.some(a => a.on);
}

// ========= SKY, ACCENT, DEMO =========
const sky = $('sky');

function dayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0);
    return Math.min(365, Math.floor((date - start) / 864e5));
}

// Colour of the day — the formula from pal() in the design prototype (oklch → sRGB)
function oklchToRgb(l, c, hue) {
    const hr = hue * Math.PI / 180, a = c * Math.cos(hr), b = c * Math.sin(hr);
    const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
    const L = l_ ** 3, M = m_ ** 3, S = s_ ** 3;
    const lin = [
        4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
        -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
        -0.0041960863 * L - 0.7034186147 * M + 1.7076147010 * S
    ];
    return lin.map(x => {
        x = Math.min(1, Math.max(0, x));
        return Math.round(255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055));
    });
}

function accentRgb(doy, hour, year) {
    const abs = doy + Math.round((Date.UTC(year, 0, 1) - Date.UTC(2026, 0, 1)) / 864e5);
    const g = (x, mu, s) => Math.exp(-((x - mu) ** 2) / (2 * s * s));
    const mixH = (a, b, k) => { const d = ((b - a + 540) % 360) - 180; return (a + d * k + 360) % 360; };
    const h0 = ((abs * 137.508) % 360 + 360) % 360;
    const warm = Math.max(g(hour, 6.8, 1.1), g(hour, 19.6, 1.2));
    const hue = mixH(h0, 30, warm * 0.55);
    const spread = 28 + (((abs * 29) % 48) + 48) % 48;
    return oklchToRgb(0.84, 0.11, hue + spread * 1.6);
}

// "Scene time": the real time, or the demo time while the demo runs
function sceneTime() {
    if (state.demo.on) {
        return { doy: state.demo.doy, hour: state.demo.hour, year: new Date().getFullYear() };
    }
    const now = new Date();
    return { doy: dayOfYear(now), hour: now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600, year: now.getFullYear() };
}

let lastAccentKey = '';

function updateSky() {
    const scene = sceneTime();
    sky.doy = scene.doy;
    sky.year = scene.year;
    sky.hour = scene.hour;
    const key = scene.doy + '/' + Math.round(scene.hour * 12);
    if (key !== lastAccentKey) {
        lastAccentKey = key;
        const [r, g, b] = accentRgb(scene.doy, scene.hour, scene.year);
        document.documentElement.style.setProperty('--accent', `rgb(${r}, ${g}, ${b})`);
        sky.glowColor = [r, g, b]; // the music glow on the water takes the colour of the day
    }
}

if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sky.setAttribute('still', '1');
}

// The water glows to the music while a station plays (when its sound may be read)
sky.levels = () => engine.getLevels(7);

let demoFrame = null;
let demoLast = 0;

function demoLoop(ts) {
    const dt = Math.min(0.1, (ts - demoLast) / 1000);
    demoLast = ts;
    const d = state.demo;
    if (!d.paused) {
        d.hour += dt * d.speed / 3600;
        if (d.hour >= 24) {
            d.hour -= 24;
            d.doy = (d.doy + (d.speed >= 3600 ? 8 : 0)) % 365 + 1;
        }
        updateSky();
        renderClock();
        renderDemo();
    }
    demoFrame = requestAnimationFrame(demoLoop);
}

function toggleDemo() {
    const d = state.demo;
    cancelAnimationFrame(demoFrame);
    if (d.on) {
        d.on = false;
    } else {
        const now = new Date();
        Object.assign(d, { on: true, paused: false, doy: dayOfYear(now), hour: now.getHours() + now.getMinutes() / 60 });
        demoLast = performance.now();
        demoFrame = requestAnimationFrame(demoLoop);
    }
    updateSky();
    renderClock();
    renderDemo();
}

function renderDemo() {
    const d = state.demo;
    $('demoBtn').classList.toggle('on', d.on);
    setText('demoIcon', d.on ? '✕' : '▶');
    setText('demoLabel', d.on ? t('exitDemo') : t('demo'));
    $('demoBtn').title = t('demoTitle');
    $('demoPanel').hidden = !d.on;
    if (!d.on) return;
    setText('demoPause', d.paused ? '▶' : '❚❚');
    $('demoPanel').classList.toggle('collapsed', d.collapsed);
    $('demoCollapse').title = t(d.collapsed ? 'demoExpand' : 'demoCollapse');
    $('demoCollapse').setAttribute('aria-label', $('demoCollapse').title);
    $('demoCollapse').setAttribute('aria-expanded', String(!d.collapsed));
    const date = new Date(new Date().getFullYear(), 0, d.doy);
    setText('demoText', date.toLocaleDateString(t('locale'), { day: 'numeric', month: 'long' }) + ' · ' + pad(Math.floor(d.hour)) + ':' + pad(Math.floor((d.hour % 1) * 60)));
    if (document.activeElement !== $('demoDoy')) $('demoDoy').value = d.doy;
    if (document.activeElement !== $('demoHour')) $('demoHour').value = d.hour;
    $('demoSpeeds').querySelectorAll('button').forEach(b => b.classList.toggle('on', +b.dataset.speed === d.speed));
}

// ========= CLOCK (alarms tab) =========
function renderClock() {
    const now = new Date();
    let hours = now.getHours(), minutes = now.getMinutes(), date = now;
    if (state.demo.on) {
        hours = Math.floor(state.demo.hour);
        minutes = Math.floor((state.demo.hour % 1) * 60);
        date = new Date(now.getFullYear(), 0, state.demo.doy);
    }
    setText('clockH', pad(hours));
    setText('clockM', pad(minutes));
    $('clockColon').classList.toggle('dim', now.getSeconds() % 2 === 1);
    setText('date', date.toLocaleDateString(t('locale'), { weekday: 'long', day: 'numeric', month: 'long' }));
}

function untilText(alarm) {
    if (!alarm.on) return t('alarmOff');
    const at = armed[alarm.id];
    if (!at) return '';
    const diff = Math.max(0, Math.floor((at - Date.now()) / 1000));
    return t('until', [Math.floor(diff / 3600), Math.floor((diff % 3600) / 60)]);
}

function daysText(days) {
    const n = days.filter(Boolean).length;
    if (n === 7) return t('everyDay');
    if (!n) return t('once');
    if (n === 5 && days.slice(0, 5).every(Boolean)) return t('weekdays');
    if (n === 2 && days[5] && days[6]) return t('weekends');
    return t('dayNames').filter((_, i) => days[i]).join(', ');
}

// ========= ALARMS UI =========
function updateAlarm(fn) {
    const alarm = selectedAlarm();
    const before = JSON.stringify([alarm.h, alarm.m, alarm.days, alarm.on]);
    fn(alarm);
    // A new time, days or on/off cancel a pending snooze; other settings keep it
    if (JSON.stringify([alarm.h, alarm.m, alarm.days, alarm.on]) !== before) alarm.snoozeUntil = null;
    arm(alarm);
    scheduleAlarmTimeout();
    updateWakeLock();
    saveAlarms();
    renderAlarms();
}

function addAlarm(hours, minutes, label) {
    const alarm = newAlarm(hours, minutes, label);
    const sel = selectedAlarm();
    if (sel) alarm.station = sel.station;
    state.alarms.push(alarm);
    state.selectedAlarmId = alarm.id;
    arm(alarm);
    scheduleAlarmTimeout();
    updateWakeLock();
    saveAlarms();
    renderAlarms();
    return alarm;
}

function chip(alarm) {
    const sel = alarm.id === selectedAlarm().id;
    return h('button', {
        class: 'chip' + (sel ? ' sel' : '') + (alarm.on ? '' : ' off'),
        onclick: () => {
            state.selectedAlarmId = alarm.id;
            state.chipsOpen = false;
            saveAlarms();
            renderAlarms();
        }
    }, h('span', { class: 'chip-time', text: pad(alarm.h) + ':' + pad(alarm.m) }),
       h('span', { class: 'chip-label', 'data-id': alarm.id, text: alarm.label || t('alarmDefault') }));
}

function renderChips() {
    const box = $('alChips');
    box.textContent = '';
    const all = state.alarms;
    const LIMIT = 5;
    let visible = all;
    if (all.length > LIMIT) {
        const si = all.indexOf(selectedAlarm());
        visible = all.slice(0, LIMIT);
        if (si >= LIMIT) visible = [...all.slice(0, LIMIT - 1), all[si]];
    }
    visible.forEach(a => box.append(chip(a)));
    if (all.length > LIMIT) {
        box.append(h('button', {
            class: 'chip',
            text: t('more', { n: all.length - visible.length }),
            onclick: () => {
                state.chipsOpen = !state.chipsOpen;
                renderChips();
            }
        }));
    }
    box.append(h('button', {
        class: 'chip-add',
        title: t('addAlarm'),
        'aria-label': t('addAlarm'),
        onclick: () => addAlarm(8, 0, t('alarmN', { n: state.alarms.length + 1 }))
    }));

    if (state.chipsOpen && all.length > LIMIT) {
        const close = h('a', { class: 'accent-link', role: 'button', tabindex: '0', text: t('close') });
        onActivate(close, () => {
            state.chipsOpen = false;
            renderChips();
        });
        box.append(h('div', { class: 'all-alarms' },
            h('div', { class: 'all-alarms-head' }, h('span', { text: t('allAlarms', { n: all.length }) }), close),
            h('div', { class: 'all-alarms-list' }, all.map(chip))));
    }
}

// The alarm name is an <input> that looks like plain text: size it to its content
let measureCanvas = null;

function fitLabel() {
    const label = $('alLabel');
    measureCanvas = measureCanvas || document.createElement('canvas');
    const ctx = measureCanvas.getContext('2d');
    const style = getComputedStyle(label);
    ctx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    label.style.width = Math.ceil(ctx.measureText(label.value || ' ').width + 4) + 'px';
}

function renderAlarms() {
    const alarm = selectedAlarm();
    const label = $('alLabel');
    if (document.activeElement !== label) label.value = alarm.label || t('alarmDefault');
    fitLabel();
    label.setAttribute('aria-label', t('alarmLabelAria'));
    $('alRename').title = t('rename');
    $('alRename').setAttribute('aria-label', t('rename'));
    setText('alH', pad(alarm.h));
    setText('alM', pad(alarm.m));
    setText('alUntil', untilText(alarm));
    renderChips();

    const toggle = $('alToggle');
    toggle.textContent = alarm.on ? t('toggleOff') : t('toggleOn');
    toggle.classList.toggle('on', alarm.on);

    setText('alSnooze', t('minutes', { n: alarm.snooze }));
    $('alFade').classList.toggle('on', alarm.fade);
    $('alFade').setAttribute('aria-checked', alarm.fade);
    setText('alFadeLabel', alarm.fade ? t('fadeOn') : t('fadeOff'));

    const days = $('alDays');
    days.textContent = '';
    t('dayNames').forEach((name, i) => {
        days.append(h('button', {
            class: 'day' + (alarm.days[i] ? ' on' : ''),
            text: name,
            'aria-pressed': alarm.days[i] ? 'true' : 'false',
            onclick: () => updateAlarm(a => { a.days[i] = !a.days[i]; })
        }));
    });
    setText('alDaysText', daysText(alarm.days));
    renderUnlockHint();
    $('alDelete').style.visibility = state.alarms.length > 1 ? 'visible' : 'hidden';

    renderPlayers();
}

// ========= PLAYERS & STATION POPUPS =========
function stationPopup(boxId, currentKey, onPick) {
    const box = $(boxId);
    box.textContent = '';
    const list = h('div', { class: 'st-pop-list' });
    allStations().forEach(entry => {
        const cur = entry.key === currentKey;
        list.append(h('button', {
            class: 'st-opt' + (cur ? ' cur' : ''),
            onclick: () => {
                state.popup = null;
                onPick(entry.key);
                renderPlayers();
            }
        }, h('span', { class: 'st-opt-text' },
            h('span', { class: 'st-opt-name', text: entry.name }),
            h('span', { class: 'st-opt-sub', text: entry.sub })),
        h('span', { class: 'st-opt-mark', text: cur ? '✓' : '' })));
    });
    // Leads to the "new station" form on the Stations tab
    box.append(list, h('div', { class: 'st-add-sep' }), h('button', {
        class: 'st-opt st-add',
        text: t('addStation'),
        onclick: () => {
            state.popup = null;
            state.editId = null;
            location.hash = '#stations';
            setTab('stations');
            showUi(0);
            $('fName').focus();
        }
    }));
    placePopup(box);
}

// The list opens upwards; near the top of a small screen it opens downwards instead
function placePopup(box) {
    box.classList.remove('down');
    box.style.maxHeight = '';
    const anchor = box.offsetParent;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect(), need = box.offsetHeight;
    const above = r.top - 16;
    if (need <= above) return;
    const tabs = $('tabs'), tabsRect = tabs.getBoundingClientRect();
    const bottomEdge = getComputedStyle(tabs).position === 'fixed' ? tabsRect.top : innerHeight;
    const below = bottomEdge - r.bottom - 16;
    if (below > above) box.classList.add('down');
    box.style.maxHeight = Math.max(160, Math.min(need, Math.max(above, below))) + 'px';
}

function renderSmallPlayer(prefix, key, idleText, popupId, onPick) {
    const on = playingKey() === key;
    setText(prefix + 'Play', on ? '❚❚' : '▶');
    $(prefix + 'Play').setAttribute('aria-label', on ? t('pauseAria') : t('play'));
    setText(prefix + 'PlayState', on ? t('nowPlaying') : idleText);
    setText(prefix + 'PlayName', stationEntry(key).name);
    const custom = findCustomStation(key);
    const tracks = on && (prefix === 'sw' || prefix === 'mu') && custom && custom.items.length > 1;
    $(prefix + 'Player').querySelectorAll('.skip').forEach(b => {
        const next = +b.dataset.d > 0;
        b.title = tracks ? t(next ? 'nextTrack' : 'prevTrack') : t(next ? 'nextStation' : 'prevStation');
        b.setAttribute('aria-label', b.title);
    });
    const open = state.popup === popupId;
    setText(prefix + 'Change', open ? t('hide') : t('change'));
    $(prefix + 'Player').classList.toggle('pop-open', open || (prefix === 'mu' && state.popup === 'tm'));
    const list = $(prefix + 'List');
    list.hidden = !open;
    if (open) stationPopup(prefix + 'List', key, onPick);
}

// Every tab shows the same player: what's playing now. When nothing plays, the alarms
// tab shows the selected alarm's sound (picking a station there sets it), the other
// tabs — the last played station. A station picked from a list starts playing at once.
function renderPlayers() {
    const alarm = selectedAlarm();
    const playing = playingKey();
    renderSmallPlayer('al', playing || alarm.station, t('alarmSignal'), 'al', key => {
        updateAlarm(a => { a.station = key; });
        previewPlay(key);
    });
    renderSmallPlayer('sw', playing || state.playerKey, t('swMusic'), 'sw', key => previewPlay(key));
    renderSmallPlayer('mu', playing || state.playerKey, t('swMusic'), 'mu', key => previewPlay(key));

    // The timer's end signal is a setting inside the timer tab's player
    const sigOpen = state.popup === 'tm';
    setText('tmSigName', stationEntry(state.timer.station).name);
    setText('tmChange', sigOpen ? t('hide') : t('change'));
    $('tmList').hidden = !sigOpen;
    if (sigOpen) {
        stationPopup('tmList', state.timer.station, key => {
            state.timer.station = key;
            saveTimer();
            previewPlay(key);
        });
    }
    document.querySelectorAll('[data-vol]').forEach(input => {
        if (document.activeElement !== input) input.value = state.volume;
    });
    document.querySelectorAll('[data-vol-val]').forEach(node => { node.textContent = state.volume + '%'; });
}

function neighbourStation(key, delta) {
    const list = allStations();
    const i = Math.max(0, list.findIndex(x => x.key === key));
    return list[(i + delta + list.length) % list.length].key;
}

// ◀◀ ▶▶ in a player: the next track of a playing playlist, otherwise the next station
// (on the alarms tab it also becomes the alarm's sound)
function skipPlayer(which, delta) {
    const shown = playingKey() || (which === 'al' ? selectedAlarm().station : state.playerKey);
    const s = engine.getState();
    const custom = findCustomStation(shown);
    if (s.playing && s.key === shown && custom && custom.items.length > 1) {
        engine.step(delta);
        return;
    }
    const next = neighbourStation(shown, delta);
    if (which === 'al') updateAlarm(a => { a.station = next; });
    previewPlay(next);
}

// Everything that depends on what's playing
function renderPlayback() {
    renderPlayers();
    renderPlaques();
    if (state.tab === 'stations') renderStations();
    if (state.ringing) renderRing();
}

function renderPlaques() {
    const s = engine.getState();
    const np = s.playing && state.tab !== 'alarms' && state.tab !== 'stations' && s.purpose !== 'alarm';
    $('npPlaque').hidden = !np;
    if (np) setText('npName', stationEntry(s.key).name);

    const tm = state.timer;
    const tmOn = (tm.running || tm.remain > 0) && state.tab !== 'timer';
    $('tmPlaque').hidden = !tmOn;
    if (tmOn) {
        const secs = Math.ceil(timerRemaining() / 1000);
        const hh = Math.floor(secs / 3600), mm = Math.floor((secs % 3600) / 60), ss = secs % 60;
        setText('tmText', hh ? `${pad(hh)}:${pad(mm)}:${pad(ss)}` : `${pad(mm)}:${pad(ss)}`);
    }

    const swOn = state.sw.running && state.tab !== 'stopwatch';
    $('swPlaque').hidden = !swOn;
    if (swOn) setText('swText', formatSw(swElapsed()).main);
}

// ========= TIMER =========
function timerSetMs() {
    const tm = state.timer;
    return (tm.h * 3600 + tm.m * 60 + tm.s) * 1000;
}

function timerRemaining() {
    const tm = state.timer;
    return tm.running ? Math.max(0, tm.end - Date.now()) : tm.remain;
}

let timerInterval = null;
let timerEndTimeout = null;

function timerTick() {
    const tm = state.timer;
    if (tm.running && tm.end <= Date.now()) {
        finishTimer();
    }
    renderTimer();
    renderPlaques();
}

function startTimerLoop() {
    clearInterval(timerInterval);
    clearTimeout(timerEndTimeout);
    if (!state.timer.running) return;
    timerInterval = setInterval(timerTick, 200);
    // Background tabs throttle repeating timers to once a minute; a single timeout still fires on time
    timerEndTimeout = setTimeout(timerTick, Math.min(Math.max(0, state.timer.end - Date.now()) + 20, 2147483000));
}

function stopTimerSignal() {
    clearTimeout(timerSignalTimeout);
    const s = engine.getState();
    if (s.playing && s.purpose === 'timer') engine.stop();
}

function toggleTimer() {
    const tm = state.timer;
    stopTimerSignal();
    if (tm.running) {
        Object.assign(tm, { running: false, remain: Math.max(0, tm.end - Date.now()) });
    } else {
        const remain = tm.remain > 0 ? tm.remain : timerSetMs();
        if (!remain) return;
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        engine.unlock();
        Object.assign(tm, { running: true, done: false, end: Date.now() + remain, remain, total: tm.remain > 0 ? tm.total : remain });
    }
    saveTimer();
    startTimerLoop();
    renderTimer();
    renderPlaques();
}

function resetTimer() {
    stopTimerSignal();
    Object.assign(state.timer, { running: false, remain: 0, total: 0, done: false });
    saveTimer();
    startTimerLoop();
    renderTimer();
    renderPlaques();
}

function finishTimer() {
    Object.assign(state.timer, { running: false, remain: 0, done: true });
    saveTimer();
    startTimerLoop();
    // An alarm that's ringing takes priority over the timer signal
    if (!state.ringing) {
        engine.play(state.timer.station, { purpose: 'timer' });
        clearTimeout(timerSignalTimeout);
        timerSignalTimeout = setTimeout(stopTimerSignal, TIMER_SIGNAL_MS);
    }
    if ('Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
        try {
            new Notification(t('timerNotifyTitle'), { body: t('timerNotifyBody') });
        } catch (e) { /* some mobile browsers only allow notifications from a service worker */ }
    }
}

function adjustTimer(field, delta) {
    const tm = state.timer;
    if (tm.running || tm.remain > 0) return;
    if (field === 'h') tm.h = (tm.h + delta + 100) % 100;
    if (field === 'm') tm.m = (tm.m + delta + 60) % 60;
    if (field === 's') tm.s = (tm.s + delta + 60) % 60;
    tm.done = false;
    saveTimer();
    renderTimer();
}

function renderTimer() {
    const tm = state.timer;
    const rem = timerRemaining();
    const shown = tm.running || tm.remain > 0 ? rem : tm.done ? 0 : timerSetMs();
    const secs = Math.ceil(shown / 1000);
    setText('tmH', pad(Math.floor(secs / 3600)));
    setText('tmM', pad(Math.floor((secs % 3600) / 60)));
    setText('tmS', pad(secs % 60));
    const editable = !tm.running && !tm.remain;
    $('tmDigits').classList.toggle('editable', editable);
    $('tmBar').style.width = tm.total ? ((1 - rem / tm.total) * 100).toFixed(1) + '%' : (tm.done ? '100%' : '0%');
    const status = tm.done ? t('timeUp') : tm.running ? t('timerRunning') : tm.remain > 0 ? t('paused') : '';
    setText('tmStatus', status);
    $('tmStatus').classList.toggle('done', tm.done);
    setText('tmMain', tm.running ? t('pause') : tm.remain > 0 ? t('resume') : t('start'));

    const presets = $('tmPresets');
    if (!presets.childElementCount) {
        [1, 5, 10, 15, 30].forEach(n => presets.append(h('button', {
            class: 'preset',
            'data-min': n,
            onclick: () => {
                if (tm.running) return;
                stopTimerSignal();
                Object.assign(tm, { h: 0, m: n, s: 0, remain: 0, total: 0, done: false });
                saveTimer();
                renderTimer();
            }
        })));
    }
    presets.querySelectorAll('.preset').forEach(b => {
        const n = +b.dataset.min;
        b.textContent = t('minShort', { n });
        b.classList.toggle('on', editable && !tm.h && tm.m === n && !tm.s);
    });
    if (state.tab === 'timer') document.title = tm.running ? `⏲ ${$('tmH').textContent}:${$('tmM').textContent}:${$('tmS').textContent}` : t('documentTitle');
}

// ========= STOPWATCH =========
let swFrame = null;

function swElapsed() {
    const sw = state.sw;
    return sw.acc + (sw.running ? Date.now() - sw.start : 0);
}

function formatSw(ms) {
    const hh = Math.floor(ms / 3600000), mm = Math.floor(ms / 60000) % 60, ss = Math.floor(ms / 1000) % 60, cs = Math.floor(ms / 10) % 100;
    return { main: (hh ? hh + ':' + pad(mm) : pad(mm)) + ':' + pad(ss), cs: '.' + pad(cs) };
}

function swLoop() {
    renderStopwatchTime();
    swFrame = state.sw.running && state.tab === 'stopwatch' ? requestAnimationFrame(swLoop) : null;
}

function startSwLoop() {
    cancelAnimationFrame(swFrame);
    swFrame = null;
    if (state.sw.running && state.tab === 'stopwatch') swFrame = requestAnimationFrame(swLoop);
}

function toggleStopwatch() {
    const sw = state.sw;
    if (sw.running) {
        sw.acc += Date.now() - sw.start;
        sw.running = false;
    } else {
        sw.start = Date.now();
        sw.running = true;
    }
    saveStopwatch();
    startSwLoop();
    renderStopwatch();
}

function lapStopwatch() {
    if (!state.sw.running) return;
    state.sw.laps.push(swElapsed());
    saveStopwatch();
    renderStopwatch();
}

function resetStopwatch() {
    state.sw = { acc: 0, start: 0, running: false, laps: [] };
    saveStopwatch();
    startSwLoop();
    renderStopwatch();
}

function renderStopwatchTime() {
    const f = formatSw(swElapsed());
    setText('swMain', f.main);
    setText('swCs', f.cs);
}

function renderStopwatch() {
    const sw = state.sw;
    renderStopwatchTime();
    const el = swElapsed();
    setText('swMainBtn', sw.running ? t('pause') : el > 0 ? t('resume') : t('start'));
    $('swLap').classList.toggle('dim', !sw.running);

    const laps = $('swLaps');
    laps.textContent = '';
    const durations = sw.laps.map((total, i) => total - (i ? sw.laps[i - 1] : 0));
    const best = Math.min(...durations), worst = Math.max(...durations);
    for (let i = sw.laps.length - 1; i >= Math.max(0, sw.laps.length - 5); i--) {
        const lap = formatSw(durations[i]), total = formatSw(sw.laps[i]);
        const mark = sw.laps.length > 2 && durations[i] === best ? ' best' : sw.laps.length > 2 && durations[i] === worst ? ' worst' : '';
        laps.append(h('div', { class: 'lap' },
            h('span', { class: 'lap-n', text: t('lapN', { n: i + 1 }) }),
            h('span', { class: 'lap-d' + mark, text: lap.main + lap.cs }),
            h('span', { class: 'lap-total', text: total.main + total.cs })));
    }
}

// ========= STATIONS UI =========
function stationRowGlyph(key) {
    const on = playingKey() === key;
    return { glyph: on ? '❚❚' : '▶', cur: key === currentPlayerKey() };
}

// The station the big player shows: what's playing, otherwise the last chosen one
function currentPlayerKey() {
    return playingKey() || state.playerKey;
}

function playStation(key) {
    if (playingKey() !== key) setPlayerKey(key);
    togglePreview(key);
}

function renderBigPlayer() {
    const s = engine.getState();
    const key = currentPlayerKey();
    const entry = stationEntry(key);
    const custom = findCustomStation(key);
    const isPlaylist = !!(custom && custom.items.length > 1);
    setText('bpState', s.playing ? (statusText(s) || t('nowPlaying')) : (s.error ? t('playFailed') : t('stopped')));
    setText('bpName', entry.name);
    if (isPlaylist && s.playing && s.key === key) {
        const item = custom.items[s.itemIndex] || custom.items[0];
        setText('bpSub', t('trackOf', { n: s.itemIndex + 1, m: custom.items.length, label: itemLabel(item) }));
    } else {
        setText('bpSub', entry.sub);
    }
    setText('bpPlay', s.playing ? '❚❚' : '▶');
    $('bpPlay').setAttribute('aria-label', s.playing ? t('pauseAria') : t('play'));
    $('bpPrev').title = isPlaylist ? t('prevTrack') : t('prevStation');
    $('bpNext').title = isPlaylist ? t('nextTrack') : t('nextStation');
}

function stepStation(delta) {
    const s = engine.getState();
    const key = currentPlayerKey();
    const custom = findCustomStation(key);
    if (custom && custom.items.length > 1 && s.playing && s.key === key) {
        engine.step(delta);
        return;
    }
    const list = allStations();
    const i = Math.max(0, list.findIndex(x => x.key === key));
    const next = list[(i + delta + list.length) % list.length].key;
    previewPlay(next);
}

function renderStations() {
    renderBigPlayer();
    const alarmKey = selectedAlarm().station;

    const tiles = $('stBuiltin');
    tiles.textContent = '';
    BUILTIN_STATIONS.forEach(station => {
        const entry = builtinEntry(station);
        const g = stationRowGlyph(entry.key);
        tiles.append(h('button', { class: 'tile' + (g.cur ? ' cur' : ''), onclick: () => playStation(entry.key) },
            h('span', { class: 'glyph', text: g.glyph }),
            h('span', { class: 'tile-text' },
                h('span', { class: 'tile-name', text: entry.name }),
                h('span', { class: 'tile-sub', text: entry.sub }))));
    });

    const stations = loadCustomStations();
    setText('stCount', String(stations.length));
    const mine = $('stMine');
    mine.textContent = '';
    if (!stations.length) {
        mine.append(h('div', { class: 'mine-empty', text: t('noStations') }));
    }
    stations.forEach(station => {
        const entry = customEntry(station);
        const g = stationRowGlyph(entry.key);
        const isAlarm = alarmKey === entry.key;
        const toAlarm = h('a', { class: 'row-link accent', role: 'button', tabindex: '0', text: t('toAlarm') });
        onActivate(toAlarm, () => updateAlarm(a => { a.station = entry.key; }));
        const edit = h('a', { class: 'row-link', role: 'button', tabindex: '0', text: t('change') });
        onActivate(edit, () => openEditor(station.id));
        mine.append(h('div', { class: 'mine-row' + (g.cur ? ' cur' : '') },
            h('button', { class: 'glyph', text: g.glyph, 'aria-label': t('play'), onclick: () => playStation(entry.key) }),
            h('span', { class: 'tile-text' },
                h('span', { class: 'tile-name', text: entry.name }),
                h('span', { class: 'tile-sub', text: entry.sub })),
            isAlarm ? h('span', { class: 'badge', text: t('onAlarm') }) : toAlarm,
            edit,
            h('button', { class: 'row-x', text: '×', title: t('delete'), 'aria-label': t('delete'), onclick: () => deleteStation(station.id) })));
    });

    $('stListMode').hidden = !!state.editId;
    $('stEditor').hidden = !state.editId;
    if (state.editId) renderEditor();
    renderDraft();
}

async function deleteStation(id) {
    const stations = loadCustomStations();
    const station = stations.find(s => s.id === id);
    if (!station || !confirm(t('confirmDelete', { name: station.name }))) return;
    const key = 'custom-' + id;
    if (playingKey() === key) engine.stop();
    for (const item of station.items) {
        if (item.k === 'file' && item.fileId != null) {
            await deleteFileFromDB(item.fileId).catch(() => {});
        }
    }
    saveCustomStations(stations.filter(s => s.id !== id));
    state.alarms.forEach(a => { if (a.station === key) a.station = 'classic'; });
    if (state.timer.station === key) state.timer.station = 'classic';
    if (state.playerKey === key) setPlayerKey('hermitage');
    if (state.editId === id) state.editId = null;
    saveAlarms();
    saveTimer();
    renderStations();
    renderPlayers();
}

// ----- the "new station" form -----
function draftLabel(item) {
    return item.file ? item.file.name : itemLabel(item);
}

function renderDraft() {
    const draft = state.draft;
    $('fDraft').hidden = !draft.length;
    const list = $('fDraftList');
    list.textContent = '';
    draft.forEach((item, i) => list.append(h('div', { class: 'draft-item' },
        h('span', { class: 'kind', text: t('kinds')[item.k] }),
        h('span', { class: 'draft-label', text: draftLabel(item) }),
        h('button', { class: 'x-btn', text: '×', 'aria-label': t('remove'), onclick: () => {
            draft.splice(i, 1);
            renderDraft();
        } }))));
    setText('fDraftNote', draft.length > 1 ? t('draftNote', draft.length) : '');
    $('fSave').classList.toggle('dim', !($('fName').value.trim() && draft.length));
}

function addDraftLinks(inputId) {
    const input = $(inputId);
    const items = parseLinks(input.value);
    if (!items.length) {
        if (input.value.trim()) alert(t('badLinks'));
        return [];
    }
    input.value = '';
    return items;
}

// Files picked in the browser: audio stays a File until it's saved to IndexedDB;
// .m3u/.pls playlists are small and become data: URLs right away
async function readPickedFiles(input) {
    const items = [];
    for (const file of Array.from(input.files || [])) {
        if (file.size > MAX_FILE_SIZE) {
            alert(t('fileTooLarge', { name: file.name }));
            continue;
        }
        if (/\.(m3u8?|pls)$/i.test(file.name)) {
            const text = await file.text();
            const url = 'data:audio/x-mpegurl;base64,' + btoa(unescape(encodeURIComponent(text)));
            items.push({ k: 'm3u', url, name: file.name });
        } else {
            items.push({ k: 'file', file, name: file.name, size: file.size });
        }
    }
    input.value = '';
    return items;
}

// Stores pending files in IndexedDB and returns storable items
async function persistItems(stationId, items, startIndex) {
    const result = [];
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.k === 'file' && item.file) {
            if (!state.dbReady) throw new Error(t('dbError'));
            const fileId = await saveFileToDB(stationId, startIndex + i, item.file.name, item.file);
            result.push({ k: 'file', fileId, name: item.file.name, size: item.file.size });
        } else {
            result.push(item);
        }
    }
    return result;
}

async function saveNewStation() {
    const name = $('fName').value.trim();
    if (!name || !state.draft.length) return;
    const id = newId('s');
    const button = $('fSave');
    button.disabled = true;
    try {
        const items = await persistItems(id, state.draft, 0);
        const stations = loadCustomStations();
        stations.push({ id, name, items, shuffle: false, loop: true });
        saveCustomStations(stations);
        state.draft = [];
        $('fName').value = '';
        $('fLink').value = '';
        previewPlay('custom-' + id);
        renderStations();
    } catch (error) {
        alert(t('saveError', { error: error.message }));
    } finally {
        button.disabled = false;
    }
}

// ----- playlist editor -----
function editedStation() {
    return loadCustomStations().find(s => s.id === state.editId) || null;
}

function updateEdited(fn) {
    const stations = loadCustomStations();
    const station = stations.find(s => s.id === state.editId);
    if (!station) return;
    const st = engine.getState();
    const playingThis = st.playing && st.key === 'custom-' + station.id;
    const current = playingThis ? station.items[st.itemIndex] : null;
    fn(station);
    saveCustomStations(stations);
    if (playingThis) engine.refresh(current ? station.items.indexOf(current) : -1);
    renderStations();
    renderPlayers();
}

function openEditor(id) {
    state.editId = id;
    renderStations();
}

function renderEditor() {
    const station = editedStation();
    if (!station) {
        state.editId = null;
        return;
    }
    const key = 'custom-' + station.id;
    const s = engine.getState();
    if (document.activeElement !== $('edName')) $('edName').value = station.name;
    setText('edCount', t('items', station.items.length));

    const list = $('edItems');
    list.textContent = '';
    const n = station.items.length;
    station.items.forEach((item, i) => {
        const now = s.playing && s.key === key && s.itemIndex === i;
        list.append(h('div', { class: 'ed-item' + (now ? ' now' : '') },
            h('button', { class: 'ed-n', text: String(i + 1), title: t('playFrom'), onclick: () => {
                previewPlay(key, { startAt: i });
            } }),
            h('span', { class: 'kind', text: t('kinds')[item.k] }),
            h('span', { class: 'ed-text' },
                h('span', { class: 'ed-label', text: itemLabel(item) }),
                h('span', { class: 'ed-sub', text: itemSub(item) })),
            h('button', { class: 'ed-act', text: '↑', title: t('up'), disabled: i === 0, onclick: () => moveItem(i, -1) }),
            h('button', { class: 'ed-act', text: '↓', title: t('down'), disabled: i === n - 1, onclick: () => moveItem(i, 1) }),
            h('button', { class: 'ed-act del', text: '×', title: t('remove'), disabled: n <= 1, onclick: () => removeItem(i) })));
    });

    $('edShuffle').classList.toggle('on', !!station.shuffle);
    $('edShuffle').setAttribute('aria-checked', !!station.shuffle);
    $('edLoop').classList.toggle('on', station.loop !== false);
    $('edLoop').setAttribute('aria-checked', station.loop !== false);
    const isAlarm = selectedAlarm().station === key;
    $('edIsAlarm').hidden = !isAlarm;
    $('edSetAlarm').hidden = isAlarm;
}

function moveItem(i, delta) {
    updateEdited(station => {
        const j = i + delta;
        if (j < 0 || j >= station.items.length) return;
        [station.items[i], station.items[j]] = [station.items[j], station.items[i]];
    });
}

function removeItem(i) {
    const station = editedStation();
    if (!station || station.items.length <= 1) return;
    const item = station.items[i];
    if (item.k === 'file' && item.fileId != null) deleteFileFromDB(item.fileId).catch(() => {});
    updateEdited(st => { st.items.splice(i, 1); });
}

async function addItemsToEdited(items) {
    const station = editedStation();
    if (!station || !items.length) return;
    try {
        const stored = await persistItems(station.id, items, station.items.length);
        updateEdited(st => { st.items.push(...stored); });
    } catch (error) {
        alert(t('saveError', { error: error.message }));
    }
}

// ========= SLEEP CALCULATOR =========
let sleepMsgTimeout = null;

function flashSleep(message) {
    setText('slMsg', message);
    clearTimeout(sleepMsgTimeout);
    sleepMsgTimeout = setTimeout(() => setText('slMsg', ''), 2600);
}

function saveSleep() {
    writeJSON('sleepCalc', state.sleep);
}

function renderSleep() {
    const sl = state.sleep;
    const wake = sl.mode === 'wake';
    $('slWake').classList.toggle('on', wake);
    $('slBed').classList.toggle('on', !wake);
    setText('slH', pad(sl.h));
    setText('slM', pad(sl.m));
    $('slAddWake').hidden = !wake;
    setText('slTitle', wake ? t('bedAt') : t('wakeAt'));

    const cards = $('slCards');
    cards.textContent = '';
    const base = sl.h * 60 + sl.m;
    // Cards go from the earliest time to the latest in both modes
    (wake ? [6, 5, 4, 3] : [3, 4, 5, 6]).forEach(n => {
        const total = wake ? base - 15 - n * 90 : base + 15 + n * 90;
        const mins = ((total % 1440) + 1440) % 1440;
        const hh = Math.floor(mins / 60), mm = mins % 60;
        const best = n >= 5;
        const card = h('div', { class: 'sl-card' + (best ? ' best' : '') },
            best ? h('span', { class: 'sl-best', text: t('best') }) : null,
            h('span', { class: 'sl-time', text: pad(hh) + ':' + pad(mm) }),
            h('span', { class: 'sl-cyc', text: `${t('cycles', n)} · ${t('sleepHours', n * 1.5)}` }));
        // The link keeps its place in "wake" mode too, so the cards don't change height
        const add = h('a', { class: 'sl-add' + (wake ? ' off' : ''), role: 'button', tabindex: wake ? '-1' : '0', 'aria-hidden': wake ? 'true' : null, text: t('plusAlarm') });
        onActivate(add, () => {
            if (state.sleep.mode === 'wake') return;
            addAlarm(hh, mm, t('fromSleep'));
            flashSleep(t('alarmAdded', { time: pad(hh) + ':' + pad(mm) }));
        });
        card.append(add);
        cards.append(card);
    });
}

// ========= RING SCREEN =========
function renderRing() {
    const alarm = state.alarms.find(a => a.id === state.ringing);
    if (!alarm) return;
    setText('ringTitle', alarm.label ? t('ringTitle', { label: alarm.label }) : t('alarmDefault'));
    setText('ringTime', pad(alarm.h) + ':' + pad(alarm.m));
    setText('ringStation', t('ringPlays', { station: stationEntry(alarm.station).name }));
    setText('ringStatus', statusText(engine.getState()));
    setText('ringSnooze', t('ringSnooze', { n: alarm.snooze }));
    setText('ringNote', alarm.fade ? t('ringFade') : '');
}

// ========= TABS & LANGUAGE =========
function setTab(tab) {
    if (!TABS.includes(tab)) tab = 'alarms';
    state.tab = tab;
    state.popup = null;
    state.chipsOpen = false;
    document.querySelectorAll('.sec').forEach(sec => { sec.hidden = sec.dataset.sec !== tab; });
    document.querySelectorAll('.tabs a').forEach(a => {
        const active = a.dataset.tab === tab;
        a.classList.toggle('active', active);
        if (active) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });
    if (tab !== 'timer' && !state.ringing) document.title = t('documentTitle');
    renderAll();
    startSwLoop();
}

function applyLanguage() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => {
        const text = t(node.dataset.i18n);
        if (typeof text === 'string') node.textContent = text;
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => {
        node.placeholder = t(node.dataset.i18nPlaceholder);
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(node => {
        node.setAttribute('aria-label', t(node.dataset.i18nAria));
    });
    document.querySelectorAll('.lang button').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
    $('fullscreenBtn').title = t('fullscreen');
    $('fullscreenBtn').setAttribute('aria-label', t('fullscreen'));
    $('demoPrev').title = t('prevDay');
    $('demoNext').title = t('nextDay');
    document.title = state.ringing ? document.title : t('documentTitle');
    renderAll();
}

function renderAll() {
    renderClock();
    renderAlarms();
    renderTimer();
    renderStopwatch();
    renderSleep();
    if (state.tab === 'stations') renderStations();
    renderPlaques();
    renderDemo();
    if (state.ringing) renderRing();
}

// ========= SHOW CONTROLS ON HOVER / TAP =========
const app = $('app');
let uiHideTimeout = null;
// Touch screens have no hover: a tap shows the controls, a tap on an empty spot
// hides them, and they also fade after a while without touches
const isTouch = window.matchMedia && window.matchMedia('(hover: none)').matches;
if (isTouch) document.documentElement.classList.add('touch');

function showUi(hideAfter) {
    clearTimeout(uiHideTimeout);
    app.classList.add('ui-on');
    if (hideAfter) uiHideTimeout = setTimeout(hideUi, hideAfter);
}

function hideUi() {
    // Keep controls visible while a list or the editor is open, or while typing
    if (state.popup || state.chipsOpen || (state.tab === 'stations' && !$('stEditor').hidden)) return;
    const el = document.activeElement;
    if (el && el.matches && el.matches('input:not([type=range]):not([type=checkbox]), textarea, select')) return;
    app.classList.remove('ui-on');
}

// While the pointer rests over the page the controls fade after a few idle seconds,
// unless it rests on a control itself
const UI_IDLE_MS = 4000;
const UI_IDLE_TOUCH_MS = 10000;
const KEEP_UI = 'button, a, input, label, .player, .tabs, .lang, .chips, .al-head, .digits, .seg, .st-grid, .big-player, .sl-cards, .corner, .demo-panel, .plaque';
// On touch screens a tap on the big clock hides the controls, so only the alarm card counts
const KEEP_UI_TOUCH = KEEP_UI.replace('.al-head', '.al-row');
let lastPointerTarget = null;

function hideUiWhenIdle() {
    if (lastPointerTarget && lastPointerTarget.closest && lastPointerTarget.closest(KEEP_UI)) {
        uiHideTimeout = setTimeout(hideUiWhenIdle, UI_IDLE_MS);
        return;
    }
    hideUi();
}

document.addEventListener('mousemove', e => {
    if (isTouch) return;
    lastPointerTarget = e.target;
    showUi();
    uiHideTimeout = setTimeout(hideUiWhenIdle, UI_IDLE_MS);
});
document.documentElement.addEventListener('mouseleave', () => {
    clearTimeout(uiHideTimeout);
    uiHideTimeout = setTimeout(hideUi, 400);
});

if (isTouch) {
    const restartIdle = () => {
        if (!app.classList.contains('ui-on')) return;
        clearTimeout(uiHideTimeout);
        uiHideTimeout = setTimeout(hideUi, UI_IDLE_TOUCH_MS);
    };
    // click, not pointerdown: a finger that scrolls the page doesn't toggle anything
    document.addEventListener('click', e => {
        if (!app.classList.contains('ui-on')) showUi();
        else if (e.target.isConnected && !(e.target.closest && e.target.closest(KEEP_UI_TOUCH))) {
            clearTimeout(uiHideTimeout);
            hideUi();
            // Still shown when the tap only closed a list: fade later as usual
            if (!app.classList.contains('ui-on')) return;
        }
        restartIdle();
    });
    window.addEventListener('touchstart', restartIdle, { passive: true });
    window.addEventListener('scroll', restartIdle, { passive: true });
    showUi();
    restartIdle();
}

// ========= EVENTS =========
function bindEvents() {
    document.addEventListener('pointerdown', unlockAudio, true);
    document.addEventListener('keydown', unlockAudio, true);
    window.addEventListener('hashchange', () => setTab(location.hash.slice(1)));

    document.querySelectorAll('.lang button').forEach(b => b.addEventListener('click', () => {
        lang = b.dataset.lang;
        localStorage.setItem('language', lang);
        applyLanguage();
    }));

    // Plaques
    $('npPlay').addEventListener('click', () => engine.stop());

    // Steppers (alarm row, timer, sleep calculator)
    document.addEventListener('click', e => {
        const btn = e.target.closest('[data-act]');
        if (!btn) return;
        const d = +btn.dataset.d;
        switch (btn.dataset.act) {
            case 'alH': updateAlarm(a => { a.h = (a.h + d + 24) % 24; }); break;
            case 'alM': updateAlarm(a => { a.m = (a.m + d + 60) % 60; }); break;
            case 'snooze': updateAlarm(a => { a.snooze = Math.min(30, Math.max(1, a.snooze + d)); }); break;
            case 'tmH': adjustTimer('h', d); break;
            case 'tmM': adjustTimer('m', d); break;
            case 'tmS': adjustTimer('s', d); break;
            case 'slH': state.sleep.h = (state.sleep.h + d + 24) % 24; saveSleep(); renderSleep(); break;
            case 'slM': state.sleep.m = (state.sleep.m + d + 60) % 60; saveSleep(); renderSleep(); break;
        }
    });

    // Alarm
    const label = $('alLabel');
    label.addEventListener('input', fitLabel);
    // Saved without re-rendering: the change comes on blur, when the user is already pressing
    // another control (a chip, "+", a day), and rebuilding it would swallow that click
    label.addEventListener('change', () => {
        const value = label.value.trim();
        const alarm = selectedAlarm();
        alarm.label = value === t('alarmDefault') ? '' : value;
        saveAlarms();
        document.querySelectorAll('.chip-label[data-id="' + alarm.id + '"]').forEach(n => { n.textContent = alarm.label || t('alarmDefault'); });
        fitLabel();
    });
    label.addEventListener('blur', () => {
        if (!label.value.trim()) label.value = selectedAlarm().label || t('alarmDefault');
        fitLabel();
    });
    label.addEventListener('keydown', e => { if (e.key === 'Enter') label.blur(); });
    $('alRename').addEventListener('click', () => {
        label.focus();
        label.select();
    });
    $('alToggle').addEventListener('click', () => {
        engine.unlock(); // unlock audio playback on this click
        updateAlarm(a => { a.on = !a.on; });
    });
    onActivate($('alFade'), () => updateAlarm(a => { a.fade = !a.fade; }));
    onActivate($('alDelete'), () => {
        if (state.alarms.length < 2) return;
        const alarm = selectedAlarm();
        state.alarms = state.alarms.filter(a => a.id !== alarm.id);
        delete armed[alarm.id];
        state.selectedAlarmId = state.alarms[0].id;
        saveAlarms();
        scheduleAlarmTimeout();
        updateWakeLock();
        renderAlarms();
    });
    $('alPlay').addEventListener('click', () => togglePlayer(selectedAlarm().station));

    // Players: "Change" opens the station list
    document.querySelectorAll('.skip').forEach(b => b.addEventListener('click', () => skipPlayer(b.dataset.skip, +b.dataset.d)));
    [['al', 'alChange'], ['tm', 'tmChange'], ['sw', 'swChange'], ['mu', 'muChange']].forEach(([popup, id]) => {
        onActivate($(id), () => {
            state.popup = state.popup === popup ? null : popup;
            renderPlayers();
        });
    });
    document.addEventListener('click', e => {
        // A button that re-rendered its own list is no longer in the page — that's not "outside"
        if (!e.target.isConnected) return;
        if (state.popup && !e.target.closest('.player')) {
            state.popup = null;
            renderPlayers();
        }
        if (state.chipsOpen && !e.target.closest('.chips')) {
            state.chipsOpen = false;
            renderChips();
        }
    });
    $('swPlay').addEventListener('click', () => togglePlayer(state.playerKey));
    $('muPlay').addEventListener('click', () => togglePlayer(state.playerKey));

    // Volume (all sliders share one value)
    document.querySelectorAll('[data-vol]').forEach(input => {
        input.addEventListener('input', () => {
            state.volume = +input.value;
            engine.applyVolume();
            renderPlayers();
        });
        input.addEventListener('change', saveAlarms);
    });

    // Timer
    $('tmMain').addEventListener('click', toggleTimer);
    $('tmReset').addEventListener('click', resetTimer);

    // Stopwatch
    $('swMainBtn').addEventListener('click', toggleStopwatch);
    $('swLap').addEventListener('click', lapStopwatch);
    $('swReset').addEventListener('click', resetStopwatch);

    // Keyboard shortcuts for the timer and the stopwatch
    document.addEventListener('keydown', e => {
        if (e.target.closest('input, textarea, select, [contenteditable]') || e.ctrlKey || e.metaKey || e.altKey || state.ringing) return;
        // Space on a focused button already presses it — don't toggle a second time
        if (e.code === 'Space' && e.target.closest('button, [role="button"], [role="switch"]')) return;
        if (state.tab === 'timer') {
            if (e.code === 'Space') { e.preventDefault(); toggleTimer(); }
            else if (e.code === 'KeyR') resetTimer();
        } else if (state.tab === 'stopwatch') {
            if (e.code === 'Space') { e.preventDefault(); toggleStopwatch(); }
            else if (e.code === 'KeyL') lapStopwatch();
            else if (e.code === 'KeyR') resetStopwatch();
        }
    });

    // Stations
    $('bpPlay').addEventListener('click', () => {
        const key = currentPlayerKey();
        togglePlayer(key);
    });
    $('bpPrev').addEventListener('click', () => stepStation(-1));
    $('bpNext').addEventListener('click', () => stepStation(1));

    $('fName').addEventListener('input', renderDraft);
    const addFormLinks = () => {
        state.draft.push(...addDraftLinks('fLink'));
        renderDraft();
    };
    $('fAddLink').addEventListener('click', addFormLinks);
    $('fLink').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addFormLinks(); } });
    $('fFiles').addEventListener('change', async e => {
        state.draft.push(...await readPickedFiles(e.target));
        renderDraft();
    });
    $('fSave').addEventListener('click', () => {
        // A link typed but not added with the button still counts
        if ($('fLink').value.trim()) addFormLinks();
        saveNewStation();
    });

    onActivate($('edBack'), () => { state.editId = null; renderStations(); });
    $('edName').addEventListener('change', () => {
        const value = $('edName').value.trim();
        if (value) updateEdited(st => { st.name = value; });
    });
    const addEditorLinks = () => addItemsToEdited(addDraftLinks('edLink'));
    $('edAddLink').addEventListener('click', addEditorLinks);
    $('edLink').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addEditorLinks(); } });
    $('edFiles').addEventListener('change', async e => addItemsToEdited(await readPickedFiles(e.target)));
    onActivate($('edShuffle'), () => updateEdited(st => { st.shuffle = !st.shuffle; }));
    onActivate($('edLoop'), () => updateEdited(st => { st.loop = st.loop === false; }));
    onActivate($('edSetAlarm'), () => updateAlarm(a => { a.station = 'custom-' + state.editId; }));
    onActivate($('edDelete'), () => deleteStation(state.editId));

    // Sleep calculator
    $('slWake').addEventListener('click', () => { state.sleep.mode = 'wake'; saveSleep(); renderSleep(); });
    $('slBed').addEventListener('click', () => { state.sleep.mode = 'bed'; saveSleep(); renderSleep(); });
    onActivate($('slNow'), () => {
        const now = new Date();
        Object.assign(state.sleep, { h: now.getHours(), m: now.getMinutes() });
        saveSleep();
        renderSleep();
    });
    onActivate($('slAddWake'), () => {
        const { h: hh, m: mm } = state.sleep;
        addAlarm(hh, mm, t('fromSleep'));
        flashSleep(t('alarmAdded', { time: pad(hh) + ':' + pad(mm) }));
    });

    // Ring screen
    $('ringStop').addEventListener('click', () => finishRing(false));
    $('ringSnooze').addEventListener('click', () => finishRing(true));

    // Demo
    $('demoBtn').addEventListener('click', toggleDemo);
    $('demoPause').addEventListener('click', () => { state.demo.paused = !state.demo.paused; renderDemo(); });
    // Collapsed, the panel keeps only its top row (pause, date, day arrows); remembered for next time
    try { state.demo.collapsed = localStorage.getItem('demoCollapsed') === '1'; } catch (e) {}
    $('demoCollapse').addEventListener('click', () => {
        state.demo.collapsed = !state.demo.collapsed;
        try { localStorage.setItem('demoCollapsed', state.demo.collapsed ? '1' : '0'); } catch (e) {}
        renderDemo();
    });
    $('demoPrev').addEventListener('click', () => { state.demo.doy = (state.demo.doy + 363) % 365 + 1; updateSky(); renderClock(); renderDemo(); });
    $('demoNext').addEventListener('click', () => { state.demo.doy = state.demo.doy % 365 + 1; updateSky(); renderClock(); renderDemo(); });
    $('demoDoy').addEventListener('input', e => { state.demo.doy = +e.target.value; updateSky(); renderClock(); renderDemo(); });
    $('demoHour').addEventListener('input', e => { state.demo.hour = +e.target.value; updateSky(); renderClock(); renderDemo(); });
    const speeds = $('demoSpeeds');
    [[1, '×1'], [60, '×60'], [600, '×600'], [3600, '×3600']].forEach(([speed, text]) => {
        speeds.append(h('button', { 'data-speed': speed, text, onclick: () => { state.demo.speed = speed; renderDemo(); } }));
    });

    // Fullscreen (not available on iPhone)
    if (!document.fullscreenEnabled) $('fullscreenBtn').hidden = true;
    $('fullscreenBtn').addEventListener('click', () => {
        if (!document.fullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen().catch(() => {});
            }
        } else {
            document.exitFullscreen();
        }
    });

    // Coming back to the tab: catch up on a missed ring and restore the wake lock
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            checkAlarms();
            updateWakeLock();
            startSwLoop();
        }
    });

    // Stations changed in another tab
    window.addEventListener('storage', e => {
        if (e.key === STATIONS_KEY) {
            renderStations();
            renderPlayers();
        }
    });

    // Closing the tab would silently cancel the alarms — ask first
    window.addEventListener('beforeunload', e => {
        if (state.alarms.some(a => a.on)) {
            e.preventDefault();
            e.returnValue = '';
        }
    });
}

// ========= INIT =========
async function init() {
    try {
        await initDB();
        state.dbReady = true;
    } catch (e) {
        console.error('❌ IndexedDB:', e);
    }

    let keyMap = {};
    try {
        keyMap = await migrateCustomStations(state.dbReady);
    } catch (e) {
        stationsMigrationFailed = true;
        console.error('❌ Station migration failed, will retry on the next load:', e);
    }
    loadAlarms(keyMap);
    loadOtherState();

    // ?h=7&m=30 (old sleep calculator links) sets the selected alarm's time
    const params = new URLSearchParams(location.search);
    if (params.has('h') && params.has('m')) {
        const hh = parseInt(params.get('h'), 10), mm = parseInt(params.get('m'), 10);
        if (hh >= 0 && hh <= 23 && mm >= 0 && mm <= 59) {
            Object.assign(selectedAlarm(), { h: hh, m: mm });
            saveAlarms();
        }
        history.replaceState(null, '', location.pathname + location.hash);
    }

    bindEvents();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitLabel);
    armAll();
    updateSky();
    applyLanguage();
    setTab(location.hash.slice(1) || 'alarms');
    startTimerLoop();
    loadYouTubeAPI();

    setInterval(() => {
        if (!state.demo.on) updateSky();
        renderClock();
        checkAlarms();
        const alarm = selectedAlarm();
        setText('alUntil', untilText(alarm));
        renderPlaques();
    }, 1000);
}

init();
