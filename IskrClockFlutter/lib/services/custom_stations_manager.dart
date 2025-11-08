import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import '../models/radio_station.dart';

class CustomStationsManager with ChangeNotifier {
  List<RadioStation> _customStations = [];

  List<RadioStation> get customStations => _customStations;

  CustomStationsManager() {
    _loadStations();
  }

  Future<void> _loadStations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stationsJson = prefs.getString('customStations');
      if (stationsJson != null) {
        final List<dynamic> decoded = json.decode(stationsJson);
        _customStations = decoded.map((json) => RadioStation.fromJson(json)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error loading custom stations: $e');
    }
  }

  Future<void> _saveStations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final encoded = json.encode(_customStations.map((s) => s.toJson()).toList());
      await prefs.setString('customStations', encoded);
    } catch (e) {
      print('Error saving custom stations: $e');
    }
  }

  Future<void> addStation(RadioStation station) async {
    _customStations.add(station);
    await _saveStations();
    notifyListeners();
  }

  Future<void> deleteStation(RadioStation station) async {
    _customStations.removeWhere((s) => s.id == station.id);
    await _saveStations();
    notifyListeners();
  }

  Future<void> updateStation(RadioStation station) async {
    final index = _customStations.indexWhere((s) => s.id == station.id);
    if (index != -1) {
      _customStations[index] = station;
      await _saveStations();
      notifyListeners();
    }
  }
}
