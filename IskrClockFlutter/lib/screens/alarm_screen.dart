import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/alarm_manager.dart';
import '../services/audio_player_service.dart';
import '../services/localization_service.dart';
import '../services/custom_stations_manager.dart';
import '../models/radio_station.dart';
import '../widgets/animated_background.dart';
import 'package:intl/intl.dart';

class AlarmScreen extends StatefulWidget {
  const AlarmScreen({Key? key}) : super(key: key);

  @override
  State<AlarmScreen> createState() => _AlarmScreenState();
}

class _AlarmScreenState extends State<AlarmScreen> {
  int selectedHour = 7;
  int selectedMinute = 0;
  int snoozeDuration = 5;

  @override
  Widget build(BuildContext context) {
    final alarmManager = Provider.of<AlarmManager>(context);
    final audioPlayer = Provider.of<AudioPlayerService>(context);
    final localization = Provider.of<LocalizationService>(context);

    selectedHour = alarmManager.alarm.hour;
    selectedMinute = alarmManager.alarm.minute;
    snoozeDuration = alarmManager.alarm.snoozeDuration;

    return AnimatedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        body: Stack(
          children: [
            // Main content
            SingleChildScrollView(
              child: SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    children: [
                      // Header
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(
                                localization.t('app_title'),
                                style: const TextStyle(
                                  fontSize: 28,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.white,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                localization.t('version'),
                                style: TextStyle(
                                  fontSize: 14,
                                  color: Colors.white.withOpacity(0.7),
                                ),
                              ),
                            ],
                          ),
                          // Language toggle
                          GestureDetector(
                            onTap: () => localization.toggleLanguage(),
                            child: Text(
                              localization.flag,
                              style: const TextStyle(fontSize: 24),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 40),

                      // Current time display
                      Text(
                        DateFormat('HH:mm').format(alarmManager.currentTime),
                        style: const TextStyle(
                          fontSize: 64,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        DateFormat(
                          localization.currentLanguage == AppLanguage.russian
                              ? 'd MMMM yyyy'
                              : 'MMMM d, yyyy',
                          localization.languageCode,
                        ).format(alarmManager.currentTime),
                        style: TextStyle(
                          fontSize: 18,
                          color: Colors.white.withOpacity(0.8),
                        ),
                      ),

                      const SizedBox(height: 40),

                      // Alarm settings card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.3),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Alarm time picker
                            Text(
                              localization.t('alarm_time'),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),

                            const SizedBox(height: 15),

                            // Time picker wheels
                            SizedBox(
                              height: 120,
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  // Hour picker
                                  _buildNumberPicker(
                                    value: selectedHour,
                                    maxValue: 23,
                                    onChanged: (value) {
                                      setState(() => selectedHour = value);
                                      alarmManager.setAlarmTime(value, selectedMinute);
                                    },
                                  ),

                                  const Padding(
                                    padding: EdgeInsets.symmetric(horizontal: 10),
                                    child: Text(
                                      ':',
                                      style: TextStyle(
                                        fontSize: 32,
                                        fontWeight: FontWeight.bold,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),

                                  // Minute picker
                                  _buildNumberPicker(
                                    value: selectedMinute,
                                    maxValue: 59,
                                    onChanged: (value) {
                                      setState(() => selectedMinute = value);
                                      alarmManager.setAlarmTime(selectedHour, value);
                                    },
                                  ),
                                ],
                              ),
                            ),

                            const Divider(color: Colors.white24, height: 40),

                            // Snooze duration
                            Text(
                              localization.t('snooze_duration'),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),

                            const SizedBox(height: 10),

                            Row(
                              children: [
                                SizedBox(
                                  width: 60,
                                  child: TextField(
                                    controller: TextEditingController(
                                      text: snoozeDuration.toString(),
                                    ),
                                    keyboardType: TextInputType.number,
                                    style: const TextStyle(color: Colors.white),
                                    decoration: const InputDecoration(
                                      filled: true,
                                      fillColor: Colors.white12,
                                      border: OutlineInputBorder(),
                                    ),
                                    onChanged: (value) {
                                      final duration = int.tryParse(value) ?? 5;
                                      setState(() => snoozeDuration = duration);
                                      alarmManager.setSnoozeDuration(duration);
                                    },
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Text(
                                  localization.t('minutes'),
                                  style: TextStyle(
                                    color: Colors.white.withOpacity(0.8),
                                  ),
                                ),
                              ],
                            ),

                            const Divider(color: Colors.white24, height: 40),

                            // Radio station selector
                            Text(
                              localization.t('radio_station'),
                              style: const TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),

                            const SizedBox(height: 10),

                            _StationSelector(),

                            const SizedBox(height: 20),

                            // Volume fade-in toggle
                            SwitchListTile(
                              title: Text(
                                localization.t('volume_fade_in'),
                                style: const TextStyle(color: Colors.white),
                              ),
                              value: alarmManager.alarm.volumeFadeIn,
                              onChanged: (value) {
                                alarmManager.setVolumeFadeIn(value);
                              },
                              activeColor: Colors.blue,
                            ),

                            const SizedBox(height: 20),

                            // Play/Stop button
                            ElevatedButton(
                              onPressed: () {
                                if (audioPlayer.isPlaying) {
                                  audioPlayer.stop();
                                } else {
                                  audioPlayer.playAlarm(
                                    stationId: alarmManager.alarm.selectedStation,
                                    fadeIn: false,
                                  );
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: Colors.blue.withOpacity(0.8),
                                minimumSize: const Size(double.infinity, 50),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(
                                    audioPlayer.isPlaying
                                        ? Icons.pause
                                        : Icons.play_arrow,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    audioPlayer.isPlaying
                                        ? localization.t('stop')
                                        : localization.t('play'),
                                    style: const TextStyle(fontSize: 16),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 15),

                            // Toggle alarm button
                            ElevatedButton(
                              onPressed: () => alarmManager.toggleAlarm(),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: alarmManager.alarm.isEnabled
                                    ? Colors.red
                                    : Colors.green,
                                minimumSize: const Size(double.infinity, 50),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(12),
                                ),
                              ),
                              child: Text(
                                alarmManager.alarm.isEnabled
                                    ? localization.t('disable_alarm')
                                    : localization.t('toggle_alarm'),
                                style: const TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),

                            // Remaining time
                            if (alarmManager.alarm.isEnabled) ...[
                              const SizedBox(height: 15),
                              Center(
                                child: Text(
                                  '${localization.t('alarm_in')} ${alarmManager.alarm.timeRemaining()}',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.white.withOpacity(0.9),
                                  ),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Alarm modal
            if (alarmManager.isAlarmTriggered) _AlarmModal(),
          ],
        ),
      ),
    );
  }

  Widget _buildNumberPicker({
    required int value,
    required int maxValue,
    required ValueChanged<int> onChanged,
  }) {
    return SizedBox(
      width: 80,
      child: ListWheelScrollView.useDelegate(
        controller: FixedExtentScrollController(initialItem: value),
        itemExtent: 40,
        diameterRatio: 1.5,
        physics: const FixedExtentScrollPhysics(),
        onSelectedItemChanged: onChanged,
        childDelegate: ListWheelChildBuilderDelegate(
          builder: (context, index) {
            if (index < 0 || index > maxValue) return null;
            return Center(
              child: Text(
                index.toString().padLeft(2, '0'),
                style: const TextStyle(
                  fontSize: 24,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _StationSelector extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final alarmManager = Provider.of<AlarmManager>(context);
    final customManager = Provider.of<CustomStationsManager>(context);
    final localization = Provider.of<LocalizationService>(context);

    final allStations = [
      ...RadioStation.builtInStations,
      ...customManager.customStations,
    ];

    final currentStation = allStations.firstWhere(
      (s) => s.id == alarmManager.alarm.selectedStation,
      orElse: () => RadioStation.builtInStations.first,
    );

    return PopupMenuButton<String>(
      child: Container(
        padding: const EdgeInsets.all(15),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Row(
          children: [
            Text(
              '${currentStation.icon} ${currentStation.name}',
              style: const TextStyle(color: Colors.white),
            ),
            const Spacer(),
            const Icon(Icons.arrow_drop_down, color: Colors.white54),
          ],
        ),
      ),
      itemBuilder: (context) {
        return allStations.map((station) {
          return PopupMenuItem<String>(
            value: station.id,
            child: Row(
              children: [
                Text('${station.icon} ${station.name}'),
                if (station.id == currentStation.id) ...[
                  const Spacer(),
                  const Icon(Icons.check, size: 18),
                ],
              ],
            ),
          );
        }).toList();
      },
      onSelected: (stationId) {
        alarmManager.setSelectedStation(stationId);
      },
    );
  }
}

class _AlarmModal extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final alarmManager = Provider.of<AlarmManager>(context, listen: false);
    final localization = Provider.of<LocalizationService>(context);

    return Container(
      color: Colors.black.withOpacity(0.8),
      child: Center(
        child: Padding(
          padding: const EdgeInsets.all(40.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                localization.t('alarm_modal_title'),
                style: const TextStyle(
                  fontSize: 48,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),

              const SizedBox(height: 20),

              Text(
                DateFormat('HH:mm').format(DateTime.now()),
                style: const TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w500,
                  color: Colors.white,
                ),
              ),

              const SizedBox(height: 40),

              // Turn off button
              ElevatedButton(
                onPressed: () => alarmManager.stopAlarm(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  localization.t('turn_off'),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),

              const SizedBox(height: 15),

              // Snooze button
              ElevatedButton(
                onPressed: () => alarmManager.snooze(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange,
                  minimumSize: const Size(double.infinity, 60),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: Text(
                  localization.t('snooze'),
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
