import React from 'react'
import { View, Text } from 'react-native'
import { styles } from './styles'

interface MobileXPCardProps {
  currentLevel: number
  currentXP: number
  xpToNextLevel: number
}

export function MobileXPCard({ currentLevel, currentXP, xpToNextLevel }: MobileXPCardProps) {
  const xpForCurrentLevel = currentXP - (currentLevel > 1 ? getXPForLevel(currentLevel - 1) : 0)
  const xpNeededForCurrentLevel = getXPForLevel(currentLevel) - (currentLevel > 1 ? getXPForLevel(currentLevel - 1) : 0)
  const progressPercentage = (xpForCurrentLevel / xpNeededForCurrentLevel) * 100

  function getXPForLevel(level: number): number {
    return level * 100
  }

  const getLevelTitle = (level: number) => {
    if (level >= 50) return 'Master Farmer'
    if (level >= 25) return 'Expert Farmer'
    if (level >= 10) return 'Skilled Farmer'
    if (level >= 5) return 'Experienced Farmer'
    return 'Novice Farmer'
  }

  return (
    <View style={styles.xpCard}>
      <View style={styles.xpHeader}>
        <View>
          <Text style={styles.xpLevel}>Level {currentLevel}</Text>
          <Text style={styles.xpProgress}>{getLevelTitle(currentLevel)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.xpLevel}>{currentXP.toLocaleString()}</Text>
          <Text style={styles.xpProgress}>Total XP</Text>
        </View>
      </View>

      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill,
            { width: `${Math.min(progressPercentage, 100)}%` }
          ]} 
        />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
        <Text style={[styles.xpProgress, { fontSize: 12 }]}>
          {xpForCurrentLevel.toLocaleString()} / {xpNeededForCurrentLevel.toLocaleString()}
        </Text>
        <Text style={[styles.xpProgress, { fontSize: 12 }]}>
          {xpToNextLevel.toLocaleString()} XP to next level
        </Text>
      </View>
    </View>
  )
}