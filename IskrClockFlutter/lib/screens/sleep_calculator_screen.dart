import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/localization_service.dart';
import '../widgets/animated_background.dart';
import 'package:intl/intl.dart';

enum CalculatorMode { whenToSleep, whenToWake }

class SleepCalculatorScreen extends StatefulWidget {
  const SleepCalculatorScreen({Key? key}) : super(key: key);

  @override
  State<SleepCalculatorScreen> createState() => _SleepCalculatorScreenState();
}

class _SleepCalculatorScreenState extends State<SleepCalculatorScreen> {
  CalculatorMode mode = CalculatorMode.whenToSleep;
  TimeOfDay selectedTime = TimeOfDay.now();
  List<DateTime> results = [];

  @override
  Widget build(BuildContext context) {
    final localization = Provider.of<LocalizationService>(context);

    return AnimatedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(localization.t('sleep_calc_title')),
          backgroundColor: Colors.transparent,
          elevation: 0,
          actions: [
            Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: GestureDetector(
                onTap: () => localization.toggleLanguage(),
                child: Center(child: Text(localization.flag, style: const TextStyle(fontSize: 24))),
              ),
            ),
          ],
        ),
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                // Mode selector
                Row(
                  children: [
                    Expanded(
                      child: _modeButton(
                        localization.t('when_sleep'),
                        mode == CalculatorMode.whenToSleep,
                        () => setState(() {
                          mode = CalculatorMode.whenToSleep;
                          results = [];
                        }),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: _modeButton(
                        localization.t('when_wake'),
                        mode == CalculatorMode.whenToWake,
                        () => setState(() {
                          mode = CalculatorMode.whenToWake;
                          results = [];
                        }),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Column(
                    children: [
                      Text(
                        mode == CalculatorMode.whenToSleep ? localization.t('wake_time') : localization.t('sleep_time'),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                      ),
                      const SizedBox(height: 15),
                      ElevatedButton(
                        onPressed: () async {
                          final time = await showTimePicker(context: context, initialTime: selectedTime);
                          if (time != null) setState(() => selectedTime = time);
                        },
                        child: Text('${selectedTime.hour.toString().padLeft(2, '0')}:${selectedTime.minute.toString().padLeft(2, '0')}', style: const TextStyle(fontSize: 32)),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                ElevatedButton(
                  onPressed: () => _calculate(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(localization.t('calculate'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                ),
                if (results.isNotEmpty) ...[
                  const SizedBox(height: 30),
                  Text(localization.t('optimal_times'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 15),
                  ...results.asMap().entries.map((entry) {
                    final index = entry.key;
                    final time = entry.value;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(DateFormat('HH:mm').format(time), style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                              Text('${index + 1} ${localization.t('cycles')} (${(index + 1) * 90} min)', style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.7))),
                            ],
                          ),
                          const Spacer(),
                          const Icon(Icons.bedtime, color: Colors.yellow, size: 24),
                        ],
                      ),
                    );
                  }),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _modeButton(String label, bool isSelected, VoidCallback onPressed) {
    return ElevatedButton(
      onPressed: onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: isSelected ? Colors.blue : Colors.white.withOpacity(0.2),
        minimumSize: const Size(double.infinity, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 14)),
    );
  }

  void _calculate() {
    results = [];
    final now = DateTime.now();
    final selectedDateTime = DateTime(now.year, now.month, now.day, selectedTime.hour, selectedTime.minute);
    const sleepCycleDuration = Duration(minutes: 90);
    const fallAsleepTime = Duration(minutes: 14);

    if (mode == CalculatorMode.whenToSleep) {
      for (int cycles = 6; cycles >= 1; cycles--) {
        final totalSleepTime = sleepCycleDuration * cycles + fallAsleepTime;
        results.add(selectedDateTime.subtract(totalSleepTime));
      }
    } else {
      for (int cycles = 1; cycles <= 6; cycles++) {
        final totalSleepTime = sleepCycleDuration * cycles + fallAsleepTime;
        results.add(selectedDateTime.add(totalSleepTime));
      }
    }
    setState(() {});
  }
}
