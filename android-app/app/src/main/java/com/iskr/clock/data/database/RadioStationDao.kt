package com.iskr.clock.data.database

import androidx.room.*
import com.iskr.clock.data.model.RadioStation
import kotlinx.coroutines.flow.Flow

@Dao
interface RadioStationDao {
    @Query("SELECT * FROM radio_stations ORDER BY isCustom DESC, name")
    fun getAllStations(): Flow<List<RadioStation>>

    @Query("SELECT * FROM radio_stations WHERE id = :id")
    suspend fun getStationById(id: String): RadioStation?

    @Query("SELECT * FROM radio_stations WHERE isCustom = 1")
    fun getCustomStations(): Flow<List<RadioStation>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStation(station: RadioStation)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStations(stations: List<RadioStation>)

    @Update
    suspend fun updateStation(station: RadioStation)

    @Delete
    suspend fun deleteStation(station: RadioStation)

    @Query("DELETE FROM radio_stations WHERE id = :id")
    suspend fun deleteStationById(id: String)
}
