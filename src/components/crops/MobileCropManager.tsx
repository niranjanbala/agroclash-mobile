import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '../../lib/services/factory'
import { Crop, Plot } from '../../lib/types'
import { MobileCropCard } from '../dashboard/MobileCropCard'
import { styles } from '../dashboard/styles'

export function MobileCropManager() {
  const { user } = useAuth()
  const [crops, setCrops] = useState<Crop[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<'all' | 'active' | 'ready'>('all')

  const plotService = ServiceFactory.getPlotService()
  const cropService = ServiceFactory.getCropService()

  useEffect(() => {
    if (user) {
      loadCrops()
    }
  }, [user])

  const loadCrops = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Get all user plots first
      const userPlots = await plotService.getPlots(user.id)
      
      // Get crops for all plots
      const allCrops = await Promise.all(
        userPlots.map(plot => cropService.getCrops(plot.id))
      )
      
      setCrops(allCrops.flat())
    } catch (error) {
      console.error('Error loading crops:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadCrops(true)
  }

  const handleCropPress = (crop: Crop) => {
    console.log('Crop pressed:', crop.id)
    // Navigate to crop details
  }

  const handleAddCrop = () => {
    console.log('Add crop pressed')
    // Navigate to add crop screen
  }

  const getFilteredCrops = () => {
    switch (filter) {
      case 'active':
        return crops.filter(crop => 
          ['planted', 'growing', 'flowering'].includes(crop.status)
        )
      case 'ready':
        return crops.filter(crop => crop.status === 'ready')
      default:
        return crops
    }
  }

  const filteredCrops = getFilteredCrops()

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Crops</Text>
            <Text style={styles.headerSubtitle}>Track your growing crops</Text>
          </View>
          <TouchableOpacity onPress={handleAddCrop}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>+ Plant</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
        {[
          { key: 'all', label: 'All', count: crops.length },
          { key: 'active', label: 'Active', count: crops.filter(c => ['planted', 'growing', 'flowering'].includes(c.status)).length },
          { key: 'ready', label: 'Ready', count: crops.filter(c => c.status === 'ready').length }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: filter === tab.key ? '#10b981' : 'white',
              borderWidth: 1,
              borderColor: filter === tab.key ? '#10b981' : '#e5e7eb'
            }}
            onPress={() => setFilter(tab.key as any)}
          >
            <Text style={{
              color: filter === tab.key ? 'white' : '#6b7280',
              fontWeight: '600',
              fontSize: 14
            }}>
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
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
            <Text style={styles.loadingText}>Loading crops...</Text>
          </View>
        ) : filteredCrops.length > 0 ? (
          <View style={styles.cropGrid}>
            {filteredCrops.map(crop => (
              <MobileCropCard
                key={crop.id}
                crop={crop}
                onPress={() => handleCropPress(crop)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🌱</Text>
            <Text style={styles.emptyStateTitle}>
              {filter === 'ready' ? 'No Crops Ready' : 
               filter === 'active' ? 'No Active Crops' : 'No Crops Yet'}
            </Text>
            <Text style={styles.emptyStateText}>
              {filter === 'ready' ? 'Check back later when your crops are ready to harvest!' :
               filter === 'active' ? 'Plant some crops to see them growing here!' :
               'Start planting crops to build your farm!'}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity style={styles.primaryButton} onPress={handleAddCrop}>
                <Text style={styles.primaryButtonText}>Plant First Crop</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}