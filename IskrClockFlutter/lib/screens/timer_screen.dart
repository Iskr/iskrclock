import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/timer_manager.dart';
import '../services/localization_service.dart';
import '../widgets/animated_background.dart';

class TimerScreen extends StatefulWidget {
  const TimerScreen({Key? key}) : super(key: key);

  @override
  State<TimerScreen> createState() => _TimerScreenState();
}

class _TimerScreenState extends State<TimerScreen> {
  int hours = 0;
  int minutes = 0;
  int seconds = 0;

  @override
  Widget build(BuildContext context) {
    final timerManager = Provider.of<TimerManager>(context);
    final localization = Provider.of<LocalizationService>(context);

    return AnimatedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(localization.t('timer_title')),
          backgroundColor: Colors.transparent,
          elevation: 0,
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: GestureDetector(
                onTap: () => localization.toggleLanguage(),
                child: Center(
                  child: Text(
                    localization.flag,
                    style: const TextStyle(fontSize: 24),
                  ),
                ),
              ),
            ),
          ],
        ),
        body: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Timer display
                if (timerManager.timerState.isRunning ||
                    timerManager.timerState.isPaused)
                  Text(
                    timerManager.timerState.timeString,
                    style: const TextStyle(
                      fontSize: 72,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  )
                else
                  // Time input
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Column(
                      children: [
                        Text(
                          localization.t('set_timer'),
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _buildTimePicker(
                              label: localization.t('hours'),
                              value: hours,
                              maxValue: 23,
                              onChanged: (v) => setState(() => hours = v),
                            ),
                            const SizedBox(width: 20),
                            _buildTimePicker(
                              label: localization.t('minutes'),
                              value: minutes,
                              maxValue: 59,
                              onChanged: (v) => setState(() => minutes = v),
                            ),
                            const SizedBox(width: 20),
                            _buildTimePicker(
                              label: localization.t('seconds'),
                              value: seconds,
                              maxValue: 59,
                              onChanged: (v) => setState(() => seconds = v),
                            ),
                          ],
                        ),
                        const SizedBox(height: 20),
                        // Preset buttons
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          alignment: WrapAlignment.center,
                          children: [
                            _presetButton('1 min', 0, 1, 0),
                            _presetButton('5 min', 0, 5, 0),
                            _presetButton('10 min', 0, 10, 0),
                            _presetButton('15 min', 0, 15, 0),
                            _presetButton('30 min', 0, 30, 0),
                          ],
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 40),

                // Control buttons
                if (!timerManager.timerState.isRunning &&
                    !timerManager.timerState.isPaused)
                  ElevatedButton(
                    onPressed: (hours > 0 || minutes > 0 || seconds > 0)
                        ? () {
                            timerManager.setTime(
                              hours: hours,
                              minutes: minutes,
                              seconds: seconds,
                            );
                            timerManager.start();
                          }
                        : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      minimumSize: const Size(200, 60),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(
                      localization.t('start'),
                      style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                  )
                else
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (timerManager.timerState.isPaused)
                        ElevatedButton(
                          onPressed: () => timerManager.resume(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            minimumSize: const Size(120, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(localization.t('resume')),
                        )
                      else
                        ElevatedButton(
                          onPressed: () => timerManager.pause(),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            minimumSize: const Size(120, 50),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          child: Text(localization.t('pause')),
                        ),
                      const SizedBox(width: 15),
                      ElevatedButton(
                        onPressed: () {
                          timerManager.reset();
                          setState(() {
                            hours = 0;
                            minutes = 0;
                            seconds = 0;
                          });
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.red,
                          minimumSize: const Size(120, 50),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: Text(localization.t('reset')),
                      ),
                    ],
                  ),

                // Timer finished message
                if (timerManager.timerState.remainingSeconds == 0 &&
                    timerManager.timerState.totalSeconds > 0) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(
                      color: Colors.green.withOpacity(0.8),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      localization.t('timer_finished'),
                      style: const TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTimePicker({
    required String label,
    required int value,
    required int maxValue,
    required ValueChanged<int> onChanged,
  }) {
    return Column(
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            color: Colors.white.withOpacity(0.7),
          ),
        ),
        SizedBox(
          width: 80,
          height: 120,
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
                    index.toString(),
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
        ),
      ],
    );
  }

  Widget _presetButton(String title, int h, int m, int s) {
    return ElevatedButton(
      onPressed: () {
        setState(() {
          hours = h;
          minutes = m;
          seconds = s;
        });
      },
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.blue.withOpacity(0.6),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
      child: Text(title, style: const TextStyle(fontSize: 14)),
    );
  }
}
