import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/timer_manager.dart';
import '../services/localization_service.dart';
import '../widgets/animated_background.dart';

class StopwatchScreen extends StatelessWidget {
  const StopwatchScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final stopwatchManager = Provider.of<StopwatchManager>(context);
    final localization = Provider.of<LocalizationService>(context);

    return AnimatedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(localization.t('stopwatch_title')),
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
          child: Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              children: [
                const Spacer(),
                Text(
                  stopwatchManager.stopwatchState.timeString,
                  style: const TextStyle(fontSize: 56, fontWeight: FontWeight.bold, color: Colors.white),
                ),
                const SizedBox(height: 40),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (!stopwatchManager.stopwatchState.isRunning && !stopwatchManager.stopwatchState.isPaused)
                      _button(context, localization.t('start'), Colors.green, () => stopwatchManager.start())
                    else ...[
                      if (stopwatchManager.stopwatchState.isPaused)
                        _button(context, localization.t('resume'), Colors.green, () => stopwatchManager.resume())
                      else
                        _button(context, localization.t('pause'), Colors.orange, () => stopwatchManager.pause()),
                      const SizedBox(width: 15),
                      _button(context, localization.t('lap'), Colors.blue, () => stopwatchManager.lap(), enabled: !stopwatchManager.stopwatchState.isPaused),
                    ],
                    if (stopwatchManager.stopwatchState.isRunning || stopwatchManager.stopwatchState.isPaused) ...[
                      const SizedBox(width: 15),
                      _button(context, localization.t('reset'), Colors.red, () => stopwatchManager.reset()),
                    ],
                  ],
                ),
                const SizedBox(height: 20),
                if (stopwatchManager.stopwatchState.laps.isNotEmpty) ...[
                  Text(localization.t('laps'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 10),
                  Expanded(
                    child: ListView.builder(
                      reverse: true,
                      itemCount: stopwatchManager.stopwatchState.laps.length,
                      itemBuilder: (context, index) {
                        final lapIndex = stopwatchManager.stopwatchState.laps.length - 1 - index;
                        return Container(
                          margin: const EdgeInsets.only(bottom: 8),
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: Colors.black.withOpacity(0.2), borderRadius: BorderRadius.circular(8)),
                          child: Row(
                            children: [
                              Text('Lap ${lapIndex + 1}', style: TextStyle(color: Colors.white.withOpacity(0.8))),
                              const Spacer(),
                              Text(stopwatchManager.stopwatchState.lapString(lapIndex), style: const TextStyle(color: Colors.white, fontFamily: 'monospace')),
                            ],
                          ),
                        );
                      },
                    ),
                  ),
                ] else
                  const Spacer(),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _button(BuildContext context, String label, Color color, VoidCallback onPressed, {bool enabled = true}) {
    return ElevatedButton(
      onPressed: enabled ? onPressed : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        minimumSize: const Size(110, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
    );
  }
}
