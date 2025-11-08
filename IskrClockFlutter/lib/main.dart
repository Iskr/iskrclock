import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'services/alarm_manager.dart';
import 'services/audio_player_service.dart';
import 'services/localization_service.dart';
import 'services/custom_stations_manager.dart';
import 'services/timer_manager.dart';
import 'services/notification_service.dart';
import 'screens/alarm_screen.dart';
import 'screens/timer_screen.dart';
import 'screens/stopwatch_screen.dart';
import 'screens/sleep_calculator_screen.dart';
import 'screens/custom_stations_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize notification service
  await NotificationService().initialize();

  runApp(const IskrClockApp());
}

class IskrClockApp extends StatelessWidget {
  const IskrClockApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AlarmManager()),
        ChangeNotifierProvider(create: (_) => AudioPlayerService()),
        ChangeNotifierProvider(create: (_) => LocalizationService()),
        ChangeNotifierProvider(create: (_) => CustomStationsManager()),
        ChangeNotifierProvider(create: (_) => TimerManager()),
        ChangeNotifierProvider(create: (_) => StopwatchManager()),
      ],
      child: Consumer<LocalizationService>(
        builder: (context, localization, _) {
          return MaterialApp(
            title: 'IskrCLOCK',
            theme: ThemeData.dark().copyWith(
              primaryColor: Colors.blue,
              scaffoldBackgroundColor: Colors.transparent,
              appBarTheme: const AppBarTheme(
                backgroundColor: Colors.transparent,
                elevation: 0,
              ),
            ),
            home: const MainScreen(),
            debugShowCheckedModeBanner: false,
          );
        },
      ),
    );
  }
}

class MainScreen extends StatefulWidget {
  const MainScreen({Key? key}) : super(key: key);

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    AlarmScreen(),
    TimerScreen(),
    StopwatchScreen(),
    SleepCalculatorScreen(),
    CustomStationsScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final localization = Provider.of<LocalizationService>(context);

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.black.withOpacity(0.8),
        selectedItemColor: Colors.blue,
        unselectedItemColor: Colors.white54,
        items: [
          BottomNavigationBarItem(
            icon: const Icon(Icons.alarm),
            label: localization.t('set_alarm'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.timer),
            label: localization.t('timer'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.timer_outlined),
            label: localization.t('stopwatch'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.bedtime),
            label: localization.t('sleep_calc'),
          ),
          BottomNavigationBarItem(
            icon: const Icon(Icons.radio),
            label: localization.t('custom_stations'),
          ),
        ],
      ),
    );
  }
}
