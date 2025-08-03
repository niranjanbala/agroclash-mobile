'use client'

import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '../../lib/services/factory'
import { Plot, Crop, WeatherData, XPLog } from '../../lib/types'
import { MobilePlotCard } from './MobilePlotCard'
import { MobileCropCard } from './MobileCropCard'
import { MobileWeatherCard } from './MobileWeatherCard'
import { MobileXPCard } from './MobileXPCard'
import { MobileQuickActions } from './MobileQuickActions'
import { MobileStatsGrid } from './MobileStatsGrid'
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

export function MobileFarmDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalPlots: 0,
    totalCrops: 0,
    activeCrops: 0,
    readyToHarvest: 0,
    totalXP: 0,
    currentLevel: 1,
    xpToNextLevel: 100
  })
  const [plots, setPlots] = useState<Plot[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [recentActivity, setRecentActivity] = useState<XPLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const plotService = ServiceFactory.getPlotService()
  const cropService = ServiceFactory.getCropService()
  const weatherService = ServiceFactory.getWeatherService()
  const xpService = ServiceFactory.getXPService()

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      // Load all dashboard data
      const [
        userPlots,
        userCrops,
        weatherData,
        xpLogs,
        levelProgress
      ] = await Promise.allSettled([
        plotService.getPlots(user.id),
        getAllUserCrops(user.id),
        getWeatherForUser(),
        xpService.getXPLogs(user.id, 5),
        xpService.getLevelProgress(user.id)
      ])

      // Process data
      const plotsData = userPlots.status === 'fulfilled' ? userPlots.value : []
      const cropsData = userCrops.status === 'fulfilled' ? userCrops.value : []
      const weatherResult = weatherData.status === 'fulfilled' ? weatherData.value : null
      const activityData = xpLogs.status === 'fulfilled' ? xpLogs.value : []
      const progressData = levelProgress.status === 'fulfilled' ? levelProgress.value : {
        currentLevel: 1,
        currentXP: 0,
        xpToNextLevel: 100
      }

      setPlots(plotsData)
      setCrops(cropsData)
      setWeather(weatherResult)
      setRecentActivity(activityData)

      // Calculate stats
      const activeCrops = cropsData.filter(crop => 
        ['planted', 'growing', 'flowering'].includes(crop.status)
      )
      const readyToHarvest = cropsData.filter(crop => crop.status === 'ready')

      setStats({
        totalPlots: plotsData.length,
        totalCrops: cropsData.length,
        activeCrops: activeCrops.length,
        readyToHarvest: readyToHarvest.length,
        totalXP: progressData.currentXP,
        currentLevel: progressData.currentLevel,
        xpToNextLevel: progressData.xpToNextLevel
      })

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const getAllUserCrops = async (userId: string): Promise<Crop[]> => {
    const userPlots = await plotService.getPlots(userId)
    const allCrops = await Promise.all(
      userPlots.map(plot => cropService.getCrops(plot.id))
    )
    return allCrops.flat()
  }

  const getWeatherForUser = async (): Promise<WeatherData | null> => {
    if (!user?.location) return null
    
    try {
      return await weatherService.getForecast({
        latitude: user.location.latitude,
        longitude: user.location.longitude
      })
    } catch (error) {
      console.error('Error loading weather:', error)
      return null
    }
  }

  const handleRefresh = () => {
    loadDashboardData(true)
  }

  const handleQuickAction = (action: string, data?: any) => {
    // Handle quick actions - navigate to appropriate screens
    console.log('Quick action:', action, data)
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.welcomeTitle}>Welcome to AgroClash</Text>
          <Text style={styles.welcomeSubtitle}>Sign in to start managing your farm</Text>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading your farm...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>AgroClash</Text>
              <Text style={styles.headerSubtitle}>Welcome back, {user.name}!</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>Lv {stats.currentLevel}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <MobileStatsGrid stats={stats} />

        {/* Quick Actions */}
        <MobileQuickActions 
          stats={stats}
          onAction={handleQuickAction}
        />

        {/* XP Progress */}
        <MobileXPCard 
          currentLevel={stats.currentLevel}
          currentXP={stats.totalXP}
          xpToNextLevel={stats.xpToNextLevel}
        />

        {/* Weather Card */}
        {weather && (
          <MobileWeatherCard weather={weather} />
        )}

        {/* Plots Overview */}
        {plots.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your Plots</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {plots.slice(0, 3).map(plot => (
                <MobilePlotCard 
                  key={plot.id} 
                  plot={plot} 
                  onPress={() => handleQuickAction('view_plot', { plotId: plot.id })}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Active Crops */}
        {crops.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active Crops</Text>
              <TouchableOpacity>
                <Text style={styles.sectionAction}>View All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.cropGrid}>
              {crops.filter(crop => 
                ['planted', 'growing', 'flowering', 'ready'].includes(crop.status)
              ).slice(0, 4).map(crop => (
                <MobileCropCard 
                  key={crop.id} 
                  crop={crop} 
                  onPress={() => handleQuickAction('view_crop', { cropId: crop.id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
            </View>
            <View style={styles.activityList}>
              {recentActivity.map(activity => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Text style={styles.activityEmoji}>
                      {getActivityIcon(activity.action_type)}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>
                      {formatActivityDescription(activity)}
                    </Text>
                    <Text style={styles.activityTime}>
                      {getTimeAgo(activity.created_at)}
                    </Text>
                  </View>
                  <View style={styles.activityXP}>
                    <Text style={styles.xpText}>+{activity.xp_awarded}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Empty State */}
        {plots.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🌱</Text>
            <Text style={styles.emptyStateTitle}>Start Your Farm</Text>
            <Text style={styles.emptyStateText}>
              Create your first plot to begin your farming journey!
            </Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => handleQuickAction('add_plot')}
            >
              <Text style={styles.primaryButtonText}>Create First Plot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

// Helper functions
const getActivityIcon = (actionType: string) => {
  const iconMap: { [key: string]: string } = {
    'plant_crop': '🌱',
    'harvest_crop': '🌾',
    'win_pest_battle': '⚔️',
    'complete_quest': '🎯',
    'market_trade': '💰',
    'level_up': '⭐',
    'daily_login': '📅'
  }
  return iconMap[actionType] || '📝'
}

const formatActivityDescription = (activity: XPLog) => {
  const descriptions: { [key: string]: string } = {
    'plant_crop': 'Planted a new crop',
    'harvest_crop': 'Harvested crops',
    'win_pest_battle': 'Won a pest battle',
    'complete_quest': 'Completed a quest',
    'market_trade': 'Made a market trade',
    'level_up': 'Leveled up!',
    'daily_login': 'Daily login bonus'
  }
  return activity.description || descriptions[activity.action_type] || 'Performed an action'
}

const getTimeAgo = (timestamp: string) => {
  const now = new Date()
  const activityTime = new Date(timestamp)
  const diffMs = now.getTime() - activityTime.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return new Date(timestamp).toLocaleDateString()
}