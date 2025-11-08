import 'dart:async';
import 'package:flutter/material.dart';
import '../models/alarm.dart';
import '../models/radio_station.dart';
import 'audio_player_service.dart';
import 'notification_service.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AlarmManager with ChangeNotifier {
  Alarm _alarm = Alarm(id: 'main');
  DateTime _currentTime = DateTime.now();
  bool _isAlarmTriggered = false;
  Timer? _clockTimer;

  Alarm get alarm => _alarm;
  DateTime get currentTime => _currentTime;
  bool get isAlarmTriggered => _isAlarmTriggered;

  final AudioPlayerService _audioPlayer = AudioPlayerService();
  final NotificationService _notificationService = NotificationService();

  AlarmManager() {
    _loadAlarm();
    _startClockTimer();
  }

  void _startClockTimer() {
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _currentTime = DateTime.now();
      _checkAlarm();
      notifyListeners();
    });
  }

  Future<void> _loadAlarm() async {
    final prefs = await SharedPreferences.getInstance();
    final alarmJson = prefs.getString('alarm');
    if (alarmJson != null) {
      _alarm = Alarm.fromJson(json.decode(alarmJson));
      notifyListeners();
    }
  }

  Future<void> _saveAlarm() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('alarm', json.encode(_alarm.toJson()));
  }

  Future<void> toggleAlarm() async {
    _alarm.isEnabled = !_alarm.isEnabled;

    if (_alarm.isEnabled) {
      _alarm.snoozeCount = 0;
      _alarm.alarmDateTime = _alarm.calculateNextAlarmDateTime();
      await _scheduleNotification();
    } else {
      _isAlarmTriggered = false;
      await _cancelNotification();
      _audioPlayer.stop();
    }

    await _saveAlarm();
    notifyListeners();
  }

  Future<void> setAlarmTime(int hour, int minute) async {
    _alarm.hour = hour;
    _alarm.minute = minute;

    if (_alarm.isEnabled) {
      _alarm.alarmDateTime = _alarm.calculateNextAlarmDateTime();
      await _scheduleNotification();
    }

    await _saveAlarm();
    notifyListeners();
  }

  Future<void> setSnoozeDuration(int duration) async {
    _alarm.snoozeDuration = duration;
    await _saveAlarm();
    notifyListeners();
  }

  Future<void> setVolumeFadeIn(bool enabled) async {
    _alarm.volumeFadeIn = enabled;
    await _saveAlarm();
    notifyListeners();
  }

  Future<void> setSelectedStation(String stationId) async {
    _alarm.selectedStation = stationId;
    await _saveAlarm();
    notifyListeners();
  }

  Future<void> snooze() async {
    if (!_isAlarmTriggered) return;

    _alarm.snoozeCount++;
    _isAlarmTriggered = false;
    _audioPlayer.stop();

    // Schedule alarm for snooze duration
    final snoozeDateTime = DateTime.now().add(
      Duration(minutes: _alarm.snoozeDuration),
    );
    _alarm.alarmDateTime = snoozeDateTime;
    await _scheduleNotification();

    await _saveAlarm();
    notifyListeners();
  }

  Future<void> stopAlarm() async {
    _isAlarmTriggered = false;
    _alarm.isEnabled = false;
    _alarm.snoozeCount = 0;
    _audioPlayer.stop();
    await _cancelNotification();
    await _saveAlarm();
    notifyListeners();
  }

  void _checkAlarm() {
    if (!_alarm.isEnabled || _isAlarmTriggered) return;

    final now = DateTime.now();
    final currentHour = now.hour;
    final currentMinute = now.minute;
    final currentSecond = now.second;

    // Trigger at exact minute (within first second)
    if (currentHour == _alarm.hour &&
        currentMinute == _alarm.minute &&
        currentSecond == 0) {
      _triggerAlarm();
    }
  }

  void _triggerAlarm() {
    _isAlarmTriggered = true;

    // Play alarm sound
    _audioPlayer.playAlarm(
      stationId: _alarm.selectedStation,
      fadeIn: _alarm.volumeFadeIn,
    );

    // Send local notification
    _notificationService.sendAlarmNotification();

    notifyListeners();
  }

  Future<void> _scheduleNotification() async {
    if (_alarm.alarmDateTime == null) return;
    await _notificationService.scheduleAlarmNotification(_alarm.alarmDateTime!);
  }

  Future<void> _cancelNotification() async {
    await _notificationService.cancelAllNotifications();
  }

  @override
  void dispose() {
    _clockTimer?.cancel();
    super.dispose();
  }
}
