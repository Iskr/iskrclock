import 'package:hive/hive.dart';

part 'alarm.g.dart';

@HiveType(typeId: 0)
class Alarm extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  int hour;

  @HiveField(2)
  int minute;

  @HiveField(3)
  bool isEnabled;

  @HiveField(4)
  int snoozeDuration; // in minutes

  @HiveField(5)
  int snoozeCount;

  @HiveField(6)
  bool volumeFadeIn;

  @HiveField(7)
  String selectedStation;

  @HiveField(8)
  DateTime? alarmDateTime;

  Alarm({
    required this.id,
    this.hour = 7,
    this.minute = 0,
    this.isEnabled = false,
    this.snoozeDuration = 5,
    this.snoozeCount = 0,
    this.volumeFadeIn = true,
    this.selectedStation = 'classic',
    this.alarmDateTime,
  });

  String get timeString {
    final h = hour.toString().padLeft(2, '0');
    final m = minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  DateTime calculateNextAlarmDateTime() {
    final now = DateTime.now();
    var alarmTime = DateTime(
      now.year,
      now.month,
      now.day,
      hour,
      minute,
      0,
    );

    // If alarm time has passed today, schedule for tomorrow
    if (alarmTime.isBefore(now)) {
      alarmTime = alarmTime.add(const Duration(days: 1));
    }

    return alarmTime;
  }

  String timeRemaining() {
    if (!isEnabled) return '';

    final alarmTime = calculateNextAlarmDateTime();
    final now = DateTime.now();
    final difference = alarmTime.difference(now);

    if (difference.isNegative) return '';

    final hours = difference.inHours;
    final minutes = difference.inMinutes % 60;

    if (hours > 0) {
      return '${hours}h ${minutes}m';
    } else {
      return '${minutes}m';
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'hour': hour,
      'minute': minute,
      'isEnabled': isEnabled,
      'snoozeDuration': snoozeDuration,
      'snoozeCount': snoozeCount,
      'volumeFadeIn': volumeFadeIn,
      'selectedStation': selectedStation,
      'alarmDateTime': alarmDateTime?.toIso8601String(),
    };
  }

  factory Alarm.fromJson(Map<String, dynamic> json) {
    return Alarm(
      id: json['id'],
      hour: json['hour'],
      minute: json['minute'],
      isEnabled: json['isEnabled'],
      snoozeDuration: json['snoozeDuration'],
      snoozeCount: json['snoozeCount'],
      volumeFadeIn: json['volumeFadeIn'],
      selectedStation: json['selectedStation'],
      alarmDateTime: json['alarmDateTime'] != null
          ? DateTime.parse(json['alarmDateTime'])
          : null,
    );
  }
}
