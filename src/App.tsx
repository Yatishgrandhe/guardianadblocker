"use client"

import { useState, useEffect } from "react"

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
      chrome.storage.local.get(["isGlobalBlockingEnabled"], (result) => {
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
    <div className="app-container">
      {/* Background Gradients/Shapes for "Insane" Styling */}
      <div className="background-shapes">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
      </div>

      <header className="header">
        <div className="header-left">
          <ShieldCheck className="header-icon" />
          <h1 className="header-title">
            Guardian
          </h1>
        </div>
        <div className="header-buttons">
          <button
            onClick={() => setView("popup")}
            className={`header-button ${view === "popup" ? "active" : ""}`}
            aria-label="Ad Blocker Toggle"
          >
            <ShieldCheck className="header-button-icon" />
          </button>
          <button
            onClick={() => setView("statistics")}
            className={`header-button statistics ${view === "statistics" ? "active" : ""}`}
            aria-label="Statistics"
          >
            <BarChart className="header-button-icon" />
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="card">
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
        </div>
      </main>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Guardian. All rights reserved.
      </footer>
    </div>
  )
}
