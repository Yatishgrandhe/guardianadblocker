"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ShieldCheck, BarChart } from "lucide-react"
import PopupView from "./components/popup-view"
import StatisticsView from "./components/statistics-view"

// The Chrome extension API is available at runtime; this keeps TS happy.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const chrome: any

export default function App() {
  const [view, setView] = useState<"popup" | "statistics">("popup")
  const [isGlobalBlockingEnabled, setIsGlobalBlockingEnabled] = useState(true)
  const [isSiteBlockingEnabled, setIsSiteBlockingEnabled] = useState(true)
  const [currentTabUrl, setCurrentTabUrl] = useState<string | null>(null)
  const [currentSiteBlockedCount, setCurrentSiteBlockedCount] = useState(0)

  useEffect(() => {
    // Load initial global state from storage
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["isGlobalBlockingEnabled"], (result: { isGlobalBlockingEnabled?: boolean }) => {
        if (result.isGlobalBlockingEnabled !== undefined) {
          setIsGlobalBlockingEnabled(result.isGlobalBlockingEnabled)
        }
      })
    }

    // Get current tab URL and per-site blocking state
    if (typeof chrome !== "undefined" && chrome.tabs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
        const url = tabs[0]?.url || null
        setCurrentTabUrl(url)
        if (url) {
          const domain = new URL(url).hostname
          chrome.storage.local.get([`siteBlockingEnabled_${domain}`], (result: { [key: string]: boolean }) => {
            if (result[`siteBlockingEnabled_${domain}`] !== undefined) {
              setIsSiteBlockingEnabled(result[`siteBlockingEnabled_${domain}`])
            } else {
              setIsSiteBlockingEnabled(true) // Default to enabled if not set
            }
          })
          // Request current site's blocked count from background
          chrome.runtime.sendMessage(
            { type: "GET_CURRENT_SITE_BLOCKED_COUNT", domain },
            (response: { count: number }) => {
              if (response && response.count !== undefined) {
                setCurrentSiteBlockedCount(response.count)
              }
            },
          )
        }
      })

      // Listen for updates from background script for current site's blocked count
      const messageListener = (message: any) => {
        if (
          message.type === "UPDATE_CURRENT_SITE_BLOCKED_COUNT" &&
          message.domain === new URL(currentTabUrl || "").hostname
        ) {
          setCurrentSiteBlockedCount(message.count)
        }
      }
      chrome.runtime.onMessage.addListener(messageListener)
      return () => chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [currentTabUrl]) // Re-run if currentTabUrl changes

  const handleToggleGlobalBlocking = async (enabled: boolean) => {
    setIsGlobalBlockingEnabled(enabled)
    if (typeof chrome !== "undefined" && chrome.runtime) {
      chrome.runtime.sendMessage({ type: "TOGGLE_GLOBAL_BLOCKING", enabled })
    }
  }

  const handleToggleSiteBlocking = async (enabled: boolean) => {
    setIsSiteBlockingEnabled(enabled)
    if (currentTabUrl && typeof chrome !== "undefined" && chrome.runtime) {
      const domain = new URL(currentTabUrl).hostname
      chrome.runtime.sendMessage({ type: "TOGGLE_SITE_BLOCKING", domain, enabled })
    }
  }

  return (
    <div className="w-[320px] h-[480px] flex flex-col bg-gradient-to-br from-gray-900 to-black text-white font-sans relative overflow-hidden">
      {/* Background Gradients/Shapes for "Insane" Styling */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-purple-600 rounded-full mix-blend-screen filter blur-xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-green-500 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-blue-600 rounded-full mix-blend-screen filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative z-10 p-4 flex items-center justify-between border-b border-gray-700/50 shadow-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-7 w-7 text-green-400 drop-shadow-lg" />
          <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500 tracking-tight">
            Guardian
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("popup")}
            className={`text-gray-400 hover:text-green-400 transition-colors ${view === "popup" ? "text-green-400 scale-110" : ""}`}
            aria-label="Ad Blocker Toggle"
          >
            <ShieldCheck className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setView("statistics")}
            className={`text-gray-400 hover:text-purple-400 transition-colors ${view === "statistics" ? "text-purple-400 scale-110" : ""}`}
            aria-label="Statistics"
          >
            <BarChart className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 flex-1 p-4 overflow-y-auto">
        <Card className="bg-gray-800/70 backdrop-blur-sm border border-gray-700/50 shadow-xl p-4">
          {view === "popup" ? (
            <PopupView
              isGlobalBlockingEnabled={isGlobalBlockingEnabled}
              onToggleGlobalBlocking={handleToggleGlobalBlocking}
              isSiteBlockingEnabled={isSiteBlockingEnabled}
              onToggleSiteBlocking={handleToggleSiteBlocking}
              currentTabUrl={currentTabUrl}
              currentSiteBlockedCount={currentSiteBlockedCount}
            />
          ) : (
            <StatisticsView />
          )}
        </Card>
      </main>

      <footer className="relative z-10 p-3 text-center text-xs text-gray-500 border-t border-gray-700/50">
        &copy; {new Date().getFullYear()} Guardian. All rights reserved.
      </footer>

      {/* Tailwind CSS Keyframes for "Insane" Styling */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
