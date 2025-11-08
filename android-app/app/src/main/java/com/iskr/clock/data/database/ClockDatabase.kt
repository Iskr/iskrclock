package com.iskr.clock.data.database

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverter
import androidx.room.TypeConverters
import com.iskr.clock.data.model.AlarmData
import com.iskr.clock.data.model.RadioStation
import com.iskr.clock.data.model.StationType

class Converters {
    @TypeConverter
    fun fromIntSet(value: Set<Int>): String {
        return value.joinToString(",")
    }

    @TypeConverter
    fun toIntSet(value: String): Set<Int> {
        return if (value.isEmpty()) emptySet()
        else value.split(",").map { it.toInt() }.toSet()
    }

    @TypeConverter
    fun fromStringList(value: List<String>): String {
        return value.joinToString("|||")
    }

    @TypeConverter
    fun toStringList(value: String): List<String> {
        return if (value.isEmpty()) emptyList()
        else value.split("|||")
    }

    @TypeConverter
    fun fromStationType(value: StationType): String {
        return value.name
    }

    @TypeConverter
    fun toStationType(value: String): StationType {
        return StationType.valueOf(value)
    }
}

@Database(
    entities = [AlarmData::class, RadioStation::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class ClockDatabase : RoomDatabase() {
    abstract fun alarmDao(): AlarmDao
    abstract fun radioStationDao(): RadioStationDao

    companion object {
        @Volatile
        private var INSTANCE: ClockDatabase? = null

        fun getDatabase(context: Context): ClockDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    ClockDatabase::class.java,
                    "iskr_clock_database"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
