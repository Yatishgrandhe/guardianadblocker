"use client"

import { ShieldOff, ShieldCheck, Globe } from "lucide-react"

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
  const currentDomain = currentTabUrl ? new URL(currentTabUrl).hostname : "Unknown Site"

  return (
    <>
      <div className="card-header">
        <h2 className="card-title">
          Ad Blocking
        </h2>
        <p className="card-description">
          Toggle Guardian to protect your browsing experience.
        </p>
      </div>
      <div className="card-content">
        <div className="shield-container">
          {isGlobalBlockingEnabled ? (
            <ShieldCheck className="shield-icon enabled" />
          ) : (
            <ShieldOff className="shield-icon disabled" />
          )}
          <div
            className={`shield-ping ${isGlobalBlockingEnabled ? "enabled" : "disabled"}`}
          ></div>
        </div>

        <div className="toggle-container">
          <div className="toggle-item">
            <label htmlFor="global-ad-blocking-toggle" className="toggle-label">
              Global Blocking
            </label>
            <div 
              className={`switch ${isGlobalBlockingEnabled ? "checked" : ""}`}
              onClick={() => onToggleGlobalBlocking(!isGlobalBlockingEnabled)}
            >
              <div className="switch-thumb"></div>
            </div>
          </div>

          <div className="toggle-item">
            <label
              htmlFor="site-ad-blocking-toggle"
              className="toggle-label"
            >
              <Globe className="toggle-label-icon" />
              <span className="toggle-label-text">{currentDomain}</span>
            </label>
            <div 
              className={`switch ${isSiteBlockingEnabled ? "checked blue" : ""} ${!isGlobalBlockingEnabled ? "disabled" : ""}`}
              onClick={() => isGlobalBlockingEnabled && onToggleSiteBlocking(!isSiteBlockingEnabled)}
            >
              <div className="switch-thumb"></div>
            </div>
          </div>
        </div>

        <div className="stats-display">
          <p className="stats-label">Ads Blocked on this page:</p>
          <p className="stats-count">{currentSiteBlockedCount}</p>
        </div>
      </div>
    </>
  )
}
