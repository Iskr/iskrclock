import 'package:hive/hive.dart';

part 'radio_station.g.dart';

enum StationType {
  radio,
  youtube,
  local,
  classic,
}

@HiveType(typeId: 1)
class RadioStation extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String type; // 'radio', 'youtube', 'local', 'classic'

  @HiveField(3)
  String? url;

  @HiveField(4)
  bool isPlaylist;

  @HiveField(5)
  List<String> videoIds;

  @HiveField(6)
  bool isLocalFile;

  @HiveField(7)
  int fileCount;

  @HiveField(8)
  bool isBuiltIn;

  RadioStation({
    required this.id,
    required this.name,
    required this.type,
    this.url,
    this.isPlaylist = false,
    this.videoIds = const [],
    this.isLocalFile = false,
    this.fileCount = 0,
    this.isBuiltIn = false,
  });

  String get icon {
    switch (type) {
      case 'radio':
        return '📻';
      case 'youtube':
        return '📺';
      case 'local':
        return '💿';
      case 'classic':
        return '🔔';
      default:
        return '📻';
    }
  }

  StationType get stationType {
    switch (type) {
      case 'youtube':
        return StationType.youtube;
      case 'local':
        return StationType.local;
      case 'classic':
        return StationType.classic;
      default:
        return StationType.radio;
    }
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'url': url,
      'isPlaylist': isPlaylist,
      'videoIds': videoIds,
      'isLocalFile': isLocalFile,
      'fileCount': fileCount,
      'isBuiltIn': isBuiltIn,
    };
  }

  factory RadioStation.fromJson(Map<String, dynamic> json) {
    return RadioStation(
      id: json['id'],
      name: json['name'],
      type: json['type'],
      url: json['url'],
      isPlaylist: json['isPlaylist'] ?? false,
      videoIds: List<String>.from(json['videoIds'] ?? []),
      isLocalFile: json['isLocalFile'] ?? false,
      fileCount: json['fileCount'] ?? 0,
      isBuiltIn: json['isBuiltIn'] ?? false,
    );
  }

  // Built-in radio stations
  static List<RadioStation> get builtInStations => [
        RadioStation(
          id: 'classic',
          name: 'Classic Alarm Sound',
          type: 'classic',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'bbc-radio-1',
          name: 'BBC Radio 1',
          type: 'radio',
          url: 'https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'npr',
          name: 'NPR (USA)',
          type: 'radio',
          url: 'https://npr-ice.streamguys1.com/live.mp3',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'ninja-chill',
          name: 'NINJA CHILL 24/7',
          type: 'youtube',
          url: '5qap5aO4i9A',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'nts-1',
          name: 'NTS Radio 1 (London)',
          type: 'radio',
          url: 'https://stream-relay-geo.ntslive.net/stream',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'nts-2',
          name: 'NTS Radio 2 (London)',
          type: 'radio',
          url: 'https://stream-relay-geo.ntslive.net/stream2',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'rinse-france',
          name: 'Rinse France (Paris)',
          type: 'radio',
          url: 'https://rinse.fr/player/french_pls.php',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'fip',
          name: 'FIP Radio (Paris)',
          type: 'radio',
          url: 'https://icecast.radiofrance.fr/fip-midfi.mp3',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'europa-plus',
          name: 'Европа Плюс',
          type: 'radio',
          url: 'http://ep128.hostingradio.ru:8030/ep128',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'energy',
          name: 'Radio Energy',
          type: 'radio',
          url: 'https://pub0302.101.ru:8443/stream/air/aac/64/99',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'love-radio',
          name: 'Love Radio',
          type: 'radio',
          url: 'http://nashe1.hostingradio.ru/love-128.mp3',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'hit-fm',
          name: 'Hit FM',
          type: 'radio',
          url: 'http://online.hitfm.ru/hitfm',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'monte-carlo',
          name: 'Monte Carlo',
          type: 'radio',
          url: 'https://montecarlo.hostingradio.ru/montecarlo96.aacp',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'studio-21',
          name: 'STUDIO 21',
          type: 'radio',
          url: 'http://studio21.ru:8001/radio128',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'metro',
          name: 'Радио МЕТРО',
          type: 'radio',
          url: 'http://stream.m-1.fm/radioMetro/aacp64',
          isBuiltIn: true,
        ),
        RadioStation(
          id: 'hermitage',
          name: 'Эрмитаж FM 90.1',
          type: 'radio',
          url: 'https://icecast-hermitage.cdnvideo.ru/hermitage_aac',
          isBuiltIn: true,
        ),
      ];
}
