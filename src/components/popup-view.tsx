"use client"

import { ShieldOff, ShieldCheck, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

// The Chrome extension API is available at runtime; this keeps TS happy.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

interface PopupViewProps {
  isGlobalBlockingEnabled: boolean
  onToggleGlobalBlocking: (enabled: boolean) => void
  isSiteBlockingEnabled: boolean
  onToggleSiteBlocking: (enabled: boolean) => void
  currentTabUrl: string | null
  currentSiteBlockedCount: number
}

export default function PopupView({
  isGlobalBlockingEnabled,
  onToggleGlobalBlocking,
  isSiteBlockingEnabled,
  onToggleSiteBlocking,
  currentTabUrl,
  currentSiteBlockedCount,
}: PopupViewProps) {
  const [localBlockedCount, setLocalBlockedCount] = useState(currentSiteBlockedCount)
  const currentDomain = currentTabUrl ? new URL(currentTabUrl).hostname : "Unknown Site"

  useEffect(() => {
    setLocalBlockedCount(currentSiteBlockedCount)
  }, [currentSiteBlockedCount])

  useEffect(() => {
    const loadCurrentSiteStats = () => {
      if (typeof chrome !== "undefined" && chrome.runtime && currentTabUrl) {
        const domain = new URL(currentTabUrl).hostname
        chrome.runtime.sendMessage(
          { type: "GET_CURRENT_SITE_BLOCKED_COUNT", domain },
          (response: { count: number }) => {
            if (response && response.count !== undefined) {
              setLocalBlockedCount(response.count)
            }
          }
        )
      }
    }

    // Load initial stats
    loadCurrentSiteStats()

    // Listen for updates
    const listener = (message: any) => {
      if (message.type === "UPDATE_CURRENT_SITE_BLOCKED_COUNT" && currentTabUrl) {
        const domain = new URL(currentTabUrl).hostname
        if (message.domain === domain) {
          setLocalBlockedCount(message.count)
        }
      }
    }
    chrome.runtime.onMessage.addListener(listener)

    // Refresh every 2 seconds
    const interval = setInterval(loadCurrentSiteStats, 2000)

    return () => {
      chrome.runtime.onMessage.removeListener(listener)
      clearInterval(interval)
    }
  }, [currentTabUrl])

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Ad Blocking
        </h2>
        <p className="text-gray-300 text-sm">
          Toggle Guardian to protect your browsing experience.
        </p>
      </div>

      <div className="flex justify-center mb-6">
        <div className="relative">
          {isGlobalBlockingEnabled ? (
            <ShieldCheck className="h-16 w-16 text-green-400 drop-shadow-lg" />
          ) : (
            <ShieldOff className="h-16 w-16 text-red-400 drop-shadow-lg" />
          )}
          <div
            className={`absolute inset-0 rounded-full ${
              isGlobalBlockingEnabled 
                ? "bg-green-400/20 animate-ping" 
                : "bg-red-400/20"
            }`}
          ></div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="global-blocking" className="text-white font-medium">
            Global Blocking
          </Label>
          <Switch
            id="global-blocking"
            checked={isGlobalBlockingEnabled}
            onCheckedChange={onToggleGlobalBlocking}
            className="data-[state=checked]:bg-green-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="site-blocking" className="text-white font-medium flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="text-sm">{currentDomain}</span>
          </Label>
          <Switch
            id="site-blocking"
            checked={isSiteBlockingEnabled}
            onCheckedChange={onToggleSiteBlocking}
            disabled={!isGlobalBlockingEnabled}
            className="data-[state=checked]:bg-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      <Card className="bg-gray-700/50 border-gray-600/50">
        <CardContent className="pt-6">
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-1">Ads Blocked on this page:</p>
            <p className="text-2xl font-bold text-green-400">{localBlockedCount.toLocaleString()}</p>
            <p className="text-gray-400 text-xs mt-1">Real-time updates</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
