(() => {
    'use strict';
    
    console.log('🚀 Guardian Ad Blocker Advanced: Initializing professional-grade ad blocking system');

    // ============================================================================
    // GLOBAL STATE MANAGEMENT
    // ============================================================================
    
    const GuardianState = {
        isEnabled: true,
        currentSite: null,
        siteType: null,
        observers: new Map(),
        blockedElements: new Set(),
        lastProcessTime: 0,
        processInterval: 1000,
        cleanupInterval: 3000,
        skipButtonInterval: 1000,
        mutationThrottle: 100,
        isYouTube: false,
        isNewsSite: false,
        isStreamingSite: false
    };

    // ============================================================================
    // SITE DETECTION & CLASSIFICATION
    // ============================================================================
    
    const SiteDetector = {
        detectSite() {
            const hostname = window.location.hostname.toLowerCase();
            const pathname = window.location.pathname.toLowerCase();
            
            if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
                GuardianState.isYouTube = true;
                GuardianState.siteType = 'youtube';
                return 'youtube';
            }
            
            if (hostname.includes('cnn.com') || 
                hostname.includes('forbes.com') || 
                hostname.includes('nytimes.com') ||
                hostname.includes('bbc.com') ||
                hostname.includes('reuters.com') ||
                hostname.includes('wsj.com')) {
                GuardianState.isNewsSite = true;
                GuardianState.siteType = 'news';
                return 'news';
            }
            
            if (hostname.includes('crunchyroll.com') ||
                hostname.includes('hianime.to') ||
                hostname.includes('9anime.to') ||
                hostname.includes('gogoanime') ||
                hostname.includes('zoro.to') ||
                hostname.includes('animepahe.com')) {
                GuardianState.isStreamingSite = true;
                GuardianState.siteType = 'streaming';
                return 'streaming';
            }
            
            GuardianState.siteType = 'general';
            return 'general';
        }
    };

    // ============================================================================
    // YOUTUBE-SPECIFIC BLOCKING
    // ============================================================================
    
    const YouTubeBlocker = {
        cssInjected: false,
        
        injectCSS() {
            if (this.cssInjected) return;
            
            const css = `
                /* YouTube Ad Blocking - Professional Grade */
                
                /* Hide ad containers without affecting layout */
                ytd-promoted-sparkles-web-renderer,
                ytd-display-ad-renderer,
                ytd-promoted-video-renderer,
                ytd-ad-slot-renderer,
                #masthead-ad,
                .masthead-ad {
                    display: none !important;
                    height: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                /* Hide video ad overlays - preserve player functionality */
                .ytp-ad-overlay-container:not(.ytp-player-content *),
                .ytp-ad-player-overlay:not(.ytp-player-content *),
                .ytp-ad-module:not(.ytp-player-content *) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                
                /* Hide ad text overlays */
                .ytp-ad-text-overlay,
                .ytp-ad-image-overlay {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    pointer-events: none !important;
                }
                
                /* Preserve skip button functionality */
                .ytp-ad-skip-button,
                .ytp-ad-skip-button-modern {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                
                /* Hide ad feedback dialogs */
                .ytp-ad-feedback-dialog-container {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* Hide ad video player overlays */
                .ytp-ad-player-overlay-instream-info,
                .ytp-ad-player-overlay-skip-or-preview {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* Hide ad video player content */
                .ytp-ad-player-overlay-content {
                    display: none !important;
                    visibility: hidden !important;
                }
                
                /* Preserve all legitimate YouTube UI elements */
                .ytp-chrome-bottom,
                .ytp-chrome-top,
                .ytp-title,
                .ytp-gradient-top,
                .ytp-gradient-bottom,
                .ytp-caption-window-container,
                .ytp-caption-segment,
                .ytp-caption-window,
                .ytp-subtitles-button,
                .ytp-settings-button,
                .ytp-fullscreen-button,
                .ytp-play-button,
                .ytp-pause-button,
                .ytp-volume-panel,
                .ytp-progress-bar,
                .ytp-time-display,
                .ytp-quality-button,
                .ytp-autonav-toggle-button,
                .ytp-player-content,
                .ytp-player,
                .html5-video-player,
                .video-stream,
                .ytp-large-play-button,
                .ytp-large-play-button-overlay {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                }
                
                /* Preserve Shorts functionality completely */
                ytd-reel-video-renderer,
                ytd-reel-player-renderer,
                .reel-player-overlay-renderer,
                .reel-player,
                ytd-reel-shelf-renderer,
                ytd-reel-item-renderer,
                .ytd-reel-video-renderer,
                .ytd-reel-player-renderer {
                    display: block !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    pointer-events: auto !important;
                    height: auto !important;
                    width: auto !important;
                    margin: inherit !important;
                    padding: inherit !important;
                    position: static !important;
                    left: auto !important;
                    top: auto !important;
                    z-index: auto !important;
                }
                
                /* Hide ad Shorts content but preserve container */
                ytd-reel-video-renderer[is-ad="true"] {
                    opacity: 0.1 !important;
                    pointer-events: none !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'guardian-youtube-css';
            style.textContent = css;
            document.head.appendChild(style);
            this.cssInjected = true;
            
            console.log('✅ YouTube CSS injected successfully');
        },
        
        removeCSS() {
            const style = document.getElementById('guardian-youtube-css');
            if (style) {
                style.remove();
                this.cssInjected = false;
                console.log('✅ YouTube CSS removed');
            }
        },
        
        blockAdElements() {
            const selectors = [
                'ytd-promoted-sparkles-web-renderer',
                'ytd-display-ad-renderer',
                'ytd-promoted-video-renderer',
                'ytd-ad-slot-renderer',
                '#masthead-ad',
                '.masthead-ad',
                '.ytp-ad-overlay-container:not(.ytp-player-content *)',
                '.ytp-ad-player-overlay:not(.ytp-player-content *)',
                '.ytp-ad-module:not(.ytp-player-content *)',
                '.ytp-ad-text-overlay',
                '.ytp-ad-image-overlay',
                '.ytp-ad-feedback-dialog-container',
                '.ytp-ad-player-overlay-instream-info',
                '.ytp-ad-player-overlay-skip-or-preview',
                '.ytp-ad-player-overlay-content'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    // Skip if element is inside Shorts
                    if (el.closest('ytd-reel-video-renderer, ytd-reel-player-renderer')) {
                        return;
                    }
                    
                    if (!GuardianState.blockedElements.has(el)) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.style.pointerEvents = 'none';
                        GuardianState.blockedElements.add(el);
                    }
                });
            });
        },
        
        autoSkipAds() {
            const skipButtons = document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern');
            skipButtons.forEach(btn => {
                if (btn && btn.offsetParent !== null) { // Check if button is visible
                    btn.click();
                    console.log('✅ Auto-clicked YouTube skip button');
                }
            });
        }
    };

    // ============================================================================
    // NEWS SITES BLOCKING
    // ============================================================================
    
    const NewsSiteBlocker = {
        blockAdElements() {
            const selectors = [
                '.ad-container',
                '.sticky-ad',
                '.banner-ad',
                '[data-sponsored]',
                '.sponsored-content',
                '.ad-slot',
                '.ad-wrapper',
                '.advertisement',
                '.ads',
                '.ad-banner',
                '.ad-sidebar',
                '.ad-header',
                '.ad-footer',
                '.ad-inline',
                '.ad-sponsored',
                '.ad-recommendation',
                '.ad-suggestion',
                '.ad-related',
                '.ad-popular',
                '.ad-trending'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!GuardianState.blockedElements.has(el)) {
                        // Try to remove first, fallback to collapse if it breaks layout
                        try {
                            el.remove();
                        } catch (e) {
                            el.style.display = 'none';
                            el.style.height = '0';
                            el.style.minHeight = '0';
                            el.style.margin = '0';
                            el.style.padding = '0';
                        }
                        GuardianState.blockedElements.add(el);
                    }
                });
            });
        }
    };

    // ============================================================================
    // STREAMING SITES BLOCKING
    // ============================================================================
    
    const StreamingSiteBlocker = {
        blockAdElements() {
            const selectors = [
                '.overlay',
                '.popup',
                '.ad-layer',
                '[onclick*="window.open"]',
                '.ad-popup',
                '.ad-overlay',
                '.ad-modal',
                '.ad-dialog',
                '.ad-notification',
                '.ad-alert',
                '.ad-warning',
                '.ad-info',
                '.ad-success',
                '.ad-error'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!GuardianState.blockedElements.has(el)) {
                        el.remove();
                        GuardianState.blockedElements.add(el);
                    }
                });
            });
            
            // Block iframe ads while preserving video players
            document.querySelectorAll('iframe').forEach(iframe => {
                const src = iframe.src || '';
                if (src.includes('ads') || src.includes('doubleclick') || src.includes('googleads')) {
                    if (!GuardianState.blockedElements.has(iframe)) {
                        iframe.remove();
                        GuardianState.blockedElements.add(iframe);
                    }
                }
            });
        },
        
        autoDenyNotifications() {
            // Override notification permission request
            if (Notification && Notification.requestPermission) {
                const originalRequestPermission = Notification.requestPermission;
                Notification.requestPermission = () => Promise.resolve('denied');
            }
        },
        
        autoClosePopups() {
            // Auto-close popups by clicking close buttons
            const closeSelectors = [
                '.close',
                '.close-btn',
                '.close-button',
                '.popup-close',
                '.modal-close',
                '.dialog-close',
                '.overlay-close',
                '[aria-label*="close" i]',
                '[title*="close" i]'
            ];
            
            closeSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(btn => {
                    if (btn && btn.offsetParent !== null) {
                        btn.click();
                    }
                });
            });
        }
    };

    // ============================================================================
    // GENERAL SITE BLOCKING
    // ============================================================================
    
    const GeneralBlocker = {
        blockAdElements() {
            const selectors = [
                '.ad',
                '.ads',
                '.advertisement',
                '.ad-banner',
                '.ad-sidebar',
                '.ad-header',
                '.ad-footer',
                '.ad-inline',
                '.ad-sponsored',
                '.ad-recommendation',
                '.ad-suggestion',
                '.ad-related',
                '.ad-popular',
                '.ad-trending',
                '[class*="ad-"]',
                '[id*="ad-"]',
                '[class*="ads-"]',
                '[id*="ads-"]'
            ];
            
            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!GuardianState.blockedElements.has(el)) {
                        el.style.display = 'none';
                        GuardianState.blockedElements.add(el);
                    }
                });
            });
        }
    };

    // ============================================================================
    // DYNAMIC CLEANUP SYSTEM
    // ============================================================================
    
    const DynamicCleanup = {
        observer: null,
        
        setupMutationObserver() {
            if (this.observer) {
                this.observer.disconnect();
            }
            
            this.observer = new MutationObserver((mutations) => {
                let shouldProcess = false;
                
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                        shouldProcess = true;
                    }
                });
                
                if (shouldProcess) {
                    // Throttle processing to avoid CPU drain
                    const now = Date.now();
                    if (now - GuardianState.lastProcessTime > GuardianState.mutationThrottle) {
                        GuardianState.lastProcessTime = now;
                        this.processNewElements();
                    }
                }
            });
            
            if (document.body) {
                this.observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
                console.log('✅ MutationObserver setup complete');
            } else {
                window.addEventListener('DOMContentLoaded', () => {
                    this.observer.observe(document.body, {
                        childList: true,
                        subtree: true
                    });
                    console.log('✅ MutationObserver setup complete (delayed)');
                });
            }
        },
        
        processNewElements() {
            if (!GuardianState.isEnabled) return;
            
            switch (GuardianState.siteType) {
                case 'youtube':
                    YouTubeBlocker.blockAdElements();
                    break;
                case 'news':
                    NewsSiteBlocker.blockAdElements();
                    break;
                case 'streaming':
                    StreamingSiteBlocker.blockAdElements();
                    break;
                default:
                    GeneralBlocker.blockAdElements();
                    break;
            }
        },
        
        cleanup() {
            if (this.observer) {
                this.observer.disconnect();
                this.observer = null;
            }
        }
    };

    // ============================================================================
    // PERIODIC CLEANUP SYSTEM
    // ============================================================================
    
    const PeriodicCleanup = {
        intervals: new Set(),
        
        startPeriodicCleanup() {
            // Main cleanup interval
            const cleanupInterval = setInterval(() => {
                if (!GuardianState.isEnabled) return;
                
                this.cleanupPersistentElements();
                this.cleanupResidualOverlays();
                this.eliminateWhiteSpaces();
            }, GuardianState.cleanupInterval);
            
            this.intervals.add(cleanupInterval);
            
            // YouTube-specific skip button interval
            if (GuardianState.isYouTube) {
                const skipInterval = setInterval(() => {
                    if (!GuardianState.isEnabled) return;
                    YouTubeBlocker.autoSkipAds();
                }, GuardianState.skipButtonInterval);
                
                this.intervals.add(skipInterval);
            }
            
            console.log('✅ Periodic cleanup started');
        },
        
        cleanupPersistentElements() {
            // Re-process all ad elements to catch any that were missed
            switch (GuardianState.siteType) {
                case 'youtube':
                    YouTubeBlocker.blockAdElements();
                    break;
                case 'news':
                    NewsSiteBlocker.blockAdElements();
                    break;
                case 'streaming':
                    StreamingSiteBlocker.blockAdElements();
                    StreamingSiteBlocker.autoClosePopups();
                    break;
                default:
                    GeneralBlocker.blockAdElements();
                    break;
            }
        },
        
        cleanupResidualOverlays() {
            // Remove any remaining overlays or popups
            const overlaySelectors = [
                '.overlay',
                '.popup',
                '.modal',
                '.dialog',
                '.ad-overlay',
                '.ad-popup',
                '.ad-modal',
                '.ad-dialog'
            ];
            
            overlaySelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (!GuardianState.blockedElements.has(el)) {
                        el.remove();
                        GuardianState.blockedElements.add(el);
                    }
                });
            });
        },
        
        eliminateWhiteSpaces() {
            // Remove empty containers that might create white spaces
            const emptySelectors = [
                'div:empty',
                'span:empty',
                'p:empty',
                'section:empty'
            ];
            
            emptySelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.children.length === 0 && !el.textContent.trim()) {
                        el.remove();
                    }
                });
            });
        },
        
        stopPeriodicCleanup() {
            this.intervals.forEach(interval => clearInterval(interval));
            this.intervals.clear();
            console.log('✅ Periodic cleanup stopped');
        }
    };

    // ============================================================================
    // MAIN INITIALIZATION
    // ============================================================================
    
    const GuardianAdBlocker = {
        init() {
            console.log('🚀 Initializing Guardian Ad Blocker Advanced...');
            
            // Detect site type
            GuardianState.currentSite = SiteDetector.detectSite();
            console.log(`📍 Detected site type: ${GuardianState.siteType}`);
            
            // Initialize site-specific blocking
            this.initializeSiteSpecificBlocking();
            
            // Setup dynamic cleanup
            DynamicCleanup.setupMutationObserver();
            
            // Start periodic cleanup
            PeriodicCleanup.startPeriodicCleanup();
            
            // Setup message listeners
            this.setupMessageListeners();
            
            console.log('✅ Guardian Ad Blocker Advanced initialized successfully');
        },
        
        initializeSiteSpecificBlocking() {
            switch (GuardianState.siteType) {
                case 'youtube':
                    YouTubeBlocker.injectCSS();
                    YouTubeBlocker.blockAdElements();
                    break;
                case 'news':
                    NewsSiteBlocker.blockAdElements();
                    break;
                case 'streaming':
                    StreamingSiteBlocker.blockAdElements();
                    StreamingSiteBlocker.autoDenyNotifications();
                    StreamingSiteBlocker.autoClosePopups();
                    break;
                default:
                    GeneralBlocker.blockAdElements();
                    break;
            }
        },
        
        setupMessageListeners() {
            chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
                if (message.type === 'TOGGLE_CHANGED') {
                    GuardianState.isEnabled = message.enabled;
                    
                    if (GuardianState.isEnabled) {
                        this.initializeSiteSpecificBlocking();
                        DynamicCleanup.setupMutationObserver();
                        PeriodicCleanup.startPeriodicCleanup();
                    } else {
                        this.cleanup();
                    }
                    
                    sendResponse({ success: true });
                }
            });
        },
        
        cleanup() {
            if (GuardianState.isYouTube) {
                YouTubeBlocker.removeCSS();
            }
            
            DynamicCleanup.cleanup();
            PeriodicCleanup.stopPeriodicCleanup();
            
            // Clear blocked elements set
            GuardianState.blockedElements.clear();
            
            console.log('✅ Guardian Ad Blocker cleanup completed');
        }
    };

    // ============================================================================
    // STARTUP
    // ============================================================================
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            GuardianAdBlocker.init();
        });
    } else {
        GuardianAdBlocker.init();
    }
    
    // Fallback initialization
    window.addEventListener('load', () => {
        if (!GuardianState.currentSite) {
            GuardianAdBlocker.init();
        }
    });

})();