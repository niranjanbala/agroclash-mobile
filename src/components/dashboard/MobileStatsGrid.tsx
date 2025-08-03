import React from 'react'
import { View, Text } from 'react-native'
import { styles } from './styles'

interface DashboardStats {
  totalPlots: number
  totalCrops: number
  activeCrops: number
  readyToHarvest: number
  totalXP: number
  currentLevel: number
  xpToNextLevel: number
}

interface MobileStatsGridProps {
  stats: DashboardStats
}

export function MobileStatsGrid({ stats }: MobileStatsGridProps) {
  const statItems = [
    {
      label: 'Plots',
      value: stats.totalPlots,
      icon: '📍'
    },
    {
      label: 'Active Crops',
      value: stats.activeCrops,
      icon: '🌱'
    },
    {
      label: 'Ready to Harvest',
      value: stats.readyToHarvest,
      icon: '🌾'
    },
    {
      label: 'Total XP',
      value: stats.totalXP.toLocaleString(),
      icon: '⭐'
    }
  ]

  return (
    <View style={styles.statsGrid}>
      {statItems.map((item, index) => (
        <View key={index} style={styles.statCard}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  )
}