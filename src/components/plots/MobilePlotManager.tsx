import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '../../lib/services/factory'
import { Plot } from '../../lib/types'
import { MobilePlotCard } from '../dashboard/MobilePlotCard'
import { styles } from '../dashboard/styles'

export function MobilePlotManager() {
  const { user } = useAuth()
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const plotService = ServiceFactory.getPlotService()

  useEffect(() => {
    if (user) {
      loadPlots()
    }
  }, [user])

  const loadPlots = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const userPlots = await plotService.getPlots(user.id)
      setPlots(userPlots)
    } catch (error) {
      console.error('Error loading plots:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadPlots(true)
  }

  const handlePlotPress = (plot: Plot) => {
    console.log('Plot pressed:', plot.id)
    // Navigate to plot details
  }

  const handleAddPlot = () => {
    console.log('Add plot pressed')
    // Navigate to add plot screen
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>My Plots</Text>
            <Text style={styles.headerSubtitle}>Manage your farming plots</Text>
          </View>
          <TouchableOpacity onPress={handleAddPlot}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>+ Add</Text>
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
            <Text style={styles.loadingText}>Loading plots...</Text>
          </View>
        ) : plots.length > 0 ? (
          <View style={{ padding: 20, gap: 16 }}>
            {plots.map(plot => (
              <MobilePlotCard
                key={plot.id}
                plot={plot}
                onPress={() => handlePlotPress(plot)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📍</Text>
            <Text style={styles.emptyStateTitle}>No Plots Yet</Text>
            <Text style={styles.emptyStateText}>
              Create your first plot to start farming!
            </Text>
            <TouchableOpacity style={styles.primaryButton} onPress={handleAddPlot}>
              <Text style={styles.primaryButtonText}>Create First Plot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}