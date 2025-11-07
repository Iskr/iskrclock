//
//  RadioStationModel.swift
//  IskrClockiOS
//

import Foundation

enum StationType: String, Codable {
    case radio
    case youtube
    case local
    case classic
}

struct RadioStation: Identifiable, Codable, Equatable {
    let id: String
    var name: String
    var type: StationType
    var url: String?
    var isPlaylist: Bool
    var videoIds: [String]
    var isLocalFile: Bool
    var fileCount: Int
    var isBuiltIn: Bool

    init(id: String, name: String, type: StationType, url: String? = nil, isPlaylist: Bool = false, videoIds: [String] = [], isLocalFile: Bool = false, fileCount: Int = 0, isBuiltIn: Bool = false) {
        self.id = id
        self.name = name
        self.type = type
        self.url = url
        self.isPlaylist = isPlaylist
        self.videoIds = videoIds
        self.isLocalFile = isLocalFile
        self.fileCount = fileCount
        self.isBuiltIn = isBuiltIn
    }

    var icon: String {
        switch type {
        case .radio:
            return "📻"
        case .youtube:
            return "📺"
        case .local:
            return "💿"
        case .classic:
            return "🔔"
        }
    }

    static func == (lhs: RadioStation, rhs: RadioStation) -> Bool {
        lhs.id == rhs.id
    }
}

// Built-in radio stations
extension RadioStation {
    static let builtInStations: [RadioStation] = [
        RadioStation(id: "classic", name: "Classic Alarm Sound", type: .classic, isBuiltIn: true),
        RadioStation(id: "bbc-radio-1", name: "BBC Radio 1", type: .radio, url: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", isBuiltIn: true),
        RadioStation(id: "npr", name: "NPR (USA)", type: .radio, url: "https://npr-ice.streamguys1.com/live.mp3", isBuiltIn: true),
        RadioStation(id: "ninja-chill", name: "NINJA CHILL 24/7", type: .youtube, url: "5qap5aO4i9A", isBuiltIn: true),
        RadioStation(id: "nts-1", name: "NTS Radio 1 (London)", type: .radio, url: "https://stream-relay-geo.ntslive.net/stream", isBuiltIn: true),
        RadioStation(id: "nts-2", name: "NTS Radio 2 (London)", type: .radio, url: "https://stream-relay-geo.ntslive.net/stream2", isBuiltIn: true),
        RadioStation(id: "rinse-france", name: "Rinse France (Paris)", type: .radio, url: "https://rinse.fr/player/french_pls.php", isBuiltIn: true),
        RadioStation(id: "fip", name: "FIP Radio (Paris)", type: .radio, url: "https://icecast.radiofrance.fr/fip-midfi.mp3", isBuiltIn: true),
        RadioStation(id: "europa-plus", name: "Европа Плюс", type: .radio, url: "http://ep128.hostingradio.ru:8030/ep128", isBuiltIn: true),
        RadioStation(id: "energy", name: "Radio Energy", type: .radio, url: "https://pub0302.101.ru:8443/stream/air/aac/64/99", isBuiltIn: true),
        RadioStation(id: "love-radio", name: "Love Radio", type: .radio, url: "http://nashe1.hostingradio.ru/love-128.mp3", isBuiltIn: true),
        RadioStation(id: "hit-fm", name: "Hit FM", type: .radio, url: "http://online.hitfm.ru/hitfm", isBuiltIn: true),
        RadioStation(id: "monte-carlo", name: "Monte Carlo", type: .radio, url: "https://montecarlo.hostingradio.ru/montecarlo96.aacp", isBuiltIn: true),
        RadioStation(id: "studio-21", name: "STUDIO 21", type: .radio, url: "http://studio21.ru:8001/radio128", isBuiltIn: true),
        RadioStation(id: "metro", name: "Радио МЕТРО", type: .radio, url: "http://stream.m-1.fm/radioMetro/aacp64", isBuiltIn: true),
        RadioStation(id: "hermitage", name: "Эрмитаж FM 90.1", type: .radio, url: "https://icecast-hermitage.cdnvideo.ru/hermitage_aac", isBuiltIn: true)
    ]
}
