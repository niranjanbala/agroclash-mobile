import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Crop } from '../../lib/types'
import { styles } from './styles'

interface MobileCropCardProps {
  crop: Crop
  onPress: () => void
}

export function MobileCropCard({ crop, onPress }: MobileCropCardProps) {
  const getCropIcon = (name: string) => {
    const iconMap: { [key: string]: string } = {
      'tomato': '🍅',
      'corn': '🌽',
      'wheat': '🌾',
      'rice': '🌾',
      'potato': '🥔',
      'carrot': '🥕',
      'lettuce': '🥬',
      'onion': '🧅',
      'pepper': '🌶️',
      'cucumber': '🥒'
    }
    return iconMap[name.toLowerCase()] || '🌱'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planted': return '#3b82f6'
      case 'growing': return '#10b981'
      case 'flowering': return '#f59e0b'
      case 'ready': return '#ef4444'
      case 'harvested': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planted': return 'Planted'
      case 'growing': return 'Growing'
      case 'flowering': return 'Flowering'
      case 'ready': return 'Ready!'
      case 'harvested': return 'Harvested'
      default: return status
    }
  }

  const getDaysRemaining = () => {
    if (crop.status === 'ready') return 'Ready now!'
    if (crop.status === 'harvested') return 'Completed'
    
    const now = new Date()
    const harvestDate = new Date(crop.harvest_date)
    const diffTime = harvestDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 0) return 'Ready now!'
    if (diffDays === 1) return '1 day left'
    return `${diffDays} days left`
  }

  return (
    <TouchableOpacity style={styles.cropCard} onPress={onPress}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ fontSize: 24 }}>
          {getCropIcon(crop.name)}
        </Text>
        <View style={{
          backgroundColor: getStatusColor(crop.status),
          paddingHorizontal: 6,
          paddingVertical: 2,
          borderRadius: 8
        }}>
          <Text style={{ color: 'white', fontSize: 9, fontWeight: '600' }}>
            {getStatusText(crop.status)}
          </Text>
        </View>
      </View>

      <Text style={[styles.quickActionText, { fontSize: 13 }]} numberOfLines={1}>
        {crop.name}
      </Text>
      
      <Text style={[styles.quickActionSubtext, { fontSize: 11 }]}>
        {getDaysRemaining()}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={[styles.quickActionSubtext, { fontSize: 10 }]}>
          Qty: {crop.quantity}
        </Text>
        {crop.health_status && (
          <Text style={[styles.quickActionSubtext, { fontSize: 10 }]}>
            {crop.health_status === 'healthy' ? '💚' : 
             crop.health_status === 'sick' ? '💛' : '❤️'}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  )
}