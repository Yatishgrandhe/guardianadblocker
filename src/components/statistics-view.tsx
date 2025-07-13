"use client"

import { useEffect, useState } from "react"
import { Globe, EyeOff, VideoOff, PopcornIcon as Popover, Ban } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// The Chrome extension API is available at runtime; this keeps TS happy.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

interface AdStats {
  totalBlocked: number
  blockedByType: {
    banner: number
    video: number
    popup: number
    redirect: number
    other: number
  }
  blockedByDomain: { [key: string]: number }
  lastUpdated?: number
}

export default function StatisticsView() {
  const [stats, setStats] = useState<AdStats>({
    totalBlocked: 0,
    blockedByType: { banner: 0, video: 0, popup: 0, redirect: 0, other: 0 },
    blockedByDomain: {},
  })
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const loadStats = () => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        // Load from storage
        chrome.storage.local.get(["adStats"], (result: { adStats?: AdStats }) => {
          if (result.adStats) {
            setStats(result.adStats)
            if (result.adStats.lastUpdated) {
              setLastUpdated(new Date(result.adStats.lastUpdated).toLocaleString())
            }
          }
        })

        // Also request from background script
        chrome.runtime.sendMessage({ type: "GET_STATS" }, (response: { adStats?: AdStats }) => {
          if (response && response.adStats) {
            setStats(response.adStats)
            if (response.adStats.lastUpdated) {
              setLastUpdated(new Date(response.adStats.lastUpdated).toLocaleString())
            }
          }
        })
      }
    }

    // Load initial stats
    loadStats()

    // Listen for updates from background script
    const listener = (message: any) => {
      if (message.type === "UPDATE_STATS" && message.adStats) {
        setStats(message.adStats)
        if (message.adStats.lastUpdated) {
          setLastUpdated(new Date(message.adStats.lastUpdated).toLocaleString())
        }
      }
    }
    chrome.runtime.onMessage.addListener(listener)

    // Refresh stats every 5 seconds
    const interval = setInterval(loadStats, 5000)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
      clearInterval(interval)
    }
  }, [])

  const sortedDomains = Object.entries(stats.blockedByDomain)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5) // Show top 5 domains

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Blocking Statistics
        </h2>
        <p className="text-gray-300 text-sm">
          Insights into Guardian's protection.
        </p>
        {lastUpdated && (
          <p className="text-gray-400 text-xs mt-1">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      <Card className="bg-gray-700/50 border-gray-600/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <Ban className="h-8 w-8 text-red-400" />
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {stats.totalBlocked.toLocaleString()}
              </div>
              <p className="text-gray-300 text-sm">Total Ads Blocked</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-700/50 border-gray-600/50">
          <CardContent className="pt-6 text-center">
            <EyeOff className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-blue-400">
              {stats.blockedByType.banner.toLocaleString()}
            </div>
            <p className="text-gray-300 text-xs">Banners</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700/50 border-gray-600/50">
          <CardContent className="pt-6 text-center">
            <VideoOff className="h-6 w-6 text-orange-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-orange-400">
              {stats.blockedByType.video.toLocaleString()}
            </div>
            <p className="text-gray-300 text-xs">Videos</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700/50 border-gray-600/50">
          <CardContent className="pt-6 text-center">
            <Popover className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-yellow-400">
              {stats.blockedByType.popup.toLocaleString()}
            </div>
            <p className="text-gray-300 text-xs">Pop-ups</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-700/50 border-gray-600/50">
          <CardContent className="pt-6 text-center">
            <Globe className="h-6 w-6 text-pink-400 mx-auto mb-2" />
            <div className="text-xl font-bold text-pink-400">
              {stats.blockedByType.redirect.toLocaleString()}
            </div>
            <p className="text-gray-300 text-xs">Redirects</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-700/50 border-gray-600/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Top Blocked Domains
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedDomains.length > 0 ? (
            <div className="space-y-2">
              {sortedDomains.map(([domain, count]) => (
                <div key={domain} className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm truncate">{domain}</span>
                  <Badge variant="secondary" className="bg-gray-600 text-white">
                    {count.toLocaleString()}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm text-center">No domains blocked yet.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-gray-700/50 border-gray-600/50">
        <CardContent className="pt-6 text-center">
          <div className="text-gray-300 text-sm">
            <p>Other blocked elements: {stats.blockedByType.other.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
