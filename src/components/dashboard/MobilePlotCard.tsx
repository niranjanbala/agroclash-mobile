import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Plot } from '../../lib/types'
import { styles } from './styles'

interface MobilePlotCardProps {
  plot: Plot
  onPress: () => void
}

export function MobilePlotCard({ plot, onPress }: MobilePlotCardProps) {
  const getPlotStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'
      case 'inactive': return '#6b7280'
      case 'maintenance': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  const getPlotIcon = (type: string) => {
    const iconMap: { [key: string]: string } = {
      'vegetable': '🥕',
      'grain': '🌾',
      'fruit': '🍎',
      'herb': '🌿'
    }
    return iconMap[type] || '🌱'
  }

  return (
    <TouchableOpacity style={styles.plotCard} onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={styles.quickActionIcon}>
          {getPlotIcon(plot.plot_type)}
        </Text>
        <View style={{
          backgroundColor: getPlotStatusColor(plot.status),
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12
        }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
            {plot.status}
          </Text>
        </View>
      </View>

      <Text style={styles.quickActionText} numberOfLines={1}>
        {plot.name}
      </Text>
      
      <Text style={styles.quickActionSubtext} numberOfLines={2}>
        {plot.location.address}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={[styles.quickActionSubtext, { fontSize: 10 }]}>
          {plot.size_sqm} m²
        </Text>
        <Text style={[styles.quickActionSubtext, { fontSize: 10 }]}>
          {plot.plot_type}
        </Text>
      </View>
    </TouchableOpacity>
  )
}