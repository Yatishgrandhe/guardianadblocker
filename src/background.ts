// This is the service worker for the Chrome Extension.
// It runs in the background and handles ad blocking logic.

// Define the ID for our declarativeNetRequest rule set
const GUARDIAN_RULE_SET_ID = "guardian_rules"
const COSMETIC_RULE_SET_ID = "guardian_cosmetic_rules" // For cosmetic rules

// Initial state for ad blocking (enabled by default)
let isGlobalBlockingEnabled = true
const siteBlockingStates: { [domain: string]: boolean } = {} // Per-site blocking state

// Initial statistics structure
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
  blockedByTab: { [tabId: number]: { [domain: string]: number } } // Track blocked ads per tab/domain
}

let adStats: AdStats = {
  totalBlocked: 0,
  blockedByType: {
    banner: 0,
    video: 0,
    popup: 0,
    redirect: 0,
    other: 0,
  },
  blockedByDomain: {},
  blockedByTab: {},
}

const FILTER_LIST_URL = chrome.runtime.getURL("src/rules.json") // Fixed path
const COSMETIC_LIST_URL = chrome.runtime.getURL("src/cosmetic-rules.json") // Fixed path

// --- Utility Functions ---

// Function to fetch and update declarativeNetRequest rules
async function fetchAndUpdateDNRRules() {
  try {
    const response = await fetch(FILTER_LIST_URL)
    const rules = await response.json()

    // Remove existing dynamic rules (if any) before adding new ones
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules()
    const ruleIdsToRemove = existingRules.map((rule: { id: number }) => rule.id)
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: ruleIdsToRemove,
      addRules: rules,
    })
    console.log("Guardian: DeclarativeNetRequest rules updated.")
  } catch (error) {
    console.error("Guardian: Error fetching or updating DNR rules:", error)
  }
}

// Function to apply cosmetic rules to a specific tab
async function applyCosmeticRules(tabId: number, url: string) {
  const domain = new URL(url).hostname
  // Only apply cosmetic rules if global blocking is enabled AND per-site blocking is enabled for this domain
  if (!isGlobalBlockingEnabled || siteBlockingStates[domain] === false) {
    // console.log(`Guardian: Cosmetic filtering skipped for ${domain} due to blocking state.`);
    return
  }

  try {
    const response = await fetch(COSMETIC_LIST_URL)
    const cosmeticRules = await response.json()

    const rulesToApply = cosmeticRules.filter((rule: any) => {
      return rule.domains.includes("*") || rule.domains.some((d: string) => domain.includes(d))
    })

    if (rulesToApply.length > 0) {
      const css = rulesToApply.map((rule: any) => rule.css).join("\n")
      if (css) {
        await chrome.scripting.insertCSS({
          target: { tabId: tabId },
          css: css,
        })
        // console.log(`Guardian: Injected cosmetic CSS for ${domain}`);
      }
    }
  } catch (error) {
    console.error("Guardian: Error applying cosmetic rules:", error)
  }
}

// Function to update statistics
function updateStats(ruleId: number, url: string, tabId: number) {
  adStats.totalBlocked++

  // Basic categorization based on rule ID or URL patterns (highly simplified)
  if (url.includes("video") || url.includes("stream")) {
    adStats.blockedByType.video++
  } else if (url.includes("banner") || url.includes("adimage")) {
    adStats.blockedByType.banner++
  } else if (url.includes("popup") || url.includes("popunder")) {
    adStats.blockedByType.popup++
  } else if (url.includes("redirect")) {
    adStats.blockedByType.redirect++
  } else {
    adStats.blockedByType.other++
  }

  const domain = new URL(url).hostname
  adStats.blockedByDomain[domain] = (adStats.blockedByDomain[domain] || 0) + 1

  // Update per-tab/per-domain stats
  if (!adStats.blockedByTab[tabId]) {
    adStats.blockedByTab[tabId] = {}
  }
  adStats.blockedByTab[tabId][domain] = (adStats.blockedByTab[tabId][domain] || 0) + 1

  // Save updated stats to storage
  chrome.storage.local.set({ adStats })

  // Update badge text for the current tab
  chrome.tabs.get(tabId, (tab) => {
    if (tab && tab.active) {
      const currentTabDomain = new URL(tab.url || "").hostname
      const countForCurrentTab = adStats.blockedByTab[tabId]?.[currentTabDomain] || 0
      chrome.action.setBadgeText({ text: countForCurrentTab.toString(), tabId: tabId })
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId }) // Red color for blocked count
    }
  })

  // Notify popup about updated stats
  chrome.runtime.sendMessage({ type: "UPDATE_STATS", adStats })
  chrome.runtime.sendMessage({
    type: "UPDATE_CURRENT_SITE_BLOCKED_COUNT",
    domain,
    count: adStats.blockedByTab[tabId]?.[domain] || 0,
  })
}

// --- Event Listeners ---

// Initialize state and rules on extension startup
chrome.runtime.onInstalled.addListener(async () => {
  // Load initial state from storage
  const result = await chrome.storage.local.get(["isGlobalBlockingEnabled", "adStats", "siteBlockingStates"])
  if (result.isGlobalBlockingEnabled !== undefined) {
    isGlobalBlockingEnabled = result.isGlobalBlockingEnabled
  }
  if (result.adStats) {
    adStats = result.adStats
  }
  if (result.siteBlockingStates) {
    Object.assign(siteBlockingStates, result.siteBlockingStates)
  }

  // Fetch and update DNR rules on install
  await fetchAndUpdateDNRRules()

  // Set up alarm for periodic updates (e.g., every 24 hours)
  chrome.alarms.create("updateFilterLists", { periodInMinutes: 24 * 60 })

  // Ensure the declarativeNetRequest rule set is enabled/disabled based on stored state
  await chrome.declarativeNetRequest.updateEnabledRulesets({
    enableRulesetIds: isGlobalBlockingEnabled ? [GUARDIAN_RULE_SET_ID] : [],
    disableRulesetIds: isGlobalBlockingEnabled ? [] : [GUARDIAN_RULE_SET_ID],
  })

  console.log(`Guardian: Initialized. Global blocking is ${isGlobalBlockingEnabled ? "enabled" : "disabled"}.`)
})

// Listen for alarm to update filter lists
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "updateFilterLists") {
    console.log("Guardian: Attempting to update filter lists...")
    fetchAndUpdateDNRRules()
  }
})

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TOGGLE_GLOBAL_BLOCKING") {
    isGlobalBlockingEnabled = message.enabled
    chrome.storage.local.set({ isGlobalBlockingEnabled })

    // Enable or disable the declarativeNetRequest rule set
    chrome.declarativeNetRequest
      .updateEnabledRulesets({
        enableRulesetIds: isGlobalBlockingEnabled ? [GUARDIAN_RULE_SET_ID] : [],
        disableRulesetIds: isGlobalBlockingEnabled ? [] : [GUARDIAN_RULE_SET_ID],
      })
      .then(() => {
        console.log(`Guardian: Global blocking ${isGlobalBlockingEnabled ? "enabled" : "disabled"}.`)
        // Re-apply cosmetic rules to all tabs if global state changes
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach((tab) => {
            if (tab.id && tab.url) {
              applyCosmeticRules(tab.id, tab.url)
            }
          })
        })
        sendResponse({ success: true, isGlobalBlockingEnabled })
      })
      .catch((error) => {
        console.error("Guardian: Error toggling global rules:", error)
        sendResponse({ success: false, error: error.message })
      })
    return true // Indicate that the response will be sent asynchronously
  } else if (message.type === "TOGGLE_SITE_BLOCKING") {
    const { domain, enabled } = message
    siteBlockingStates[domain] = enabled
    chrome.storage.local.set({ siteBlockingStates })
    console.log(`Guardian: Site blocking for ${domain} ${enabled ? "enabled" : "disabled"}.`)

    // Re-apply cosmetic rules for the current tab
    if (sender.tab && sender.tab.id && sender.tab.url) {
      applyCosmeticRules(sender.tab.id, sender.tab.url)
    }
    sendResponse({ success: true, siteBlockingEnabled: enabled })
  } else if (message.type === "GET_STATS") {
    sendResponse({ adStats })
  } else if (message.type === "GET_CURRENT_SITE_BLOCKED_COUNT") {
    const { domain } = message
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTabId = tabs[0]?.id
      if (currentTabId) {
        const count = adStats.blockedByTab[currentTabId]?.[domain] || 0
        sendResponse({ count })
      } else {
        sendResponse({ count: 0 })
      }
    })
    return true // Asynchronous response
  }
})

// Listen for blocked requests to update statistics
// Note: declarativeNetRequestFeedback permission is required for onRuleMatchedDebug
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
  // info has: rule (with ruleId, rulesetId), request (with url, tabId)
  if (info.rule && info.rule.rulesetId === GUARDIAN_RULE_SET_ID && info.request && info.request.url && typeof info.request.tabId === 'number') {
    // console.log('Guardian: Blocked:', info.request.url, 'by rule:', info.rule.ruleId);
    updateStats(info.rule.ruleId, info.request.url, info.request.tabId)
  }
})

// Listen for page loads to apply cosmetic filtering and reset per-tab count
chrome.webNavigation.onCompleted.addListener(
  (details) => {
    if (details.frameId === 0) {
      // Only target the main frame
      applyCosmeticRules(details.tabId, details.url)

      // Reset blocked count for this tab on new navigation
      if (adStats.blockedByTab[details.tabId]) {
        const domain = new URL(details.url).hostname
        adStats.blockedByTab[details.tabId][domain] = 0
        chrome.storage.local.set({ adStats }) // Persist reset
      }
      chrome.action.setBadgeText({ text: "", tabId: details.tabId }) // Clear badge
    }
  },
  { url: [{ schemes: ["http", "https"] }] },
)

// Clean up stats for closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  if (adStats.blockedByTab[tabId]) {
    delete adStats.blockedByTab[tabId]
    chrome.storage.local.set({ adStats })
  }
})

// Update badge when tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url) {
      const domain = new URL(tab.url).hostname
      const count = adStats.blockedByTab[activeInfo.tabId]?.[domain] || 0
      chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "", tabId: activeInfo.tabId })
      chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: activeInfo.tabId })
    }
  })
})
