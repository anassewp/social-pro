'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface NetworkInformation {
  // Basic connectivity
  isOnline: boolean
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g'
  
  // Performance metrics
  downlink: number // Mbps
  rtt: number // milliseconds
  downlinkMax?: number // theoretical maximum downlink
  
  // User preferences
  saveData: boolean
  
  // Additional info
  connectionType?: string
  raw?: any
}

export interface NetworkQuality {
  level: 'excellent' | 'good' | 'fair' | 'poor' | 'offline' | 'unknown'
  score: number // 0-100
  latency: 'low' | 'medium' | 'high' | 'very_high'
  bandwidth: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  reliability: 'poor' | 'fair' | 'good' | 'excellent'
}

export interface NetworkEvents {
  onConnect?: () => void
  onDisconnect?: () => void
  onTypeChange?: (type: NetworkInformation['effectiveType']) => void
  onQualityChange?: (quality: NetworkQuality) => void
  onSlowConnection?: () => void
  onFastConnection?: () => void
}

export function useNetworkDetection(options: NetworkEvents = {}) {
  const [networkInfo, setNetworkInfo] = useState<NetworkInformation>({
    isOnline: navigator.onLine,
    effectiveType: '4g',
    downlink: 10,
    rtt: 100,
    saveData: false,
  })

  const [quality, setQuality] = useState<NetworkQuality>({
    level: 'unknown',
    score: 0,
    latency: 'medium',
    bandwidth: 'medium',
    reliability: 'good',
  })

  const previousInfoRef = useRef<NetworkInformation>(networkInfo)
  const qualityCheckIntervalRef = useRef<NodeJS.Timeout>()

  // Calculate network quality
  const calculateQuality = useCallback((info: NetworkInformation): NetworkQuality => {
    if (!info.isOnline) {
      return {
        level: 'offline',
        score: 0,
        latency: 'very_high',
        bandwidth: 'very_low',
        reliability: 'poor',
      }
    }

    // Calculate bandwidth score (0-25 points)
    let bandwidthScore = 0
    let bandwidthLevel: NetworkQuality['bandwidth']
    
    if (info.downlink >= 50) {
      bandwidthScore = 25
      bandwidthLevel = 'very_high'
    } else if (info.downlink >= 25) {
      bandwidthScore = 20
      bandwidthLevel = 'high'
    } else if (info.downlink >= 10) {
      bandwidthScore = 15
      bandwidthLevel = 'medium'
    } else if (info.downlink >= 1) {
      bandwidthScore = 10
      bandwidthLevel = 'low'
    } else {
      bandwidthScore = 5
      bandwidthLevel = 'very_low'
    }

    // Calculate latency score (0-25 points)
    let latencyScore = 0
    let latencyLevel: NetworkQuality['latency']
    
    if (info.rtt <= 50) {
      latencyScore = 25
      latencyLevel = 'low'
    } else if (info.rtt <= 100) {
      latencyScore = 20
      latencyLevel = 'low'
    } else if (info.rtt <= 200) {
      latencyScore = 15
      latencyLevel = 'medium'
    } else if (info.rtt <= 500) {
      latencyScore = 10
      latencyLevel = 'high'
    } else {
      latencyScore = 5
      latencyLevel = 'very_high'
    }

    // Calculate connection type score (0-25 points)
    let typeScore = 0
    switch (info.effectiveType) {
      case '5g':
        typeScore = 25
        break
      case '4g':
        typeScore = 20
        break
      case '3g':
        typeScore = 15
        break
      case '2g':
        typeScore = 10
        break
      case 'slow-2g':
        typeScore = 5
        break
      default:
        typeScore = 15 // Unknown gets medium score
    }

    // Calculate reliability score (0-25 points)
    let reliabilityScore = 20 // Default good
    let reliabilityLevel: NetworkQuality['reliability'] = 'good'
    
    if (info.saveData) {
      reliabilityScore -= 5
      reliabilityLevel = 'fair'
    }
    
    if (info.effectiveType === 'slow-2g' || info.effectiveType === '2g') {
      reliabilityScore -= 8
      reliabilityLevel = 'fair'
    }

    if (info.rtt > 500) {
      reliabilityScore -= 7
      reliabilityLevel = 'poor'
    }

    const totalScore = bandwidthScore + latencyScore + typeScore + reliabilityScore

    // Determine overall level
    let level: NetworkQuality['level']
    if (totalScore >= 90) {
      level = 'excellent'
    } else if (totalScore >= 70) {
      level = 'good'
    } else if (totalScore >= 50) {
      level = 'fair'
    } else if (totalScore > 0) {
      level = 'poor'
    } else {
      level = 'unknown'
    }

    return {
      level,
      score: totalScore,
      latency: latencyLevel,
      bandwidth: bandwidthLevel,
      reliability: reliabilityLevel,
    }
  }, [])

  // Update network information
  const updateNetworkInfo = useCallback(() => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection

    const newInfo: NetworkInformation = {
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType || '4g',
      downlink: connection?.downlink || 10,
      rtt: connection?.rtt || 100,
      downlinkMax: connection?.downlinkMax,
      saveData: connection?.saveData || false,
      connectionType: connection?.type,
      raw: connection,
    }

    setNetworkInfo(newInfo)

    // Calculate and update quality
    const newQuality = calculateQuality(newInfo)
    setQuality(newQuality)

    // Detect changes and trigger events
    const prevInfo = previousInfoRef.current
    
    // Online/offline changes
    if (prevInfo.isOnline !== newInfo.isOnline) {
      if (newInfo.isOnline) {
        options.onConnect?.()
      } else {
        options.onDisconnect?.()
      }
    }

    // Connection type changes
    if (prevInfo.effectiveType !== newInfo.effectiveType) {
      options.onTypeChange?.(newInfo.effectiveType)
      
      if (['slow-2g', '2g'].includes(newInfo.effectiveType)) {
        options.onSlowConnection?.()
      } else if (['4g', '5g'].includes(newInfo.effectiveType)) {
        options.onFastConnection?.()
      }
    }

    // Quality changes
    if (prevInfo.isOnline && newInfo.isOnline) {
      const prevQuality = calculateQuality(prevInfo)
      if (prevQuality.level !== newQuality.level) {
        options.onQualityChange?.(newQuality)
      }
    }

    previousInfoRef.current = newInfo
  }, [calculateQuality, options])

  // Initialize network detection
  useEffect(() => {
    updateNetworkInfo()

    const handleOnline = updateNetworkInfo
    const handleOffline = updateNetworkInfo

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    const connection = (navigator as any).connection
    if (connection) {
      connection.addEventListener('change', updateNetworkInfo)
    }

    // Set up periodic quality checks
    qualityCheckIntervalRef.current = setInterval(updateNetworkInfo, 30000) // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkInfo)
      }
      
      if (qualityCheckIntervalRef.current) {
        clearInterval(qualityCheckIntervalRef.current)
      }
    }
  }, [updateNetworkInfo])

  // Manual refresh
  const refresh = useCallback(() => {
    updateNetworkInfo()
  }, [updateNetworkInfo])

  // Utility functions
  const isSlowConnection = useCallback(() => {
    return ['slow-2g', '2g'].includes(networkInfo.effectiveType) || 
           networkInfo.downlink < 1 ||
           networkInfo.rtt > 500
  }, [networkInfo])

  const isFastConnection = useCallback(() => {
    return ['4g', '5g'].includes(networkInfo.effectiveType) && 
           networkInfo.downlink > 5 &&
           networkInfo.rtt < 100
  }, [networkInfo])

  const shouldOptimizeForBandwidth = useCallback(() => {
    return networkInfo.saveData || 
           isSlowConnection() || 
           networkInfo.downlink < 2
  }, [networkInfo, isSlowConnection])

  const shouldUseHighQuality = useCallback(() => {
    return !networkInfo.saveData && 
           isFastConnection() && 
           networkInfo.downlink > 10
  }, [networkInfo, isFastConnection])

  const getRecommendedSettings = useCallback(() => {
    if (!networkInfo.isOnline) {
      return {
        imageQuality: 'low' as const,
        videoQuality: 'low' as const,
        preloadImages: false,
        enableAnimations: false,
        concurrentRequests: 1,
        timeout: 5000,
      }
    }

    const settings = {
      imageQuality: networkInfo.saveData || isSlowConnection() ? 'low' as const : 'high' as const,
      videoQuality: networkInfo.saveData || isSlowConnection() ? 'low' as const : 'high' as const,
      preloadImages: !shouldOptimizeForBandwidth(),
      enableAnimations: !shouldOptimizeForBandwidth(),
      concurrentRequests: isFastConnection() ? 6 : isSlowConnection() ? 2 : 4,
      timeout: networkInfo.rtt > 200 ? 15000 : 8000,
    }

    return settings
  }, [networkInfo, isSlowConnection, isFastConnection, shouldOptimizeForBandwidth])

  return {
    networkInfo,
    quality,
    
    // Utility functions
    isSlowConnection,
    isFastConnection,
    shouldOptimizeForBandwidth,
    shouldUseHighQuality,
    getRecommendedSettings,
    refresh,
    
    // Computed flags
    isOnline: networkInfo.isOnline,
    connectionType: networkInfo.effectiveType,
    connectionSpeed: networkInfo.downlink,
    latency: networkInfo.rtt,
    saveData: networkInfo.saveData,
  }
}