import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';

enum TimeOfDay { sunrise, day, sunset, night }

class AnimatedBackground extends StatefulWidget {
  final Widget child;

  const AnimatedBackground({Key? key, required this.child}) : super(key: key);

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  List<Color> currentGradient = [];
  List<Color> nextGradient = [];
  double progress = 0.0;
  Timer? gradientTimer;
  List<Star> stars = [];
  Timer? starTimer;

  static const transitionDuration = Duration(seconds: 60);
  static const starCount = 50;

  @override
  void initState() {
    super.initState();
    final timeOfDay = _getTimeOfDay();
    currentGradient = _getRandomGradient(timeOfDay);
    nextGradient = _getRandomGradient(timeOfDay);
    _generateStars();
    _startGradientAnimation();
    _startStarAnimation();
  }

  @override
  void dispose() {
    gradientTimer?.cancel();
    starTimer?.cancel();
    super.dispose();
  }

  void _generateStars() {
    final random = Random();
    stars = List.generate(
      starCount,
      (index) => Star(
        x: random.nextDouble(),
        y: random.nextDouble(),
        size: random.nextDouble() * 2 + 1,
        opacity: random.nextDouble() * 0.7 + 0.3,
        twinkleOpacity: random.nextDouble() * 0.7 + 0.3,
      ),
    );
  }

  void _startGradientAnimation() {
    gradientTimer = Timer.periodic(const Duration(milliseconds: 16), (timer) {
      setState(() {
        progress += 16 / transitionDuration.inMilliseconds;

        if (progress >= 1.0) {
          progress = 0;
          currentGradient = nextGradient;
          nextGradient = _getRandomGradient(_getTimeOfDay());
        }
      });
    });
  }

  void _startStarAnimation() {
    starTimer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      if (_isNightTime()) {
        setState(() {
          final random = Random();
          stars = stars.map((star) {
            return Star(
              x: star.x,
              y: star.y,
              size: star.size,
              opacity: star.opacity,
              twinkleOpacity: random.nextDouble() * 0.7 + 0.3,
            );
          }).toList();
        });
      }
    });
  }

  TimeOfDay _getTimeOfDay() {
    final hour = DateTime.now().hour;
    if (hour >= 5 && hour < 9) return TimeOfDay.sunrise;
    if (hour >= 9 && hour < 17) return TimeOfDay.day;
    if (hour >= 17 && hour < 19) return TimeOfDay.sunset;
    return TimeOfDay.night;
  }

  bool _isNightTime() {
    final hour = DateTime.now().hour;
    return hour >= 19 || hour < 6;
  }

  List<Color> _getRandomGradient(TimeOfDay timeOfDay) {
    final random = Random();

    switch (timeOfDay) {
      case TimeOfDay.sunrise:
        return [
          Color.fromRGBO(
            150 + random.nextInt(50),
            100 + random.nextInt(50),
            120 + random.nextInt(50),
            1,
          ),
          Color.fromRGBO(
            200 + random.nextInt(40),
            150 + random.nextInt(50),
            150 + random.nextInt(50),
            1,
          ),
        ];
      case TimeOfDay.day:
        return [
          Color.fromRGBO(
            180 + random.nextInt(60),
            180 + random.nextInt(60),
            190 + random.nextInt(60),
            1,
          ),
          Color.fromRGBO(
            200 + random.nextInt(50),
            200 + random.nextInt(50),
            210 + random.nextInt(45),
            1,
          ),
        ];
      case TimeOfDay.sunset:
        return [
          Color.fromRGBO(
            160 + random.nextInt(50),
            90 + random.nextInt(50),
            130 + random.nextInt(50),
            1,
          ),
          Color.fromRGBO(
            200 + random.nextInt(30),
            120 + random.nextInt(50),
            140 + random.nextInt(50),
            1,
          ),
        ];
      case TimeOfDay.night:
        return [
          Color.fromRGBO(
            15 + random.nextInt(35),
            15 + random.nextInt(35),
            25 + random.nextInt(35),
            1,
          ),
          Color.fromRGBO(
            25 + random.nextInt(35),
            25 + random.nextInt(35),
            35 + random.nextInt(35),
            1,
          ),
        ];
    }
  }

  List<Color> get interpolatedGradient {
    return List.generate(currentGradient.length, (index) {
      return Color.lerp(
        currentGradient[index],
        nextGradient[index],
        progress,
      )!;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Gradient background
        Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: interpolatedGradient,
            ),
          ),
        ),

        // Stars (night time only)
        if (_isNightTime())
          ...stars.map((star) {
            return Positioned(
              left: star.x * MediaQuery.of(context).size.width,
              top: star.y * MediaQuery.of(context).size.height,
              child: Opacity(
                opacity: star.twinkleOpacity,
                child: Container(
                  width: star.size,
                  height: star.size,
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            );
          }),

        // Content
        widget.child,
      ],
    );
  }
}

class Star {
  final double x; // 0.0 to 1.0 (percentage of screen width)
  final double y; // 0.0 to 1.0 (percentage of screen height)
  final double size;
  final double opacity;
  final double twinkleOpacity;

  Star({
    required this.x,
    required this.y,
    required this.size,
    required this.opacity,
    required this.twinkleOpacity,
  });
}
