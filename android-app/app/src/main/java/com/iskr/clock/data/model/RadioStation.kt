package com.iskr.clock.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class StationType {
    BUILT_IN,
    LOCAL_FILE,
    RADIO_STREAM,
    YOUTUBE
}

@Entity(tableName = "radio_stations")
data class RadioStation(
    @PrimaryKey
    val id: String,
    val name: String,
    val type: StationType,
    val url: String,
    val isCustom: Boolean = false,
    val localFilePath: String? = null,
    val youtubePlaylistVideos: List<String> = emptyList()
)

object BuiltInStations {
    val stations = listOf(
        RadioStation(
            id = "classic_beep",
            name = "🔔 Классический сигнал",
            type = StationType.BUILT_IN,
            url = "built_in://beep"
        ),
        RadioStation(
            id = "bbc_radio1",
            name = "BBC Radio 1",
            type = StationType.RADIO_STREAM,
            url = "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one"
        ),
        RadioStation(
            id = "npr",
            name = "NPR",
            type = StationType.RADIO_STREAM,
            url = "https://npr-ice.streamguys1.com/live.mp3"
        ),
        RadioStation(
            id = "ninja_chill",
            name = "NINJA CHILL 24/7",
            type = StationType.RADIO_STREAM,
            url = "https://www.youtube.com/watch?v=lP26UCnoH9s"
        ),
        RadioStation(
            id = "nts1",
            name = "NTS Radio 1",
            type = StationType.RADIO_STREAM,
            url = "https://stream-relay-geo.ntslive.net/stream"
        ),
        RadioStation(
            id = "nts2",
            name = "NTS Radio 2",
            type = StationType.RADIO_STREAM,
            url = "https://stream-relay-geo.ntslive.net/stream2"
        ),
        RadioStation(
            id = "rinse_fr",
            name = "Rinse France",
            type = StationType.RADIO_STREAM,
            url = "https://rinse.fr/player/rinse_fr.mp3"
        ),
        RadioStation(
            id = "rinse_uk",
            name = "Rinse UK",
            type = StationType.RADIO_STREAM,
            url = "https://rinse.fr/player/rinse_uk.mp3"
        ),
        RadioStation(
            id = "fip",
            name = "FIP Radio",
            type = StationType.RADIO_STREAM,
            url = "https://stream.radiofrance.fr/fip/fip.m3u8"
        ),
        RadioStation(
            id = "europa_plus",
            name = "Европа Плюс",
            type = StationType.RADIO_STREAM,
            url = "https://ep128.hostingradio.ru:8030/ep128"
        ),
        RadioStation(
            id = "energy",
            name = "Radio Energy",
            type = StationType.RADIO_STREAM,
            url = "https://pub0302.101.ru:8443/stream/air/aac/64/99"
        ),
        RadioStation(
            id = "love_radio",
            name = "Love Radio",
            type = StationType.RADIO_STREAM,
            url = "https://nashe1.hostingradio.ru/love-128.mp3"
        ),
        RadioStation(
            id = "hit_fm",
            name = "Hit FM",
            type = StationType.RADIO_STREAM,
            url = "https://hitfm.hostingradio.ru/hitfm96.aacp"
        ),
        RadioStation(
            id = "monte_carlo",
            name = "Monte Carlo",
            type = StationType.RADIO_STREAM,
            url = "https://mcradio.hostingradio.ru/montecarlo96.aacp"
        ),
        RadioStation(
            id = "studio21",
            name = "STUDIO 21",
            type = StationType.RADIO_STREAM,
            url = "https://radio21.hostingradio.ru/radio21128.mp3"
        ),
        RadioStation(
            id = "metro",
            name = "Радио МЕТРО",
            type = StationType.RADIO_STREAM,
            url = "https://stream.radiovolna.su/play/radioromb/64"
        ),
        RadioStation(
            id = "ermitazh",
            name = "Эрмитаж FM",
            type = StationType.RADIO_STREAM,
            url = "https://icecast.newradio.it:80/ermitazh.aac"
        )
    )
}
