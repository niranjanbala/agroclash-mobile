import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '../../lib/services/factory'
import { PestBattle, Crop } from '../../lib/types'
import { styles } from '../dashboard/styles'

export function MobilePestBattle() {
  const { user } = useAuth()
  const [battles, setBattles] = useState<PestBattle[]>([])
  const [activeCrops, setActiveCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const pestService = ServiceFactory.getPestService()
  const plotService = ServiceFactory.getPlotService()
  const cropService = ServiceFactory.getCropService()

  useEffect(() => {
    if (user) {
      loadBattleData()
    }
  }, [user])

  const loadBattleData = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Load user's active battles and crops
      const [userBattles, userPlots] = await Promise.all([
        pestService.getActiveBattles(user.id),
        plotService.getPlots(user.id)
      ])

      // Get all crops from user plots
      const allCrops = await Promise.all(
        userPlots.map(plot => cropService.getCrops(plot.id))
      )
      
      const crops = allCrops.flat().filter(crop => 
        ['planted', 'growing', 'flowering'].includes(crop.status)
      )

      setBattles(userBattles)
      setActiveCrops(crops)
    } catch (error) {
      console.error('Error loading battle data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadBattleData(true)
  }

  const handleStartBattle = () => {
    console.log('Start battle pressed')
    // Navigate to battle selection screen
  }

  const handleBattlePress = (battle: PestBattle) => {
    console.log('Battle pressed:', battle.id)
    // Navigate to active battle screen
  }

  const getPestIcon = (pestType: string) => {
    const iconMap: { [key: string]: string } = {
      'aphid': '🐛',
      'caterpillar': '🐛',
      'beetle': '🪲',
      'spider_mite': '🕷️',
      'whitefly': '🦟',
      'thrips': '🦗'
    }
    return iconMap[pestType] || '🐛'
  }

  const getBattleStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#f59e0b'
      case 'won': return '#10b981'
      case 'lost': return '#ef4444'
      default: return '#6b7280'
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Pest Battle</Text>
            <Text style={styles.headerSubtitle}>Defend your crops</Text>
          </View>
          <TouchableOpacity onPress={handleStartBattle}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>⚔️ Battle</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#10B981']}
            tintColor="#10B981"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading battles...</Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {/* Active Battles */}
            {battles.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Active Battles</Text>
                <View style={{ gap: 12, marginTop: 12 }}>
                  {battles.map(battle => (
                    <TouchableOpacity
                      key={battle.id}
                      style={styles.card}
                      onPress={() => handleBattlePress(battle)}
                    >
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                          <Text style={{ fontSize: 32 }}>
                            {getPestIcon(battle.pest_type)}
                          </Text>
                          <View>
                            <Text style={styles.quickActionText}>
                              {battle.pest_type.replace('_', ' ')} Attack
                            </Text>
                            <Text style={styles.quickActionSubtext}>
                              Level {battle.pest_level} • {battle.crop_name}
                            </Text>
                          </View>
                        </View>
                        <View style={{
                          backgroundColor: getBattleStatusColor(battle.status),
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 12
                        }}>
                          <Text style={{ color: 'white', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' }}>
                            {battle.status}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Vulnerable Crops */}
            {activeCrops.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vulnerable Crops</Text>
                <Text style={styles.quickActionSubtext}>
                  These crops may be attacked by pests
                </Text>
                <View style={styles.cropGrid}>
                  {activeCrops.slice(0, 4).map(crop => (
                    <View key={crop.id} style={styles.cropCard}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <Text style={{ fontSize: 24 }}>
                          {crop.name === 'tomato' ? '🍅' : 
                           crop.name === 'corn' ? '🌽' : 
                           crop.name === 'wheat' ? '🌾' : '🌱'}
                        </Text>
                        <Text style={{ fontSize: 16 }}>🛡️</Text>
                      </View>
                      <Text style={[styles.quickActionText, { fontSize: 13 }]} numberOfLines={1}>
                        {crop.name}
                      </Text>
                      <Text style={[styles.quickActionSubtext, { fontSize: 11 }]}>
                        {crop.health_status === 'healthy' ? 'Protected' : 'At Risk'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Battle Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Battle Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Battles Won</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Active Battles</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>85%</Text>
                  <Text style={styles.statLabel}>Win Rate</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>450</Text>
                  <Text style={styles.statLabel}>Battle XP</Text>
                </View>
              </View>
            </View>

            {/* Empty State */}
            {battles.length === 0 && activeCrops.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>⚔️</Text>
                <Text style={styles.emptyStateTitle}>No Active Battles</Text>
                <Text style={styles.emptyStateText}>
                  Plant some crops to start defending against pests!
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={handleStartBattle}>
                  <Text style={styles.primaryButtonText}>Start First Battle</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}