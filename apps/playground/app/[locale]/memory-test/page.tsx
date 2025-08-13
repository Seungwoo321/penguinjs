'use client'

import React, { useEffect, useState } from 'react'
import { memoryMonitor } from '@/games/callstack-library/services/MemoryMonitor'
import { useMemoryMonitor } from '@/games/callstack-library/hooks/useMemoryMonitor'

export default function MemoryTestPage() {
  const { memoryStats, forceCleanup, isMemoryPressure } = useMemoryMonitor()
  const [largeData, setLargeData] = useState<any[]>([])
  const [forceUpdate, setForceUpdate] = useState(0)

  // Force memory monitor to start with lower thresholds for testing
  useEffect(() => {
    memoryMonitor.configure({
      enableMonitoring: true,
      leakThreshold: 20, // Lower threshold for testing (20MB)
      cleanupInterval: 2000, // Check every 2 seconds
      maxComponentAge: 10000 // 10 seconds
    })

    // Log when memory updates
    const unsubscribe = memoryMonitor.subscribe((stats) => {
      console.log('📊 Memory Update:', {
        usedMB: stats.usedJSHeapSize ? (stats.usedJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A',
        totalMB: stats.totalJSHeapSize ? (stats.totalJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A',
        limitMB: stats.jsHeapSizeLimit ? (stats.jsHeapSizeLimit / (1024 * 1024)).toFixed(2) : 'N/A',
        leakDetected: stats.leakDetected,
        componentCount: stats.componentCount
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Function to create memory pressure
  const createMemoryPressure = () => {
    console.log('🚀 Creating memory pressure...')
    const newData = []
    for (let i = 0; i < 100000; i++) {
      newData.push({
        id: Math.random(),
        data: new Array(100).fill('x'.repeat(100)),
        timestamp: Date.now()
      })
    }
    setLargeData(prev => [...prev, ...newData])
    setForceUpdate(prev => prev + 1)
  }

  // Function to clear memory
  const clearMemory = () => {
    console.log('🧹 Clearing memory...')
    setLargeData([])
    forceCleanup()
    // Try to trigger garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc()
      console.log('🗑️ Manual GC triggered')
    }
  }

  const usedMB = memoryStats.usedJSHeapSize ? (memoryStats.usedJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A'
  const totalMB = memoryStats.totalJSHeapSize ? (memoryStats.totalJSHeapSize / (1024 * 1024)).toFixed(2) : 'N/A'
  const limitMB = memoryStats.jsHeapSizeLimit ? (memoryStats.jsHeapSizeLimit / (1024 * 1024)).toFixed(2) : 'N/A'

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Memory Monitor Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Memory Stats */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Memory Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Used Heap:</span>
              <span className="font-mono">{usedMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Heap:</span>
              <span className="font-mono">{totalMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Heap Limit:</span>
              <span className="font-mono">{limitMB} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Component Count:</span>
              <span className="font-mono">{memoryStats.componentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Leak Detected:</span>
              <span className={memoryStats.leakDetected ? 'text-red-500' : 'text-green-500'}>
                {memoryStats.leakDetected ? '⚠️ YES' : '✅ NO'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Memory Pressure:</span>
              <span className={isMemoryPressure() ? 'text-red-500' : 'text-green-500'}>
                {isMemoryPressure() ? '⚠️ HIGH' : '✅ OK'}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            <button
              onClick={createMemoryPressure}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              Create Memory Pressure
            </button>
            <button
              onClick={clearMemory}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              Clear Memory
            </button>
            <div className="text-sm text-gray-400">
              <p>Large data arrays: {largeData.length}</p>
              <p>Updates: {forceUpdate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-gray-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-300">
          <li>Open browser DevTools (F12) and go to Console tab</li>
          <li>Click "Create Memory Pressure" multiple times to increase memory usage</li>
          <li>Watch for console warnings when memory exceeds threshold (20MB for testing)</li>
          <li>Memory stats update every 2 seconds</li>
          <li>Click "Clear Memory" to release memory</li>
        </ol>
        <div className="mt-4 p-3 bg-yellow-900 rounded">
          <p className="text-yellow-300 text-sm">
            Note: Chrome memory API requires the page to be served over HTTPS or localhost.
            If you don't see memory values, make sure you're on http://localhost:4000
          </p>
        </div>
      </div>
    </div>
  )
}