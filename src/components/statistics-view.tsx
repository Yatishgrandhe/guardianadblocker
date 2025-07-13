"use client"

import { useEffect, useState } from "react"
import { Globe, EyeOff, VideoOff, PopcornIcon as Popover, Ban } from "lucide-react"
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
}

export default function StatisticsView() {
  const [stats, setStats] = useState<AdStats>({
    totalBlocked: 0,
    blockedByType: { banner: 0, video: 0, popup: 0, redirect: 0, other: 0 },
    blockedByDomain: {},
  })

  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.local.get(["adStats"], (result) => {
        if (result.adStats) {
          setStats(result.adStats)
        }
      })

      // Listen for updates from background script
      const listener = (message: any) => {
        if (message.type === "UPDATE_STATS" && message.adStats) {
          setStats(message.adStats)
        }
      }
      chrome.runtime.onMessage.addListener(listener)

      return () => {
        chrome.runtime.onMessage.removeListener(listener)
      }
    }
  }, [])

  const sortedDomains = Object.entries(stats.blockedByDomain)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5) // Show top 5 domains

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title statistics">
          Blocking Statistics
        </h2>
        <p className="card-description">Insights into Guardian's protection.</p>
      </div>
      <div className="card-content space-y-6">
        <div className="total-stats">
          <Ban className="total-stats-icon" />
          <div className="total-stats-content">
            <div className="total-stats-value">{stats.totalBlocked.toLocaleString()}</div>
            <p className="total-stats-label">Total Ads Blocked</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stats-item">
            <EyeOff className="stats-item-icon blue" />
            <span className="stats-item-value blue">{stats.blockedByType.banner}</span>
            <p className="stats-item-label">Banners</p>
          </div>
          <div className="stats-item">
            <VideoOff className="stats-item-icon orange" />
            <span className="stats-item-value orange">{stats.blockedByType.video}</span>
            <p className="stats-item-label">Videos</p>
          </div>
          <div className="stats-item">
            <Popover className="stats-item-icon yellow" />
            <span className="stats-item-value yellow">{stats.blockedByType.popup}</span>
            <p className="stats-item-label">Pop-ups</p>
          </div>
          <div className="stats-item">
            <Globe className="stats-item-icon pink" />
            <span className="stats-item-value pink">{stats.blockedByType.redirect}</span>
            <p className="stats-item-label">Redirects</p>
          </div>
        </div>

        <div className="domain-section">
          <h3 className="domain-title">
            <Globe className="domain-title-icon" /> Top Blocked Domains
          </h3>
          {sortedDomains.length > 0 ? (
            <ul className="domain-list">
              {sortedDomains.map(([domain, count]) => (
                <li key={domain} className="domain-item">
                  <span className="domain-name">{domain}</span>
                  <span className="domain-count">{count}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="domain-empty">No domains blocked yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
