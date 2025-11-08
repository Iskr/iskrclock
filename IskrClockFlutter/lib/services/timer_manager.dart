import 'dart:async';
import 'package:flutter/material.dart';
import '../models/timer_state.dart';
import 'audio_player_service.dart';
import 'notification_service.dart';

class TimerManager with ChangeNotifier {
  TimerState _timerState = TimerState();
  Timer? _timer;
  final AudioPlayerService _audioPlayer = AudioPlayerService();
  final NotificationService _notificationService = NotificationService();

  TimerState get timerState => _timerState;

  void start() {
    _timerState.start();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _timerState.tick();
      if (_timerState.remainingSeconds == 0) {
        _timerCompleted();
      }
      notifyListeners();
    });
    notifyListeners();
  }

  void pause() {
    _timerState.pause();
    _timer?.cancel();
    notifyListeners();
  }

  void resume() {
    _timerState.resume();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      _timerState.tick();
      if (_timerState.remainingSeconds == 0) {
        _timerCompleted();
      }
      notifyListeners();
    });
    notifyListeners();
  }

  void reset() {
    _timer?.cancel();
    _timerState.reset();
    notifyListeners();
  }

  void setTime({required int hours, required int minutes, required int seconds}) {
    _timerState.setTime(hours: hours, minutes: minutes, seconds: seconds);
    notifyListeners();
  }

  void _timerCompleted() {
    _timer?.cancel();
    _timerState.isRunning = false;

    // Play notification sound
    _audioPlayer._playClassicAlarm();

    // Send notification
    _notificationService.sendAlarmNotification();

    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}

class StopwatchManager with ChangeNotifier {
  StopwatchState _stopwatchState = StopwatchState();
  Timer? _timer;

  StopwatchState get stopwatchState => _stopwatchState;

  void start() {
    _stopwatchState.start();
    _timer = Timer.periodic(const Duration(milliseconds: 10), (timer) {
      _stopwatchState.update();
      notifyListeners();
    });
    notifyListeners();
  }

  void pause() {
    _stopwatchState.pause();
    _timer?.cancel();
    notifyListeners();
  }

  void resume() {
    _stopwatchState.resume();
    _timer = Timer.periodic(const Duration(milliseconds: 10), (timer) {
      _stopwatchState.update();
      notifyListeners();
    });
    notifyListeners();
  }

  void reset() {
    _timer?.cancel();
    _stopwatchState.reset();
    notifyListeners();
  }

  void lap() {
    _stopwatchState.lap();
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}
