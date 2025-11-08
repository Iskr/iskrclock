class TimerState {
  int hours;
  int minutes;
  int seconds;
  bool isRunning;
  bool isPaused;
  int remainingSeconds;
  int totalSeconds;

  TimerState({
    this.hours = 0,
    this.minutes = 0,
    this.seconds = 0,
    this.isRunning = false,
    this.isPaused = false,
    this.remainingSeconds = 0,
    this.totalSeconds = 0,
  });

  String get timeString {
    final h = remainingSeconds ~/ 3600;
    final m = (remainingSeconds % 3600) ~/ 60;
    final s = remainingSeconds % 60;
    return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void setTime({required int hours, required int minutes, required int seconds}) {
    this.hours = hours;
    this.minutes = minutes;
    this.seconds = seconds;
    totalSeconds = hours * 3600 + minutes * 60 + seconds;
    remainingSeconds = totalSeconds;
  }

  void start() {
    if (!isRunning) {
      totalSeconds = hours * 3600 + minutes * 60 + seconds;
      remainingSeconds = totalSeconds;
    }
    isRunning = true;
    isPaused = false;
  }

  void pause() {
    isPaused = true;
  }

  void resume() {
    isPaused = false;
  }

  void reset() {
    isRunning = false;
    isPaused = false;
    remainingSeconds = 0;
    totalSeconds = 0;
    hours = 0;
    minutes = 0;
    seconds = 0;
  }

  void tick() {
    if (isRunning && !isPaused && remainingSeconds > 0) {
      remainingSeconds--;
    }
  }
}

class StopwatchState {
  double elapsedTime; // in seconds with milliseconds
  bool isRunning;
  bool isPaused;
  List<double> laps;
  DateTime? startTime;
  double pausedTime;

  StopwatchState({
    this.elapsedTime = 0,
    this.isRunning = false,
    this.isPaused = false,
    this.laps = const [],
    this.startTime,
    this.pausedTime = 0,
  });

  String get timeString {
    final totalMilliseconds = (elapsedTime * 1000).round();
    final hours = totalMilliseconds ~/ 3600000;
    final minutes = (totalMilliseconds % 3600000) ~/ 60000;
    final seconds = (totalMilliseconds % 60000) ~/ 1000;
    final milliseconds = (totalMilliseconds % 1000) ~/ 10;

    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}.${milliseconds.toString().padLeft(2, '0')}';
  }

  void start() {
    isRunning = true;
    isPaused = false;
    startTime = DateTime.now();
    pausedTime = elapsedTime;
  }

  void pause() {
    isPaused = true;
    isRunning = false;
  }

  void resume() {
    isRunning = true;
    isPaused = false;
    startTime = DateTime.now();
    pausedTime = elapsedTime;
  }

  void reset() {
    elapsedTime = 0;
    isRunning = false;
    isPaused = false;
    laps = [];
    startTime = null;
    pausedTime = 0;
  }

  void lap() {
    laps = [...laps, elapsedTime];
  }

  void update() {
    if (isRunning && startTime != null) {
      elapsedTime = pausedTime + DateTime.now().difference(startTime!).inMilliseconds / 1000;
    }
  }

  String lapString(int index) {
    if (index >= laps.length) return '';

    final lapTime = laps[index];
    final totalMilliseconds = (lapTime * 1000).round();
    final hours = totalMilliseconds ~/ 3600000;
    final minutes = (totalMilliseconds % 3600000) ~/ 60000;
    final seconds = (totalMilliseconds % 60000) ~/ 1000;
    final milliseconds = (totalMilliseconds % 1000) ~/ 10;

    return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}.${milliseconds.toString().padLeft(2, '0')}';
  }
}
