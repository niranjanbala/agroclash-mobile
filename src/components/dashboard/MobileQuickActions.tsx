import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
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

interface MobileQuickActionsProps {
  stats: DashboardStats
  onAction: (action: string, data?: any) => void
}

export function MobileQuickActions({ stats, onAction }: MobileQuickActionsProps) {
  const actions = [
    {
      id: 'add_plot',
      title: 'Add Plot',
      subtitle: 'Create new plot',
      icon: '📍',
      enabled: true
    },
    {
      id: 'plant_crop',
      title: 'Plant Crop',
      subtitle: 'Add crops',
      icon: '🌱',
      enabled: stats.totalPlots > 0
    },
    {
      id: 'harvest_ready',
      title: 'Harvest',
      subtitle: `${stats.readyToHarvest} ready`,
      icon: '🌾',
      enabled: stats.readyToHarvest > 0
    },
    {
      id: 'pest_battle',
      title: 'Battle',
      subtitle: 'Fight pests',
      icon: '⚔️',
      enabled: stats.activeCrops > 0
    },
    {
      id: 'market_trade',
      title: 'Market',
      subtitle: 'Trade crops',
      icon: '💰',
      enabled: true
    },
    {
      id: 'weather_check',
      title: 'Weather',
      subtitle: 'Check forecast',
      icon: '🌤️',
      enabled: true
    }
  ]

  return (
    <View style={styles.quickActionsGrid}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.id}
          style={[
            styles.quickActionButton,
            !action.enabled && { opacity: 0.5 }
          ]}
          onPress={() => action.enabled && onAction(action.id)}
          disabled={!action.enabled}
        >
          <Text style={styles.quickActionIcon}>{action.icon}</Text>
          <Text style={styles.quickActionText}>{action.title}</Text>
          <Text style={styles.quickActionSubtext}>{action.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}