import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface NavigationItem {
  id: string
  title: string
  icon: string
  badge?: number
}

interface MobileNavigationProps {
  activeTab: string
  onTabPress: (tabId: string) => void
  notifications?: number
}

export function MobileNavigation({ activeTab, onTabPress, notifications = 0 }: MobileNavigationProps) {
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Farm',
      icon: '🏡'
    },
    {
      id: 'plots',
      title: 'Plots',
      icon: '📍'
    },
    {
      id: 'crops',
      title: 'Crops',
      icon: '🌱'
    },
    {
      id: 'battle',
      title: 'Battle',
      icon: '⚔️'
    },
    {
      id: 'market',
      title: 'Market',
      icon: '💰'
    }
  ]

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.navigation}>
        {navigationItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.navItem,
              activeTab === item.id && styles.activeNavItem
            ]}
            onPress={() => onTabPress(item.id)}
          >
            <View style={styles.navIconContainer}>
              <Text style={[
                styles.navIcon,
                activeTab === item.id && styles.activeNavIcon
              ]}>
                {item.icon}
              </Text>
              {item.id === 'dashboard' && notifications > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {notifications > 99 ? '99+' : notifications}
                  </Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.navTitle,
              activeTab === item.id && styles.activeNavTitle
            ]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  navigation: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4
  },
  activeNavItem: {
    // Active state styling handled by individual elements
  },
  navIconContainer: {
    position: 'relative',
    marginBottom: 4
  },
  navIcon: {
    fontSize: 24,
    opacity: 0.6
  },
  activeNavIcon: {
    opacity: 1
  },
  navTitle: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500'
  },
  activeNavTitle: {
    color: '#10b981',
    fontWeight: '600'
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold'
  }
})