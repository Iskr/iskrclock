import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/custom_stations_manager.dart';
import '../services/audio_player_service.dart';
import '../services/localization_service.dart';
import '../models/radio_station.dart';
import '../widgets/animated_background.dart';

class CustomStationsScreen extends StatefulWidget {
  const CustomStationsScreen({Key? key}) : super(key: key);

  @override
  State<CustomStationsScreen> createState() => _CustomStationsScreenState();
}

class _CustomStationsScreenState extends State<CustomStationsScreen> {
  bool showingAddStation = false;
  String newStationName = '';
  String newStationURL = '';
  String selectedStationType = 'radio';

  @override
  Widget build(BuildContext context) {
    final stationsManager = Provider.of<CustomStationsManager>(context);
    final audioPlayer = Provider.of<AudioPlayerService>(context);
    final localization = Provider.of<LocalizationService>(context);

    return AnimatedBackground(
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: Text(localization.t('custom_stations_title')),
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
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ElevatedButton.icon(
                  onPressed: () => setState(() => showingAddStation = !showingAddStation),
                  icon: const Icon(Icons.add_circle),
                  label: Text(localization.t('add_station')),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue,
                    minimumSize: const Size(double.infinity, 50),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                if (showingAddStation) ...[
                  const SizedBox(height: 20),
                  Container(
                    padding: const EdgeInsets.all(15),
                    decoration: BoxDecoration(color: Colors.black.withOpacity(0.3), borderRadius: BorderRadius.circular(15)),
                    child: Column(
                      children: [
                        TextField(
                          onChanged: (v) => newStationName = v,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: localization.t('station_name'),
                            labelStyle: const TextStyle(color: Colors.white70),
                            filled: true,
                            fillColor: Colors.white12,
                            border: const OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          value: selectedStationType,
                          dropdownColor: Colors.grey[800],
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: localization.t('station_type'),
                            labelStyle: const TextStyle(color: Colors.white70),
                            filled: true,
                            fillColor: Colors.white12,
                            border: const OutlineInputBorder(),
                          ),
                          items: [
                            DropdownMenuItem(value: 'radio', child: Text(localization.t('radio_stream'))),
                            DropdownMenuItem(value: 'youtube', child: Text(localization.t('youtube_video'))),
                          ],
                          onChanged: (v) => setState(() => selectedStationType = v ?? 'radio'),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          onChanged: (v) => newStationURL = v,
                          style: const TextStyle(color: Colors.white),
                          decoration: InputDecoration(
                            labelText: selectedStationType == 'radio' ? localization.t('stream_url') : localization.t('youtube_url'),
                            labelStyle: const TextStyle(color: Colors.white70),
                            filled: true,
                            fillColor: Colors.white12,
                            border: const OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => _addStation(stationsManager, localization),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.green, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                                child: Text(localization.t('add')),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: ElevatedButton(
                                onPressed: () => setState(() {
                                  showingAddStation = false;
                                  _resetForm();
                                }),
                                style: ElevatedButton.styleFrom(backgroundColor: Colors.red, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                                child: Text(localization.t('cancel')),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 30),
                Text(localization.t('built_in_stations'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 10),
                ...RadioStation.builtInStations.map((station) => _stationRow(station, audioPlayer, false, null)),
                if (stationsManager.customStations.isNotEmpty) ...[
                  const SizedBox(height: 30),
                  Text(localization.t('my_stations'), style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 10),
                  ...stationsManager.customStations.map((station) => _stationRow(station, audioPlayer, true, () => stationsManager.deleteStation(station))),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _stationRow(RadioStation station, AudioPlayerService audioPlayer, bool showDelete, VoidCallback? onDelete) {
    final isPlaying = audioPlayer.currentStation?.id == station.id;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.black.withOpacity(0.3), borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          Text(station.icon, style: const TextStyle(fontSize: 24)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(station.name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500, color: Colors.white)),
                if (station.url != null) Text(station.url!, style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.6)), maxLines: 1, overflow: TextOverflow.ellipsis),
              ],
            ),
          ),
          IconButton(
            onPressed: () => isPlaying ? audioPlayer.stop() : audioPlayer.play(station: station, fadeIn: false),
            icon: Icon(isPlaying ? Icons.pause_circle : Icons.play_circle, color: isPlaying ? Colors.orange : Colors.green, size: 32),
          ),
          if (showDelete && onDelete != null) IconButton(onPressed: onDelete, icon: const Icon(Icons.delete, color: Colors.red, size: 28)),
        ],
      ),
    );
  }

  void _addStation(CustomStationsManager manager, LocalizationService localization) {
    if (newStationName.isEmpty || newStationURL.isEmpty) return;
    final station = RadioStation(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      name: newStationName,
      type: selectedStationType,
      url: newStationURL,
      isBuiltIn: false,
    );
    manager.addStation(station);
    setState(() {
      showingAddStation = false;
      _resetForm();
    });
  }

  void _resetForm() {
    newStationName = '';
    newStationURL = '';
    selectedStationType = 'radio';
  }
}
