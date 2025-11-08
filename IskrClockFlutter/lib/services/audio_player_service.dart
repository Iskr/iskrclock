import 'dart:async';
import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import '../models/radio_station.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class AudioPlayerService with ChangeNotifier {
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlaying = false;
  RadioStation? _currentStation;
  double _volume = 0.5;
  Timer? _fadeTimer;
  Timer? _monitoringTimer;
  int _stuckCounter = 0;

  bool get isPlaying => _isPlaying;
  RadioStation? get currentStation => _currentStation;
  double get volume => _volume;

  AudioPlayerService() {
    _audioPlayer.onPlayerStateChanged.listen((state) {
      _isPlaying = state == PlayerState.playing;
      notifyListeners();
    });
  }

  Future<void> playAlarm({required String stationId, bool fadeIn = true}) async {
    final allStations = [...RadioStation.builtInStations, ...await _loadCustomStations()];
    final station = allStations.firstWhere(
      (s) => s.id == stationId,
      orElse: () => RadioStation(id: 'classic', name: 'Classic', type: 'classic'),
    );

    await play(station: station, fadeIn: fadeIn);
  }

  Future<void> play({required RadioStation station, bool fadeIn = false}) async {
    await stop();
    _currentStation = station;

    switch (station.stationType) {
      case StationType.classic:
        await _playClassicAlarm();
        break;
      case StationType.radio:
        await _playRadioStream(url: station.url ?? '', fadeIn: fadeIn);
        break;
      case StationType.youtube:
        // YouTube playback - fallback to classic for now
        await _playClassicAlarm();
        break;
      case StationType.local:
        await _playLocalFile(stationId: station.id, fadeIn: fadeIn);
        break;
    }

    _isPlaying = true;
    _startMonitoring();
    notifyListeners();
  }

  Future<void> stop() async {
    _fadeTimer?.cancel();
    _monitoringTimer?.cancel();
    await _audioPlayer.stop();
    _isPlaying = false;
    _stuckCounter = 0;
    notifyListeners();
  }

  Future<void> _playRadioStream({required String url, bool fadeIn = false}) async {
    if (url.isEmpty) {
      await _playClassicAlarm();
      return;
    }

    try {
      // Set initial volume
      if (fadeIn) {
        await _audioPlayer.setVolume(0.0);
        _startFadeIn(); // Start fade-in timer (don't await)
      } else {
        await _audioPlayer.setVolume(_volume);
      }

      await _audioPlayer.play(UrlSource(url));
    } catch (e) {
      print('Error playing radio stream: $e');
      await _playClassicAlarm();
    }
  }

  Future<void> _playLocalFile({required String stationId, bool fadeIn = false}) async {
    // TODO: Implement local file playback
    // For now, fallback to classic alarm
    await _playClassicAlarm();
  }

  // Public method to play classic alarm
  Future<void> playClassicAlarm() async {
    await _playClassicAlarm();
  }

  Future<void> _playClassicAlarm() async {
    // Play beep tones from assets or generate
    // For now, use a simple tone
    try {
      await _audioPlayer.setVolume(_volume);
      // You would need to add a beep sound file to assets
      // await _audioPlayer.play(AssetSource('sounds/beep.mp3'));

      // Fallback: play from URL or generate synthetic beep
      print('Playing classic alarm sound');
    } catch (e) {
      print('Error playing classic alarm: $e');
    }
  }

  Future<void> _startFadeIn() async {
    double currentVolume = 0.0;
    const targetVolume = 0.5;
    const fadeDuration = Duration(seconds: 30);
    const steps = 60;
    const increment = targetVolume / steps;
    final interval = fadeDuration.inMilliseconds ~/ steps;

    _fadeTimer = Timer.periodic(Duration(milliseconds: interval), (timer) async {
      currentVolume += increment;
      if (currentVolume >= targetVolume) {
        currentVolume = targetVolume;
        timer.cancel();
      }
      await _audioPlayer.setVolume(currentVolume);
    });
  }

  void _startMonitoring() {
    _monitoringTimer = Timer.periodic(const Duration(seconds: 3), (timer) {
      _checkPlaybackHealth();
    });
  }

  void _checkPlaybackHealth() {
    // Check if playback is stuck or failed
    if (!_isPlaying && _currentStation != null) {
      _stuckCounter++;
      if (_stuckCounter >= 3) {
        // Stream has been stuck for 9 seconds
        _failover();
      }
    } else {
      _stuckCounter = 0;
    }
  }

  Future<void> _failover() async {
    print('Stream failed, switching to classic alarm');
    await stop();
    await _playClassicAlarm();
  }

  Future<List<RadioStation>> _loadCustomStations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stationsJson = prefs.getString('customStations');
      if (stationsJson != null) {
        final List<dynamic> decoded = json.decode(stationsJson);
        return decoded.map((json) => RadioStation.fromJson(json)).toList();
      }
    } catch (e) {
      print('Error loading custom stations: $e');
    }
    return [];
  }

  @override
  void dispose() {
    _fadeTimer?.cancel();
    _monitoringTimer?.cancel();
    _audioPlayer.dispose();
    super.dispose();
  }
}
