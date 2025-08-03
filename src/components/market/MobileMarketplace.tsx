import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '../auth/AuthProvider'
import { ServiceFactory } from '../../lib/services/factory'
import { MarketListing } from '../../lib/types'
import { styles } from '../dashboard/styles'

interface MarketPrice {
  crop_type: string
  current_price: number
  price_change_24h: number
  volume_24h: number
}

export function MobileMarketplace() {
  const { user } = useAuth()
  const [listings, setListings] = useState<MarketListing[]>([])
  const [prices, setPrices] = useState<MarketPrice[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'prices'>('buy')

  const marketService = ServiceFactory.getMarketService()

  useEffect(() => {
    if (user) {
      loadMarketData()
    }
  }, [user])

  const loadMarketData = async (isRefresh = false) => {
    if (!user) return

    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [marketListings, marketPrices] = await Promise.all([
        marketService.getListings({ limit: 20 }),
        marketService.getMarketPrices()
      ])

      setListings(marketListings)
      setPrices(marketPrices)
    } catch (error) {
      console.error('Error loading market data:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadMarketData(true)
  }

  const handleCreateListing = () => {
    console.log('Create listing pressed')
    // Navigate to create listing screen
  }

  const handleListingPress = (listing: MarketListing) => {
    console.log('Listing pressed:', listing.id)
    // Navigate to listing details
  }

  const getCropIcon = (cropType: string) => {
    const iconMap: { [key: string]: string } = {
      'tomato': '🍅',
      'corn': '🌽',
      'wheat': '🌾',
      'rice': '🌾',
      'potato': '🥔',
      'carrot': '🥕',
      'lettuce': '🥬',
      'onion': '🧅'
    }
    return iconMap[cropType.toLowerCase()] || '🌱'
  }

  const getTrendIcon = (change: number) => {
    if (change > 0) return '📈'
    if (change < 0) return '📉'
    return '➡️'
  }

  const getTrendColor = (change: number) => {
    if (change > 0) return '#10b981'
    if (change < 0) return '#ef4444'
    return '#6b7280'
  }

  const renderBuyTab = () => (
    <View style={{ gap: 12 }}>
      {listings.filter(l => l.listing_type === 'sell').map(listing => (
        <TouchableOpacity
          key={listing.id}
          style={styles.card}
          onPress={() => handleListingPress(listing)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>
                {getCropIcon(listing.crop_type)}
              </Text>
              <View>
                <Text style={styles.quickActionText}>
                  {listing.crop_type} ({listing.quantity} units)
                </Text>
                <Text style={styles.quickActionSubtext}>
                  by {listing.seller_name}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.quickActionText, { color: '#10b981' }]}>
                ${listing.price_per_unit.toFixed(2)}
              </Text>
              <Text style={styles.quickActionSubtext}>
                per unit
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderSellTab = () => (
    <View style={{ gap: 12 }}>
      {listings.filter(l => l.listing_type === 'buy').map(listing => (
        <TouchableOpacity
          key={listing.id}
          style={styles.card}
          onPress={() => handleListingPress(listing)}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>
                {getCropIcon(listing.crop_type)}
              </Text>
              <View>
                <Text style={styles.quickActionText}>
                  Buying {listing.crop_type} ({listing.quantity} units)
                </Text>
                <Text style={styles.quickActionSubtext}>
                  by {listing.seller_name}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.quickActionText, { color: '#3b82f6' }]}>
                ${listing.price_per_unit.toFixed(2)}
              </Text>
              <Text style={styles.quickActionSubtext}>
                per unit
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderPricesTab = () => (
    <View style={{ gap: 12 }}>
      {prices.map(price => (
        <View key={price.crop_type} style={styles.card}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 32 }}>
                {getCropIcon(price.crop_type)}
              </Text>
              <View>
                <Text style={styles.quickActionText}>
                  {price.crop_type}
                </Text>
                <Text style={styles.quickActionSubtext}>
                  Vol: {price.volume_24h.toLocaleString()}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.quickActionText}>
                  ${price.current_price.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 16 }}>
                  {getTrendIcon(price.price_change_24h)}
                </Text>
              </View>
              <Text style={[styles.quickActionSubtext, { color: getTrendColor(price.price_change_24h) }]}>
                {price.price_change_24h > 0 ? '+' : ''}{price.price_change_24h.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <Text style={styles.headerSubtitle}>Buy and sell crops</Text>
          </View>
          <TouchableOpacity onPress={handleCreateListing}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>+ List</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 16, gap: 12 }}>
        {[
          { key: 'buy', label: 'Buy Crops' },
          { key: 'sell', label: 'Sell Orders' },
          { key: 'prices', label: 'Prices' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: activeTab === tab.key ? '#10b981' : 'white',
              borderWidth: 1,
              borderColor: activeTab === tab.key ? '#10b981' : '#e5e7eb',
              flex: 1
            }}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={{
              color: activeTab === tab.key ? 'white' : '#6b7280',
              fontWeight: '600',
              fontSize: 14,
              textAlign: 'center'
            }}>
              {tab.label}
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
            <Text style={styles.loadingText}>Loading marketplace...</Text>
          </View>
        ) : (
          <View style={{ padding: 20 }}>
            {activeTab === 'buy' && renderBuyTab()}
            {activeTab === 'sell' && renderSellTab()}
            {activeTab === 'prices' && renderPricesTab()}

            {/* Empty State */}
            {listings.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>💰</Text>
                <Text style={styles.emptyStateTitle}>No Listings Available</Text>
                <Text style={styles.emptyStateText}>
                  Be the first to create a listing in the marketplace!
                </Text>
                <TouchableOpacity style={styles.primaryButton} onPress={handleCreateListing}>
                  <Text style={styles.primaryButtonText}>Create Listing</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}