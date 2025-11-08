package com.iskr.clock.data.repository

import com.iskr.clock.data.database.RadioStationDao
import com.iskr.clock.data.model.RadioStation
import kotlinx.coroutines.flow.Flow

class RadioStationRepository(private val radioStationDao: RadioStationDao) {

    fun getAllStations(): Flow<List<RadioStation>> = radioStationDao.getAllStations()

    suspend fun getStationById(id: String): RadioStation? = radioStationDao.getStationById(id)

    fun getCustomStations(): Flow<List<RadioStation>> = radioStationDao.getCustomStations()

    suspend fun insertStation(station: RadioStation) = radioStationDao.insertStation(station)

    suspend fun insertStations(stations: List<RadioStation>) = radioStationDao.insertStations(stations)

    suspend fun updateStation(station: RadioStation) = radioStationDao.updateStation(station)

    suspend fun deleteStation(station: RadioStation) = radioStationDao.deleteStation(station)

    suspend fun deleteStationById(id: String) = radioStationDao.deleteStationById(id)
}
