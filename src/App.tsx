import React, { useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider, useAuth } from './components/auth/AuthProvider'
import { MobileFarmDashboard } from './components/dashboard/MobileFarmDashboard'
import { MobileNavigation } from './components/navigation/MobileNavigation'
import { MobileSignIn } from './components/auth/MobileSignIn'
import { MobilePlotManager } from './components/plots/MobilePlotManager'
import { MobileCropManager } from './components/crops/MobileCropManager'
import { MobilePestBattle } from './components/battle/MobilePestBattle'
import { MobileMarketplace } from './components/market/MobileMarketplace'
import { View, StyleSheet } from 'react-native'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [notifications, setNotifications] = useState(0)

  useEffect(() => {
    // Load notification count
    loadNotifications()
  }, [user])

  const loadNotifications = async () => {
    // Mock notification count - in real app, fetch from service
    setNotifications(3)
  }

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'dashboard':
        return <MobileFarmDashboard />
      case 'plots':
        return <MobilePlotManager />
      case 'crops':
        return <MobileCropManager />
      case 'battle':
        return <MobilePestBattle />
      case 'market':
        return <MobileMarketplace />
      default:
        return <MobileFarmDashboard />
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        {/* Loading screen would go here */}
      </View>
    )
  }

  if (!user) {
    return <MobileSignIn />
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderActiveScreen()}
      </View>
      <MobileNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        notifications={notifications}
      />
    </View>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc'
  },
  content: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  }
})