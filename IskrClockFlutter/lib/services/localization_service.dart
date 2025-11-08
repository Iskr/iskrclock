import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

enum AppLanguage { russian, english }

class LocalizationService with ChangeNotifier {
  AppLanguage _currentLanguage = AppLanguage.russian;

  AppLanguage get currentLanguage => _currentLanguage;

  String get languageCode => _currentLanguage == AppLanguage.russian ? 'ru' : 'en';
  String get flag => _currentLanguage == AppLanguage.russian ? '🇷🇺' : '🇬🇧';
  String get name => _currentLanguage == AppLanguage.russian ? 'Русский' : 'English';

  LocalizationService() {
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final savedLanguage = prefs.getString('language') ?? 'ru';
    _currentLanguage = savedLanguage == 'ru' ? AppLanguage.russian : AppLanguage.english;
    notifyListeners();
  }

  Future<void> toggleLanguage() async {
    _currentLanguage = _currentLanguage == AppLanguage.russian
        ? AppLanguage.english
        : AppLanguage.russian;

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', languageCode);
    notifyListeners();
  }

  String t(String key) {
    return _translations[_currentLanguage]?[key] ?? key;
  }

  static const Map<AppLanguage, Map<String, String>> _translations = {
    AppLanguage.russian: {
      // Main alarm
      'app_title': 'IskrCLOCK',
      'version': 'v5.2',
      'current_time': 'Текущее время',
      'set_alarm': 'Установить будильник',
      'alarm_time': 'Время будильника',
      'snooze_duration': 'Длительность повтора (мин)',
      'radio_station': 'Радиостанция',
      'play': '▶',
      'stop': '⏸',
      'volume_fade_in': 'Нарастание громкости',
      'manage_stations': 'Управление станциями',
      'toggle_alarm': 'Включить будильник',
      'disable_alarm': 'Выключить будильник',
      'snooze': 'Подремать',
      'fullscreen': '⛶',
      'alarm_in': 'Будильник через:',
      'alarm_modal_title': 'БУДИЛЬНИК!',
      'turn_off': 'ВЫКЛЮЧИТЬ',

      // Navigation
      'timer': 'Таймер',
      'stopwatch': 'Секундомер',
      'sleep_calc': 'Калькулятор сна',
      'custom_stations': 'Станции',
      'back': 'Назад',

      // Timer
      'timer_title': 'Таймер',
      'hours': 'Часы',
      'minutes': 'Минуты',
      'seconds': 'Секунды',
      'start': 'Старт',
      'pause': 'Пауза',
      'resume': 'Продолжить',
      'reset': 'Сброс',
      'timer_finished': 'Таймер завершён!',
      'set_timer': 'Установить таймер',

      // Stopwatch
      'stopwatch_title': 'Секундомер',
      'lap': 'Круг',
      'laps': 'Круги:',

      // Sleep Calculator
      'sleep_calc_title': 'Калькулятор сна',
      'when_sleep': 'Когда мне лечь спать?',
      'when_wake': 'Когда мне проснуться?',
      'wake_time': 'Время пробуждения',
      'sleep_time': 'Время засыпания',
      'calculate': 'Рассчитать',
      'optimal_times': 'Оптимальное время:',
      'cycles': 'циклов',

      // Custom Stations
      'custom_stations_title': 'Управление станциями',
      'add_station': 'Добавить станцию',
      'station_name': 'Название станции',
      'station_type': 'Тип станции',
      'radio_stream': 'Радио поток',
      'youtube_video': 'YouTube видео',
      'local_file': 'Локальный файл',
      'stream_url': 'URL потока',
      'youtube_url': 'YouTube URL или ID',
      'select_file': 'Выбрать файл',
      'add': 'Добавить',
      'delete': 'Удалить',
      'cancel': 'Отмена',
      'my_stations': 'Мои станции:',
      'built_in_stations': 'Встроенные станции:',
    },
    AppLanguage.english: {
      // Main alarm
      'app_title': 'IskrCLOCK',
      'version': 'v5.2',
      'current_time': 'Current Time',
      'set_alarm': 'Set Alarm',
      'alarm_time': 'Alarm Time',
      'snooze_duration': 'Snooze Duration (min)',
      'radio_station': 'Radio Station',
      'play': '▶',
      'stop': '⏸',
      'volume_fade_in': 'Volume Fade In',
      'manage_stations': 'Manage Stations',
      'toggle_alarm': 'Enable Alarm',
      'disable_alarm': 'Disable Alarm',
      'snooze': 'Snooze',
      'fullscreen': '⛶',
      'alarm_in': 'Alarm in:',
      'alarm_modal_title': 'ALARM!',
      'turn_off': 'TURN OFF',

      // Navigation
      'timer': 'Timer',
      'stopwatch': 'Stopwatch',
      'sleep_calc': 'Sleep Calculator',
      'custom_stations': 'Stations',
      'back': 'Back',

      // Timer
      'timer_title': 'Timer',
      'hours': 'Hours',
      'minutes': 'Minutes',
      'seconds': 'Seconds',
      'start': 'Start',
      'pause': 'Pause',
      'resume': 'Resume',
      'reset': 'Reset',
      'timer_finished': 'Timer Finished!',
      'set_timer': 'Set Timer',

      // Stopwatch
      'stopwatch_title': 'Stopwatch',
      'lap': 'Lap',
      'laps': 'Laps:',

      // Sleep Calculator
      'sleep_calc_title': 'Sleep Calculator',
      'when_sleep': 'When should I sleep?',
      'when_wake': 'When should I wake?',
      'wake_time': 'Wake Time',
      'sleep_time': 'Sleep Time',
      'calculate': 'Calculate',
      'optimal_times': 'Optimal times:',
      'cycles': 'cycles',

      // Custom Stations
      'custom_stations_title': 'Manage Stations',
      'add_station': 'Add Station',
      'station_name': 'Station Name',
      'station_type': 'Station Type',
      'radio_stream': 'Radio Stream',
      'youtube_video': 'YouTube Video',
      'local_file': 'Local File',
      'stream_url': 'Stream URL',
      'youtube_url': 'YouTube URL or ID',
      'select_file': 'Select File',
      'add': 'Add',
      'delete': 'Delete',
      'cancel': 'Cancel',
      'my_stations': 'My Stations:',
      'built_in_stations': 'Built-in Stations:',
    },
  };
}
