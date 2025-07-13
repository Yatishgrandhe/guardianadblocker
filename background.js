// Guardian Ad Blocker Pro - Background Service Worker
console.log('Guardian Ad Blocker Pro: Background Service Worker Initialized');

// Unified Statistics tracking - Compatible with content script
let adStats = {
    totalBlocked: 0,
    blockedByType: {
        banner: 0,
        video: 0,
        popup: 0,
        redirect: 0,
        other: 0
    },
    blockedByDomain: {},
    blockedByTab: {},
    lastUpdated: Date.now()
};

// Legacy stats for backward compatibility
let globalStats = {
    totalRequests: 0,
    blockedRequests: 0,
    youtubeAds: 0,
    newsAds: 0,
    streamingAds: 0,
    generalAds: 0,
    startTime: Date.now()
};

// Site detection
const isYouTube = (url) => url.includes('youtube.com');
const isNewsSite = (url) => {
    const newsSites = ['cnn.com', 'forbes.com', 'nytimes.com', 'bbc.com', 'reuters.com', 'bloomberg.com'];
    return newsSites.some(site => url.includes(site));
};
const isStreamingSite = (url) => {
    const streamingSites = ['crunchyroll.com', 'hianime.to', '9anime.to', 'funimation.com', 'netflix.com', 'hulu.com'];
    return streamingSites.some(site => url.includes(site));
};

// Enhanced ad network blocking patterns
const adNetworks = [
    'doubleclick.net',
    'googlesyndication.com',
    'googleadservices.com',
    'googleads.g.doubleclick.net',
    'pubads.g.doubleclick.net',
    'taboola.com',
    'outbrain.com',
    'quantserve.com',
    'scorecardresearch.com',
    'zedo.com',
    'adservice.google.com',
    'facebook.com/tr',
    'facebook.net',
    'criteo.com',
    'pubmatic.com',
    'rubiconproject.com',
    'openx.net',
    'adnxs.com',
    'adskeeper.com',
    'popads.net',
    'propellerads.com',
    'adsterra.com',
    'mgid.com',
    'revcontent.com',
    'bidvertiser.com',
    'juicyads.com',
    'hilltopads.net',
    'trafficjunky.net',
    'comscore.com',
    'amazon-adsystem.com',
    'bing.com/ads',
    'adsystem.com',
    'sentry-cdn.com',
    'bugsnag.com',
    'googletagmanager.com',
    'google-analytics.com',
    'googletagservices.com',
    'hotjar.com',
    'mc.yandex.ru',
    'an.yandex.ru',
    'yandex.ru',
    'ymatuhin.ru/ads',
    'pagead2.googlesyndication.com',
    'browser.sentry-cdn.com',
    'js.sentry-cdn.com',
    'd2wy8f7a9ursnm.cloudfront.net'
];

// YouTube-specific ad patterns
const youtubeAdPatterns = [
    'youtube.com/api/stats/ads',
    'youtube.com/get_video_info?*adformat*',
    'youtube.com/pagead/',
    'youtube.com/ptracking?',
    'youtube.com/get_video_ads?',
    'youtube.com/api/stats/ads?',
    'youtube.com/get_video_info?*adformat*',
    'youtube.com/pagead/*',
    'youtube.com/ptracking?*',
    'youtube.com/get_video_ads?*'
];

// Google Shopping/Ads blocking
const googleShoppingPatterns = [
    'google.com/search*&tbm=shop*',
    'google.com/search*&tbs=shop*',
    'google.com/search*&source=shopping*',
    'google.com/search*&ved=*&uact=*&oq=*&gs_lcp=*&sclient=*'
];

/**
 * Initialize statistics from storage
 */
const initializeStats = () => {
    chrome.storage.local.get(['adStats', 'stats'], (result) => {
        if (result.adStats) {
            adStats = { ...adStats, ...result.adStats };
        }
        if (result.stats) {
            globalStats = { ...globalStats, ...result.stats };
        }
    });
};

/**
 * Update statistics and notify components
 */
const updateStats = (type, domain, count = 1) => {
    adStats.totalBlocked += count;
    adStats.lastUpdated = Date.now();
    
    // Update type-specific stats
    if (type in adStats.blockedByType) {
        adStats.blockedByType[type] += count;
    } else {
        adStats.blockedByType.other += count;
    }
    
    // Update domain-specific stats
    if (domain) {
        adStats.blockedByDomain[domain] = (adStats.blockedByDomain[domain] || 0) + count;
    }
    
    // Save to storage
    chrome.storage.local.set({ adStats });
    
    // Notify all components about updated stats
    chrome.runtime.sendMessage({
        type: 'UPDATE_STATS',
        adStats: adStats
    }).catch(() => {
        // Ignore connection errors - components might not be open
    });
    
    console.log('Guardian Background: Updated stats -', type, 'blocked:', count);
};

/**
 * Check if a URL should be blocked
 */
const shouldBlockUrl = (url) => {
    const urlLower = url.toLowerCase();
    
    // Check ad networks
    if (adNetworks.some(network => urlLower.includes(network))) {
        return true;
    }
    
    // Check YouTube ad patterns
    if (isYouTube(url) && youtubeAdPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(urlLower);
    })) {
        return true;
    }
    
    // Check Google shopping patterns
    if (googleShoppingPatterns.some(pattern => {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(urlLower);
    })) {
        return true;
    }
    
    return false;
};

/**
 * Handle web request blocking
 */
chrome.webRequest.onBeforeRequest.addListener(
    (details) => {
        globalStats.totalRequests++;
        
        if (shouldBlockUrl(details.url)) {
            globalStats.blockedRequests++;
            
            // Categorize blocked requests
            let type = 'other';
            if (isYouTube(details.url)) {
                globalStats.youtubeAds++;
                type = 'video';
            } else if (isNewsSite(details.url)) {
                globalStats.newsAds++;
                type = 'banner';
            } else if (isStreamingSite(details.url)) {
                globalStats.streamingAds++;
                type = 'video';
            } else {
                globalStats.generalAds++;
                type = 'banner';
            }
            
            // Update unified stats
            const domain = new URL(details.url).hostname;
            updateStats(type, domain);
            
            console.log(`Guardian: Blocked request to ${details.url}`);
            return { cancel: true };
        }
        
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

/**
 * Handle declarative net request feedback
 */
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
    (info) => {
        console.log('Guardian: DNR rule matched:', info);
        globalStats.blockedRequests++;
        
        if (info.request && info.request.url) {
            const domain = new URL(info.request.url).hostname;
            updateStats('other', domain);
        }
    }
);

/**
 * Handle extension installation/update
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Guardian Ad Blocker Pro installed/updated:', details.reason);
    
    // Initialize storage
    chrome.storage.local.set({
        adStats: adStats,
        stats: globalStats,
        settings: {
            aiBlocking: true,
            youtubeBlocking: true,
            newsBlocking: true,
            streamingBlocking: true,
            generalBlocking: true
        }
    });
});

/**
 * Handle messages from content scripts and popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
        case 'GET_STATS':
            sendResponse({
                adStats: adStats,
                background: globalStats
            });
            break;
            
        case 'UPDATE_STATS':
            if (message.adStats) {
                adStats = { ...adStats, ...message.adStats };
                chrome.storage.local.set({ adStats });
                
                // Notify all components about updated stats
                chrome.runtime.sendMessage({
                    type: 'UPDATE_STATS',
                    adStats: adStats
                }).catch(() => {
                    // Ignore connection errors
                });
            }
            sendResponse({ success: true });
            break;
            
        case 'GET_SETTINGS':
            chrome.storage.local.get(['settings'], (result) => {
                sendResponse(result.settings || {});
            });
            return true; // Keep message channel open for async response
            
        case 'UPDATE_SETTINGS':
            chrome.storage.local.set({ settings: message.settings });
            sendResponse({ success: true });
            break;
            
        case 'BLOCK_URL':
            if (shouldBlockUrl(message.url)) {
                const domain = new URL(message.url).hostname;
                updateStats('other', domain);
                sendResponse({ blocked: true });
            } else {
                sendResponse({ blocked: false });
            }
            break;
            
        case 'GET_CURRENT_SITE_BLOCKED_COUNT':
            const { domain } = message;
            const count = adStats.blockedByDomain[domain] || 0;
            sendResponse({ count });
            break;
            
        case 'UPDATE_CURRENT_SITE_BLOCKED_COUNT':
            // This is handled by the content script directly
            sendResponse({ success: true });
            break;
            
        default:
            sendResponse({ error: 'Unknown message type' });
    }
});

/**
 * Handle tab updates
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
        // Inject content script if needed
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['contentScript.js']
        }).catch(() => {
            // Script might already be injected
        });
    }
});

/**
 * Initialize stats on startup
 */
initializeStats();

/**
 * Periodic stats cleanup and storage
 */
setInterval(() => {
    chrome.storage.local.set({ 
        adStats: adStats,
        stats: globalStats 
    });
    
    // Reset daily stats if needed
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    if (now - globalStats.startTime > dayInMs) {
        globalStats = {
            totalRequests: 0,
            blockedRequests: 0,
            youtubeAds: 0,
            newsAds: 0,
            streamingAds: 0,
            generalAds: 0,
            startTime: now
        };
    }
}, 30000); // Every 30 seconds

/**
 * Handle alarm events
 */
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'statsCleanup') {
        // Daily stats cleanup
        globalStats = {
            totalRequests: 0,
            blockedRequests: 0,
            youtubeAds: 0,
            newsAds: 0,
            streamingAds: 0,
            generalAds: 0,
            startTime: Date.now()
        };
        chrome.storage.local.set({ 
            adStats: adStats,
            stats: globalStats 
        });
    }
});

// Create daily cleanup alarm
chrome.alarms.create('statsCleanup', { periodInMinutes: 1440 }); // 24 hours

console.log('Guardian Ad Blocker Pro: Background Service Worker Setup Complete');
