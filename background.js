// This is the service worker for the Chrome Extension.
// It runs in the background and handles ad blocking logic.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Define the ID for our declarativeNetRequest rule set
const GUARDIAN_RULE_SET_ID = "guardian_rules";
const COSMETIC_RULE_SET_ID = "guardian_cosmetic_rules"; // For cosmetic rules
// Initial state for ad blocking (enabled by default)
let isGlobalBlockingEnabled = true;
const siteBlockingStates = {}; // Per-site blocking state
let adStats = {
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
    lastUpdated: Date.now(),
};
const FILTER_LIST_URL = chrome.runtime.getURL("rules.json"); // Simulate remote URL
const COSMETIC_LIST_URL = chrome.runtime.getURL("src/cosmetic-rules.json"); // Fixed path
// --- Utility Functions ---
// Function to fetch and update declarativeNetRequest rules
function fetchAndUpdateDNRRules() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield fetch(FILTER_LIST_URL);
            const rules = yield response.json();
            // Remove existing dynamic rules (if any) before adding new ones
            const existingRules = yield chrome.declarativeNetRequest.getDynamicRules();
            const ruleIdsToRemove = existingRules.map((rule) => rule.id);
            yield chrome.declarativeNetRequest.updateDynamicRules({
                removeRuleIds: ruleIdsToRemove,
                addRules: rules,
            });
            console.log("Guardian: DeclarativeNetRequest rules updated.");
        }
        catch (error) {
            console.error("Guardian: Error fetching or updating DNR rules:", error);
        }
    });
}
// Function to apply cosmetic rules to a specific tab
function applyCosmeticRules(tabId, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const domain = new URL(url).hostname;
        // Only apply cosmetic rules if global blocking is enabled AND per-site blocking is enabled for this domain
        if (!isGlobalBlockingEnabled || siteBlockingStates[domain] === false) {
            // console.log(`Guardian: Cosmetic filtering skipped for ${domain} due to blocking state.`);
            return;
        }
        try {
            const response = yield fetch(COSMETIC_LIST_URL);
            const cosmeticRules = yield response.json();
            const rulesToApply = cosmeticRules.filter((rule) => {
                return rule.domains.includes("*") || rule.domains.some((d) => domain.includes(d));
            });
            if (rulesToApply.length > 0) {
                const css = rulesToApply.map((rule) => rule.css).join("\n");
                if (css) {
                    yield chrome.scripting.insertCSS({
                        target: { tabId: tabId },
                        css: css,
                    });
                    // console.log(`Guardian: Injected cosmetic CSS for ${domain}`);
                }
            }
        }
        catch (error) {
            // Silently handle cosmetic rules fetch error - content script handles most blocking
            // console.error("Guardian: Error applying cosmetic rules:", error)
        }
    });
}
// Enhanced function to update statistics from content script
function updateStatsFromContentScript(data, tabId) {
    var _a;
    adStats.totalBlocked++;
    adStats.lastUpdated = Date.now();
    // Categorize based on content script data
    const type = data.type || 'other';
    if (type in adStats.blockedByType) {
        adStats.blockedByType[type]++;
    }
    else {
        adStats.blockedByType.other++;
    }
    const domain = data.domain || new URL(data.url || '').hostname;
    adStats.blockedByDomain[domain] = (adStats.blockedByDomain[domain] || 0) + 1;
    // Update per-tab/per-domain stats
    if (!adStats.blockedByTab[tabId]) {
        adStats.blockedByTab[tabId] = {};
    }
    adStats.blockedByTab[tabId][domain] = (adStats.blockedByTab[tabId][domain] || 0) + 1;
    // Save updated stats to storage
    chrome.storage.local.set({ adStats });
    // Update badge text for the current tab
    chrome.tabs.get(tabId, (tab) => {
        var _a;
        if (tab && tab.active) {
            const currentTabDomain = new URL(tab.url || "").hostname;
            const countForCurrentTab = ((_a = adStats.blockedByTab[tabId]) === null || _a === void 0 ? void 0 : _a[currentTabDomain]) || 0;
            chrome.action.setBadgeText({ text: countForCurrentTab.toString(), tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId }); // Red color for blocked count
        }
    });
    // Safely notify popup about updated stats
    try {
        chrome.runtime.sendMessage({ type: "UPDATE_STATS", adStats }).catch(() => {
            // Ignore connection errors - popup might not be open
        });
        chrome.runtime.sendMessage({
            type: "UPDATE_CURRENT_SITE_BLOCKED_COUNT",
            domain,
            count: ((_a = adStats.blockedByTab[tabId]) === null || _a === void 0 ? void 0 : _a[domain]) || 0,
        }).catch(() => {
            // Ignore connection errors - popup might not be open
        });
    }
    catch (error) {
        // Ignore connection errors
    }
    console.log(`Guardian: Updated stats - ${type} blocked on ${domain} (Total: ${adStats.totalBlocked})`);
}
// Function to update statistics from declarativeNetRequest
function updateStats(ruleId, url, tabId) {
    var _a;
    adStats.totalBlocked++;
    adStats.lastUpdated = Date.now();
    // Basic categorization based on rule ID or URL patterns (highly simplified)
    if (url.includes("video") || url.includes("stream")) {
        adStats.blockedByType.video++;
    }
    else if (url.includes("banner") || url.includes("adimage")) {
        adStats.blockedByType.banner++;
    }
    else if (url.includes("popup") || url.includes("popunder")) {
        adStats.blockedByType.popup++;
    }
    else if (url.includes("redirect")) {
        adStats.blockedByType.redirect++;
    }
    else {
        adStats.blockedByType.other++;
    }
    const domain = new URL(url).hostname;
    adStats.blockedByDomain[domain] = (adStats.blockedByDomain[domain] || 0) + 1;
    // Update per-tab/per-domain stats
    if (!adStats.blockedByTab[tabId]) {
        adStats.blockedByTab[tabId] = {};
    }
    adStats.blockedByTab[tabId][domain] = (adStats.blockedByTab[tabId][domain] || 0) + 1;
    // Save updated stats to storage
    chrome.storage.local.set({ adStats });
    // Update badge text for the current tab
    chrome.tabs.get(tabId, (tab) => {
        var _a;
        if (tab && tab.active) {
            const currentTabDomain = new URL(tab.url || "").hostname;
            const countForCurrentTab = ((_a = adStats.blockedByTab[tabId]) === null || _a === void 0 ? void 0 : _a[currentTabDomain]) || 0;
            chrome.action.setBadgeText({ text: countForCurrentTab.toString(), tabId: tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: tabId }); // Red color for blocked count
        }
    });
    // Safely notify popup about updated stats
    try {
        chrome.runtime.sendMessage({ type: "UPDATE_STATS", adStats }).catch(() => {
            // Ignore connection errors - popup might not be open
        });
        chrome.runtime.sendMessage({
            type: "UPDATE_CURRENT_SITE_BLOCKED_COUNT",
            domain,
            count: ((_a = adStats.blockedByTab[tabId]) === null || _a === void 0 ? void 0 : _a[domain]) || 0,
        }).catch(() => {
            // Ignore connection errors - popup might not be open
        });
    }
    catch (error) {
        // Ignore connection errors
    }
}
// --- Event Listeners ---
// Initialize state and rules on extension startup
chrome.runtime.onInstalled.addListener(() => __awaiter(this, void 0, void 0, function* () {
    // Load initial state from storage
    const result = yield chrome.storage.local.get(["isGlobalBlockingEnabled", "adStats", "siteBlockingStates"]);
    if (result.isGlobalBlockingEnabled !== undefined) {
        isGlobalBlockingEnabled = result.isGlobalBlockingEnabled;
    }
    if (result.adStats) {
        adStats = Object.assign(Object.assign({}, adStats), result.adStats);
    }
    if (result.siteBlockingStates) {
        Object.assign(siteBlockingStates, result.siteBlockingStates);
    }
    // Fetch and update DNR rules on install
    yield fetchAndUpdateDNRRules();
    // Set up alarm for periodic updates (e.g., every 24 hours)
    chrome.alarms.create("updateFilterLists", { periodInMinutes: 24 * 60 });
    // Ensure the declarativeNetRequest rule set is enabled/disabled based on stored state
    yield chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: isGlobalBlockingEnabled ? [GUARDIAN_RULE_SET_ID] : [],
        disableRulesetIds: isGlobalBlockingEnabled ? [] : [GUARDIAN_RULE_SET_ID],
    });
    console.log(`Guardian: Initialized. Global blocking is ${isGlobalBlockingEnabled ? "enabled" : "disabled"}.`);
}));
// Listen for alarm to update filter lists
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "updateFilterLists") {
        console.log("Guardian: Attempting to update filter lists...");
        fetchAndUpdateDNRRules();
    }
});
// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "TOGGLE_GLOBAL_BLOCKING") {
        isGlobalBlockingEnabled = message.enabled;
        chrome.storage.local.set({ isGlobalBlockingEnabled });
        // Enable or disable the declarativeNetRequest rule set
        chrome.declarativeNetRequest
            .updateEnabledRulesets({
            enableRulesetIds: isGlobalBlockingEnabled ? [GUARDIAN_RULE_SET_ID] : [],
            disableRulesetIds: isGlobalBlockingEnabled ? [] : [GUARDIAN_RULE_SET_ID],
        })
            .then(() => {
            console.log(`Guardian: Global blocking ${isGlobalBlockingEnabled ? "enabled" : "disabled"}.`);
            // Re-apply cosmetic rules to all tabs if global state changes
            chrome.tabs.query({}, (tabs) => {
                tabs.forEach((tab) => {
                    if (tab.id && tab.url) {
                        applyCosmeticRules(tab.id, tab.url);
                    }
                });
            });
            sendResponse({ success: true, isGlobalBlockingEnabled });
        })
            .catch((error) => {
            console.error("Guardian: Error toggling global rules:", error);
            sendResponse({ success: false, error: error.message });
        });
        return true; // Indicate that the response will be sent asynchronously
    }
    else if (message.type === "TOGGLE_SITE_BLOCKING") {
        const { domain, enabled } = message;
        siteBlockingStates[domain] = enabled;
        chrome.storage.local.set({ siteBlockingStates });
        console.log(`Guardian: Site blocking for ${domain} ${enabled ? "enabled" : "disabled"}.`);
        // Re-apply cosmetic rules for the current tab
        if (sender.tab && sender.tab.id && sender.tab.url) {
            applyCosmeticRules(sender.tab.id, sender.tab.url);
        }
        sendResponse({ success: true, siteBlockingEnabled: enabled });
    }
    else if (message.type === "GET_STATS") {
        sendResponse({ adStats });
    }
    else if (message.type === "GET_CURRENT_SITE_BLOCKED_COUNT") {
        const { domain } = message;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            var _a, _b;
            const currentTabId = (_a = tabs[0]) === null || _a === void 0 ? void 0 : _a.id;
            if (currentTabId) {
                const count = ((_b = adStats.blockedByTab[currentTabId]) === null || _b === void 0 ? void 0 : _b[domain]) || 0;
                sendResponse({ count });
            }
            else {
                sendResponse({ count: 0 });
            }
        });
        return true; // Asynchronous response
    }
    else if (message.type === "CONTENT_SCRIPT_BLOCKED") {
        // Handle statistics from content script
        if (sender.tab && sender.tab.id) {
            updateStatsFromContentScript(message.data, sender.tab.id);
        }
        sendResponse({ success: true });
    }
    else if (message.type === "CONTENT_SCRIPT_LOADED") {
        // Content script loaded, initialize stats for this tab if needed
        if (sender.tab && sender.tab.id) {
            const domain = message.data.domain;
            if (!adStats.blockedByTab[sender.tab.id]) {
                adStats.blockedByTab[sender.tab.id] = {};
            }
            if (!adStats.blockedByTab[sender.tab.id][domain]) {
                adStats.blockedByTab[sender.tab.id][domain] = 0;
            }
            chrome.storage.local.set({ adStats });
        }
        sendResponse({ success: true });
    }
    else if (message.type === "RESET_STATS") {
        // Reset all statistics
        adStats = {
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
            lastUpdated: Date.now(),
        };
        chrome.storage.local.set({ adStats });
        try {
            chrome.runtime.sendMessage({ type: "UPDATE_STATS", adStats }).catch(() => {
                // Ignore connection errors
            });
        }
        catch (error) {
            // Ignore connection errors
        }
        sendResponse({ success: true });
    }
});
// Listen for blocked requests to update statistics
// Note: declarativeNetRequestFeedback permission is required for onRuleMatchedDebug
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    // info has: rule (with ruleId, rulesetId), request (with url, tabId)
    if (info.rule && info.rule.rulesetId === GUARDIAN_RULE_SET_ID && info.request && info.request.url && typeof info.request.tabId === 'number') {
        // console.log('Guardian: Blocked:', info.request.url, 'by rule:', info.rule.ruleId);
        updateStats(info.rule.ruleId, info.request.url, info.request.tabId);
    }
});
// Listen for page loads to apply cosmetic filtering and reset per-tab count
chrome.webNavigation.onCompleted.addListener((details) => {
    if (details.frameId === 0) {
        // Only target the main frame
        applyCosmeticRules(details.tabId, details.url);
        // Reset blocked count for this tab on new navigation
        if (adStats.blockedByTab[details.tabId]) {
            const domain = new URL(details.url).hostname;
            adStats.blockedByTab[details.tabId][domain] = 0;
            chrome.storage.local.set({ adStats }); // Persist reset
        }
        chrome.action.setBadgeText({ text: "", tabId: details.tabId }); // Clear badge
    }
}, { url: [{ schemes: ["http", "https"] }] });
// Clean up stats for closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
    if (adStats.blockedByTab[tabId]) {
        delete adStats.blockedByTab[tabId];
        chrome.storage.local.set({ adStats });
    }
});
// Update badge when tab becomes active
chrome.tabs.onActivated.addListener((activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        var _a;
        if (tab && tab.url) {
            const domain = new URL(tab.url).hostname;
            const count = ((_a = adStats.blockedByTab[activeInfo.tabId]) === null || _a === void 0 ? void 0 : _a[domain]) || 0;
            chrome.action.setBadgeText({ text: count > 0 ? count.toString() : "", tabId: activeInfo.tabId });
            chrome.action.setBadgeBackgroundColor({ color: "#FF0000", tabId: activeInfo.tabId });
        }
    });
});
