import React from 'react'
import { View, Text } from 'react-native'
import { WeatherData } from '../../lib/types'
import { styles } from './styles'

interface MobileWeatherCardProps {
  weather: WeatherData
}

export function MobileWeatherCard({ weather }: MobileWeatherCardProps) {
  const getWeatherIcon = (condition: string) => {
    const iconMap: { [key: string]: string } = {
      'clear': '☀️',
      'sunny': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'fog': '🌫️'
    }
    return iconMap[condition.toLowerCase()] || '🌤️'
  }

  const getFarmingAdvice = () => {
    const temp = weather.current.temperature
    const condition = weather.current.condition.toLowerCase()
    
    if (condition.includes('rain')) {
      return { text: 'Good for natural watering', color: '#3b82f6' }
    }
    if (temp > 35) {
      return { text: 'Very hot! Ensure irrigation', color: '#ef4444' }
    }
    if (temp < 5) {
      return { text: 'Risk of frost', color: '#3b82f6' }
    }
    if (condition.includes('sunny') && temp >= 20 && temp <= 30) {
      return { text: 'Perfect farming conditions!', color: '#10b981' }
    }
    return { text: 'Good conditions', color: '#10b981' }
  }

  const advice = getFarmingAdvice()

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherHeader}>
        <Text style={styles.cardTitle}>Weather</Text>
        <Text style={[styles.xpProgress, { fontSize: 12 }]}>
          Updated {new Date(weather.current.timestamp).toLocaleTimeString()}
        </Text>
      </View>

      <Text style={styles.weatherIcon}>
        {getWeatherIcon(weather.current.condition)}
      </Text>
      
      <Text style={styles.weatherTemp}>
        {Math.round(weather.current.temperature)}°C
      </Text>
      
      <Text style={styles.weatherCondition}>
        {weather.current.condition}
      </Text>

      <View style={styles.weatherDetails}>
        <View style={styles.weatherDetail}>
          <Text style={styles.weatherDetailValue}>
            {weather.current.humidity}%
          </Text>
          <Text style={styles.weatherDetailLabel}>Humidity</Text>
        </View>
        
        <View style={styles.weatherDetail}>
          <Text style={styles.weatherDetailValue}>
            {weather.current.wind_speed} km/h
          </Text>
          <Text style={styles.weatherDetailLabel}>Wind</Text>
        </View>
      </View>

      {/* Farming Advice */}
      <View style={{
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center'
      }}>
        <Text style={{ fontSize: 20, marginRight: 8 }}>🌱</Text>
        <Text style={[styles.weatherDetailLabel, { color: advice.color, flex: 1 }]}>
          {advice.text}
        </Text>
      </View>
    </View>
  )
}