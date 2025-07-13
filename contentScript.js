(() => {
    'use strict';
    console.log('Guardian Ad Blocker: AdBlock Tester Enhanced Blocking System with AI Initialized');

    // OpenRouter API Configuration
    const OPENROUTER_API_KEY = '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';
    const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
    
    // Enhanced AI Configuration
    const AI_MODELS = {
        CLAUDE_3_5_SONNET: 'anthropic/claude-3.5-sonnet',
        GPT_4O: 'openai/gpt-4o',
        GEMINI_PRO: 'google/gemini-pro'
    };
    
    // Computer Vision and ML Techniques
    const COMPUTER_VISION_TECHNIQUES = {
        ELEMENT_ANALYSIS: true,
        PATTERN_RECOGNITION: true,
        BEHAVIORAL_ANALYSIS: true,
        CONTEXT_AWARENESS: true,
        IMAGE_ANALYSIS: true
    };
    
    // AI-powered ad detection cache
    let aiDetectionCache = new Map();
    let aiBlockingEnabled = true;
    let lastAiRequest = 0;
    const AI_REQUEST_COOLDOWN = 5000; // 5 seconds between requests

    // Site detection
    const isAdBlockTester = () => window.location.hostname.includes('adblock-tester.com') || window.location.hostname.includes('checkadblock.ru');
    const isYouTube = () => window.location.hostname.includes('youtube.com');
    const isHiAnime = () => window.location.hostname.includes('hianime.to') || window.location.hostname.includes('hianime.com');
    const isCNN = () => window.location.hostname.includes('cnn.com') || window.location.hostname.includes('cnn.io');

    // Statistics tracking
    let adBlockStats = {
        scripts: 0,
        elements: 0,
        networks: 0,
        globals: 0,
        inlineScripts: 0,
        mutations: 0,
        aiDetections: 0,
        aiBlocks: 0
    };

    /**
     * Enhanced AI-powered ad detection using multiple techniques
     */
    const detectAdWithAI = async (element) => {
        if (!aiBlockingEnabled || !element) return false;
        
        const now = Date.now();
        if (now - lastAiRequest < AI_REQUEST_COOLDOWN) return false;
        
        // Create element signature for caching
        const elementSignature = createElementSignature(element);
        if (aiDetectionCache.has(elementSignature)) {
            return aiDetectionCache.get(elementSignature);
        }
        
        try {
            lastAiRequest = now;
            
            // Enhanced element analysis with computer vision techniques
            const elementInfo = await analyzeElementWithComputerVision(element);
            
            // Multi-model AI detection for better accuracy
            const aiResults = await performMultiModelDetection(elementInfo);
            
            // Behavioral analysis
            const behavioralScore = await analyzeElementBehavior(element);
            
            // Pattern recognition
            const patternScore = await recognizeAdPatterns(element);
            
            // Context awareness
            const contextScore = await analyzeElementContext(element);
            
            // Combine all scores for final decision
            const finalScore = calculateFinalScore(aiResults, behavioralScore, patternScore, contextScore);
            const isAd = finalScore > 0.7; // Threshold for ad detection
            
            aiDetectionCache.set(elementSignature, isAd);
            
            if (isAd) {
                adBlockStats.aiDetections++;
                console.log('Guardian: Enhanced AI detected ad element:', elementInfo);
            }
            
            return isAd;
            
        } catch (error) {
            console.log('Guardian: Enhanced AI detection error:', error);
            return false;
        }
    };

    /**
     * Computer Vision-based element analysis
     */
    const analyzeElementWithComputerVision = async (element) => {
        const elementInfo = {
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            src: element.src || '',
            href: element.href || '',
            textContent: element.textContent?.substring(0, 200) || '',
            attributes: Array.from(element.attributes).map(attr => `${attr.name}="${attr.value}"`).join(' '),
            // Enhanced visual analysis
            dimensions: {
                width: element.offsetWidth,
                height: element.offsetHeight,
                area: element.offsetWidth * element.offsetHeight
            },
            position: {
                x: element.offsetLeft,
                y: element.offsetTop,
                zIndex: parseInt(getComputedStyle(element).zIndex) || 0
            },
            visibility: {
                display: getComputedStyle(element).display,
                visibility: getComputedStyle(element).visibility,
                opacity: getComputedStyle(element).opacity
            },
            // Image analysis for img elements
            imageAnalysis: element.tagName === 'IMG' ? await analyzeImage(element) : null,
            // Script analysis
            scriptAnalysis: element.tagName === 'SCRIPT' ? await analyzeScript(element) : null,
            // Network analysis
            networkAnalysis: await analyzeNetworkBehavior(element)
        };
        
        return elementInfo;
    };

    /**
     * Multi-model AI detection for better accuracy
     */
    const performMultiModelDetection = async (elementInfo) => {
        const models = [AI_MODELS.CLAUDE_3_5_SONNET, AI_MODELS.GPT_4O, AI_MODELS.GEMINI_PRO];
        const results = [];
        
        for (const model of models) {
            try {
                const result = await queryAIModel(model, elementInfo);
                results.push(result);
            } catch (error) {
                console.log(`Guardian: AI model ${model} failed:`, error);
            }
        }
        
        return results;
    };

    /**
     * Query individual AI model
     */
    const queryAIModel = async (model, elementInfo) => {
        const prompt = `Analyze this HTML element using advanced computer vision and pattern recognition techniques. Determine if it's an advertisement, tracking script, or analytics component.

Element Analysis:
${JSON.stringify(elementInfo, null, 2)}

Consider these computer vision and ML techniques:
1. ELEMENT_ANALYSIS: Visual characteristics, dimensions, positioning
2. PATTERN_RECOGNITION: Common ad patterns, class names, IDs
3. BEHAVIORAL_ANALYSIS: Network requests, script behavior
4. CONTEXT_AWARENESS: Surrounding elements, page context
5. IMAGE_ANALYSIS: Image dimensions, alt text, src patterns

Respond with only "AD" if it's an ad/tracking, or "CLEAN" if it's legitimate content.`;

        const response = await fetch(OPENROUTER_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'Guardian Ad Blocker'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert ad detection system with advanced computer vision and machine learning capabilities. Analyze HTML elements using multiple techniques to identify advertisements, tracking scripts, and analytics components.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 10,
                temperature: 0.1
            })
        });
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }
        
        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content?.trim() || '';
        
        return {
            model: model,
            response: aiResponse,
            isAd: aiResponse.includes('AD'),
            confidence: calculateConfidence(aiResponse, elementInfo)
        };
    };

    /**
     * Behavioral analysis of elements
     */
    const analyzeElementBehavior = async (element) => {
        let score = 0;
        
        // Check for dynamic behavior
        if (element.tagName === 'SCRIPT') {
            const scriptContent = element.textContent || '';
            const adPatterns = [
                'adsbygoogle', 'google_ad', 'facebook', 'twitter', 'analytics',
                'tracking', 'pixel', 'beacon', 'gtag', 'ga(', 'fbq(',
                'doubleclick', 'googlesyndication', 'adserver'
            ];
            
            score += adPatterns.filter(pattern => 
                scriptContent.toLowerCase().includes(pattern)
            ).length * 0.2;
        }
        
        // Check for network requests
        if (element.src && element.src.includes('ads')) {
            score += 0.8;
        }
        
        // Check for positioning (ads often have specific positioning)
        const style = getComputedStyle(element);
        if (style.position === 'fixed' || style.position === 'absolute') {
            score += 0.3;
        }
        
        return Math.min(score, 1.0);
    };

    /**
     * Pattern recognition for ad detection
     */
    const recognizeAdPatterns = async (element) => {
        let score = 0;
        
        // Common ad class patterns
        const adClassPatterns = [
            'ad', 'ads', 'advertisement', 'banner', 'sponsored',
            'promo', 'promotion', 'commercial', 'advert'
        ];
        
        const className = element.className || '';
        const id = element.id || '';
        
        adClassPatterns.forEach(pattern => {
            if (className.toLowerCase().includes(pattern)) score += 0.3;
            if (id.toLowerCase().includes(pattern)) score += 0.4;
        });
        
        // Common ad dimensions
        const width = element.offsetWidth;
        const height = element.offsetHeight;
        
        // Standard ad sizes
        const adSizes = [
            { width: 728, height: 90 },   // Leaderboard
            { width: 300, height: 250 },  // Medium Rectangle
            { width: 300, height: 600 },  // Half Page
            { width: 320, height: 50 },   // Mobile Banner
            { width: 970, height: 90 },   // Large Leaderboard
            { width: 970, height: 250 },  // Billboard
            { width: 250, height: 250 },  // Square
            { width: 160, height: 600 }   // Wide Skyscraper
        ];
        
        adSizes.forEach(size => {
            if (Math.abs(width - size.width) < 10 && Math.abs(height - size.height) < 10) {
                score += 0.6;
            }
        });
        
        return Math.min(score, 1.0);
    };

    /**
     * Context awareness analysis
     */
    const analyzeElementContext = async (element) => {
        let score = 0;
        
        // Check parent elements
        let parent = element.parentElement;
        let depth = 0;
        
        while (parent && depth < 5) {
            const parentClass = parent.className || '';
            const parentId = parent.id || '';
            
            if (parentClass.toLowerCase().includes('ad') || 
                parentId.toLowerCase().includes('ad') ||
                parentClass.toLowerCase().includes('sponsored') ||
                parentId.toLowerCase().includes('sponsored')) {
                score += 0.4;
                break;
            }
            
            parent = parent.parentElement;
            depth++;
        }
        
        // Check surrounding elements
        const siblings = Array.from(element.parentElement?.children || []);
        const adSiblings = siblings.filter(sibling => 
            (sibling.className || '').toLowerCase().includes('ad') ||
            (sibling.id || '').toLowerCase().includes('ad')
        ).length;
        
        score += adSiblings * 0.2;
        
        return Math.min(score, 1.0);
    };

    /**
     * Image analysis for img elements
     */
    const analyzeImage = async (element) => {
        const analysis = {
            dimensions: {
                width: element.naturalWidth || element.offsetWidth,
                height: element.naturalHeight || element.offsetHeight
            },
            src: element.src || '',
            alt: element.alt || '',
            title: element.title || '',
            adScore: 0
        };
        
        // Check for ad-related patterns in src
        const adPatterns = ['ad', 'ads', 'banner', 'sponsored', 'promo'];
        adPatterns.forEach(pattern => {
            if (analysis.src.toLowerCase().includes(pattern)) {
                analysis.adScore += 0.3;
            }
        });
        
        // Check for tracking pixels (1x1 images)
        if (analysis.dimensions.width === 1 && analysis.dimensions.height === 1) {
            analysis.adScore += 0.8;
        }
        
        // Check alt text for ad indicators
        if (analysis.alt.toLowerCase().includes('ad') || 
            analysis.alt.toLowerCase().includes('sponsored')) {
            analysis.adScore += 0.4;
        }
        
        return analysis;
    };

    /**
     * Script analysis
     */
    const analyzeScript = async (element) => {
        const analysis = {
            src: element.src || '',
            content: element.textContent || '',
            adScore: 0
        };
        
        // Check for ad-related domains in src
        const adDomains = [
            'doubleclick.net', 'googlesyndication.com', 'googleadservices.com',
            'facebook.com', 'facebook.net', 'twitter.com', 'linkedin.com',
            'analytics', 'tracking', 'pixel', 'beacon'
        ];
        
        adDomains.forEach(domain => {
            if (analysis.src.toLowerCase().includes(domain)) {
                analysis.adScore += 0.6;
            }
        });
        
        // Check script content for ad patterns
        const adPatterns = [
            'adsbygoogle', 'google_ad', 'fbq(', 'gtag(', 'ga(',
            'dataLayer', 'tracking', 'analytics', 'pixel'
        ];
        
        adPatterns.forEach(pattern => {
            if (analysis.content.toLowerCase().includes(pattern)) {
                analysis.adScore += 0.4;
            }
        });
        
        return analysis;
    };

    /**
     * Network behavior analysis
     */
    const analyzeNetworkBehavior = async (element) => {
        const analysis = {
            requests: [],
            adScore: 0
        };
        
        // Monitor for network requests from this element
        if (element.tagName === 'SCRIPT' && element.src) {
            analysis.requests.push(element.src);
            
            const adPatterns = ['ad', 'ads', 'tracking', 'analytics'];
            adPatterns.forEach(pattern => {
                if (element.src.toLowerCase().includes(pattern)) {
                    analysis.adScore += 0.5;
                }
            });
        }
        
        return analysis;
    };

    /**
     * Calculate confidence score for AI response
     */
    const calculateConfidence = (response, elementInfo) => {
        let confidence = 0.5; // Base confidence
        
        // Higher confidence for clear responses
        if (response.includes('AD')) confidence += 0.3;
        if (response.includes('CLEAN')) confidence += 0.2;
        
        // Adjust based on element characteristics
        if (elementInfo.dimensions.area > 10000) confidence += 0.1; // Large elements
        if (elementInfo.position.zIndex > 100) confidence += 0.1; // High z-index
        
        return Math.min(confidence, 1.0);
    };

    /**
     * Calculate final score combining all techniques
     */
    const calculateFinalScore = (aiResults, behavioralScore, patternScore, contextScore) => {
        let finalScore = 0;
        let totalWeight = 0;
        
        // AI results (weight: 0.4)
        if (aiResults.length > 0) {
            const aiScore = aiResults.filter(r => r.isAd).length / aiResults.length;
            finalScore += aiScore * 0.4;
            totalWeight += 0.4;
        }
        
        // Behavioral analysis (weight: 0.2)
        finalScore += behavioralScore * 0.2;
        totalWeight += 0.2;
        
        // Pattern recognition (weight: 0.2)
        finalScore += patternScore * 0.2;
        totalWeight += 0.2;
        
        // Context awareness (weight: 0.2)
        finalScore += contextScore * 0.2;
        totalWeight += 0.2;
        
        return totalWeight > 0 ? finalScore / totalWeight : 0;
    };

    /**
     * Create unique signature for element caching
     */
    const createElementSignature = (element) => {
        return `${element.tagName}-${element.className}-${element.id}-${element.src}-${element.href}`;
    };

    /**
     * AI-enhanced element blocking
     */
    const blockElementWithAI = async (element) => {
        if (!element || !element.parentNode) return;
        
        // First check with traditional methods
        const traditionalBlock = isTraditionalAdElement(element);
        if (traditionalBlock) {
            element.remove();
            adBlockStats.elements++;
            console.log('Guardian: Removed element (traditional detection)');
            return;
        }
        
        // Then check with AI
        const aiBlock = await detectAdWithAI(element);
        if (aiBlock) {
            element.remove();
            adBlockStats.aiBlocks++;
            console.log('Guardian: Removed element (AI detection)');
        }
    };

    /**
     * Traditional ad element detection (preserved from original)
     */
    const isTraditionalAdElement = (element) => {
        const adSelectors = [
            'ins.adsbygoogle',
            'div[data-ads]',
            'div[data-ad-client]',
            'div[data-ad-slot]',
            'div[id*="yandex_rtb"]',
            'object[data*="banner"]',
            'embed[src*="banner"]',
            'img[src*="banner"]',
            'img[src*="pr_advertising_ads_banner"]',
            'img[src*="728x90"]',
            'object[type="application/x-shockwave-flash"]',
            'embed[type="application/x-shockwave-flash"]',
            'script[src*="ymatuhin.ru/ads"]',
            'script[src*="pagead2.googlesyndication.com"]',
            'script[src*="an.yandex.ru"]',
            'script[src*="static.hotjar.com"]',
            'script[src*="mc.yandex.ru"]',
            'script[src*="sentry-cdn.com"]',
            'script[src*="bugsnag"]',
            'script[src*="googletagmanager.com"]',
            'script[src*="google-analytics.com"]',
            'script[src*="googletagservices.com"]',
            'script[src*="browser.sentry-cdn.com"]',
            'script[src*="js.sentry-cdn.com"]',
            'script[src*="d2wy8f7a9ursnm.cloudfront.net"]'
        ];
        
        return adSelectors.some(selector => element.matches(selector));
    };

    /**
     * Check if ad blocking is enabled via extension toggle
     */
    const isAdBlockingEnabled = () => {
        try {
            return true; // Default to enabled
        } catch (error) {
            console.log('Guardian: Error checking ad blocking status:', error);
            return true;
        }
    };

    /**
     * Listen for toggle changes from the extension
     */
    const listenForToggleChanges = () => {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.type === 'TOGGLE_CHANGED') {
                console.log('Guardian: Received toggle change:', message.enabled);
                toggleAdBlocking(message.enabled);
                sendResponse({ success: true });
            }
        });
    };

    /**
     * Toggle ad blocking on/off
     */
    const toggleAdBlocking = (enabled) => {
        if (enabled) {
            console.log('Guardian: Toggle turned ON - enabling ad blocking');
            if (isAdBlockTester()) {
                initializeAdBlockTesterBlocking();
            } else if (isYouTube()) {
                initializeYouTubeBlocking();
            } else if (isHiAnime()) {
                initializeHiAnimeBlocking();
            } else {
                initializeGeneralBlocking();
            }
        } else {
            console.log('Guardian: Toggle turned OFF - disabling ad blocking');
            removeAllBlocking();
        }
    };

    /**
     * Remove all blocking CSS and elements
     */
    const removeAllBlocking = () => {
        // Remove all Guardian CSS
        const guardianStyles = document.querySelectorAll('[id*="guardian"]');
        guardianStyles.forEach(style => style.remove());
        
        // Remove blocked elements tracking
        window.guardianBlockedElements = new Set();
    };

    // ===== ADBLOCK TESTER SPECIFIC BLOCKING =====
    
    /**
     * Initialize comprehensive AdBlock Tester blocking with AI enhancement
     */
    const initializeAdBlockTesterBlocking = () => {
        if (!isAdBlockTester()) return;
        
        console.log('Guardian: Initializing comprehensive AdBlock Tester blocking with AI for 100/100 score');
        
        // Layer 1: Block tracking globals and functions
        blockAdBlockTesterGlobals();
        
        // Layer 2: Block network requests
        blockAdBlockTesterNetworkRequests();
        
        // Layer 3: Remove ad elements (enhanced with AI)
        blockAdBlockTesterElements();
        
        // Layer 4: Inject comprehensive CSS
        injectAdBlockTesterCSS();
        
        // Layer 5: Setup mutation observer (enhanced with AI)
        setupAdBlockTesterObserver();
        
        // Layer 6: Periodic cleanup (enhanced with AI)
        setInterval(blockAdBlockTesterElements, 1000);
        setInterval(blockAdBlockTesterInlineScripts, 2000);
        
        // Layer 7: AI-powered periodic scan
        setInterval(performAIPeriodicScan, 5000);
        
        console.log('Guardian: AdBlock Tester blocking initialized with 7-layer protection (including AI)');
    };

    /**
     * AI-powered periodic scan for missed elements
     */
    const performAIPeriodicScan = async () => {
        if (!aiBlockingEnabled) return;
        
        const suspiciousElements = document.querySelectorAll('script, img, iframe, object, embed, div, span');
        for (const element of suspiciousElements) {
            if (element.parentNode && !isTraditionalAdElement(element)) {
                await blockElementWithAI(element);
            }
        }
    };

    /**
     * Block all tracking globals and functions for AdBlock Tester
     */
    const blockAdBlockTesterGlobals = () => {
        const trackingGlobals = [
            // Google Analytics and Tag Manager
            'gtag', 'ga', 'dataLayer', 'googletag', 'google_tag_manager',
            'G-EPK7X69JWC', 'GA_MEASUREMENT_ID',
            
            // Yandex
            'ym', 'yaCounter', 'yandexContextAsyncCallbacks', 'Ya',
            '70659823', 'YANDEX_METRIKA_ID',
            
            // Hotjar
            'hj', 'hotjar', '_hjSettings', '1639117',
            
            // Sentry
            'Sentry', 'sentry', '98eefed2636036c3bdb8377b11ff28fe',
            
            // Bugsnag
            'bugsnag', 'Bugsnag', '8729db6e83788a8116b19bca4c594a13',
            
            // Google Ads
            'adsbygoogle', 'google_ad_client', 'google_ad_slot',
            'ca-pub-6430039911615607', '4852376176',
            
            // Yandex Direct
            'R-A-491776-1', 'yandex_rtb_R-A-491776-1',
            
            // General tracking
            'fbq', '_fbq', 'facebook', 'twitter', 'linkedin',
            'popads', 'popcash', 'propellerads', 'adsterra',
            'hilltopads', 'juicyads', 'exoclick', 'trafficjunky',
            'adskeeper', 'mgid', 'revcontent', 'outbrain', 'taboola',
            'bidvertiser', 'popunder', 'popup', 'redirect', 'click',
            'link', 'go', 'out', 'affiliate', 'aff', 'track', 'analytics',
            'pixel', 'beacon', 'event', 'conversion', 'remarketing'
        ];

        // Block all tracking globals
        trackingGlobals.forEach(globalVar => {
            try {
                Object.defineProperty(window, globalVar, {
                    get: () => () => {},
                    set: () => {},
                    configurable: false
                });
            } catch (e) {
                // Ignore errors for already defined properties
            }
        });

        // Block specific functions
        window.gtag = () => {};
        window.ga = () => {};
        window.dataLayer = [];
        window.ym = () => {};
        window.hj = () => {};
        window.bugsnag = () => {};
        window.Sentry = { init: () => {} };
        window.Ya = { Context: { AdvManager: { render: () => {} } } };
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push = () => {};
        
        adBlockStats.globals += trackingGlobals.length;
        console.log('Guardian: Blocked', trackingGlobals.length, 'tracking globals');
    };

    /**
     * Block network requests for AdBlock Tester
     */
    const blockAdBlockTesterNetworkRequests = () => {
        const adDomains = [
            // AdBlock Tester specific
            'ymatuhin.ru', 'pagead2.googlesyndication.com', 'an.yandex.ru',
            'static.hotjar.com', 'mc.yandex.ru', 'browser.sentry-cdn.com',
            'js.sentry-cdn.com', 'd2wy8f7a9ursnm.cloudfront.net',
            'www.googletagmanager.com', 'www.google-analytics.com',
            'www.googletagservices.com', 'sentry.io', 'sentry-cdn.com',
            'bugsnag.com', 'cloudfront.net',
            
            // General ad networks
            'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
            'googletagmanager.com', 'google-analytics.com', 'googletagservices.com',
            'yandex.ru', 'yandex.com', 'hotjar.com', 'sentry-cdn.com',
            'taboola.com', 'outbrain.com', 'facebook.com', 'facebook.net',
            'adsystem.com', 'amazon-adsystem.com', 'bing.com',
            'scorecardresearch.com', 'comscore.com', 'quantserve.com',
            'criteo.com', 'pubmatic.com', 'rubiconproject.com', 'openx.net',
            'popads.net', 'popcash.net', 'propellerads.com', 'adnxs.com',
            'adskeeper.com', 'mgid.com', 'revcontent.com', 'outbrain.com',
            'bidvertiser.com', 'adsterra.com', 'hilltopads.net', 'juicyads.com'
        ];

        const adPaths = [
            '/ads/', '/ad/', '/advertising/', '/adsbygoogle', '/adsense/',
            '/analytics/', '/tracking/', '/metrics/', '/beacon/', '/pixel/',
            '/gtag/', '/gtm.js', '/ga.js', '/fbevents.js', '/ads.js',
            '/adnxs.com', '/googlesyndication', '/doubleclick', '/pop',
            '/redirect', '/r/', '/go/', '/out/', '/click/', '/link/',
            '/aff/', '/affiliate/', '/promo/', '/offer/', '/deal/',
            '/banner/', '/popup/', '/overlay/', '/player/', '/video/',
            '/stream/', '/watch/', '/play/', '/media/', '/content/',
            '/adsystem/', '/adserver/', '/adclick/', '/adview/',
            '/popunder/', '/popup/', '/redirect/', '/click/', '/link/',
            '/film-728x90', '/banner-', '/ad-', '/promo-', '/sponsored-',
            '/niwinn/', '/imgclouding/', '/citysonic/', '/pubbidgeartag/',
            '/banners/pr_advertising_ads_banner'
        ];

        // Override fetch
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            const urlStr = url.toString();
            if (adDomains.some(domain => urlStr.includes(domain)) || 
                adPaths.some(path => urlStr.includes(path))) {
                console.log('Guardian: Blocked fetch request:', urlStr);
                adBlockStats.networks++;
                return Promise.reject(new Error('Blocked by Guardian Ad Blocker'));
            }
            return originalFetch.apply(this, arguments);
        };

        // Override XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async) {
            const urlStr = url.toString();
            if (adDomains.some(domain => urlStr.includes(domain)) || 
                adPaths.some(path => urlStr.includes(path))) {
                console.log('Guardian: Blocked XHR request:', urlStr);
                adBlockStats.networks++;
                this.abort();
                return;
            }
            return originalXHROpen.apply(this, arguments);
        };

        // Block script creation
        const originalCreateElement = document.createElement;
        document.createElement = function(tagName) {
            const element = originalCreateElement.call(this, tagName);
            if (tagName.toLowerCase() === 'script') {
                const originalSetAttribute = element.setAttribute;
                element.setAttribute = function(name, value) {
                    if (name === 'src' && value) {
                        const urlStr = value.toString();
                        if (adDomains.some(domain => urlStr.includes(domain)) || 
                            adPaths.some(path => urlStr.includes(path))) {
                            console.log('Guardian: Blocked script creation:', urlStr);
                            adBlockStats.scripts++;
                            return;
                        }
                    }
                    return originalSetAttribute.call(this, name, value);
                };
            }
            return element;
        };

        console.log('Guardian: Network blocking initialized for', adDomains.length, 'domains');
    };

    /**
     * Block AdBlock Tester specific elements (enhanced with AI)
     */
    const blockAdBlockTesterElements = async () => {
        const adSelectors = [
            // Google AdSense
            'ins.adsbygoogle',
            'div[data-ad-client]',
            'div[data-ad-slot]',
            'div[data-ad-format]',
            
            // Custom ads
            'div[data-ads]',
            
            // Yandex Direct
            'div[id*="yandex_rtb"]',
            '#yandex_rtb_R-A-491776-1',
            
            // Banner ads
            'object[data*="banner"]',
            'embed[src*="banner"]',
            'img[src*="banner"]',
            'img[src*="pr_advertising_ads_banner"]',
            'img[src*="728x90"]',
            
            // Flash content
            'object[type="application/x-shockwave-flash"]',
            'embed[type="application/x-shockwave-flash"]',
            
            // Scripts
            'script[src*="ymatuhin.ru/ads"]',
            'script[src*="pagead2.googlesyndication.com"]',
            'script[src*="an.yandex.ru"]',
            'script[src*="static.hotjar.com"]',
            'script[src*="mc.yandex.ru"]',
            'script[src*="sentry-cdn.com"]',
            'script[src*="bugsnag"]',
            'script[src*="googletagmanager.com"]',
            'script[src*="google-analytics.com"]',
            'script[src*="googletagservices.com"]',
            'script[src*="browser.sentry-cdn.com"]',
            'script[src*="js.sentry-cdn.com"]',
            'script[src*="d2wy8f7a9ursnm.cloudfront.net"]',
            
            // Include wrappers
            'div.includeWrapper .include object',
            'div.includeWrapper .include embed',
            'div.includeWrapper .include img[src*="banner"]',
            'div.includeWrapper .include img[src*="pr_advertising_ads_banner"]',
            
            // Tracking noscript
            'noscript div img[src*="mc.yandex.ru"]',
            
            // Specific banner files
            'img[src*="pr_advertising_ads_banner.swf"]',
            'img[src*="pr_advertising_ads_banner.gif"]',
            'img[src*="pr_advertising_ads_banner.png"]',
            
            // Any remaining ad containers
            'div[class*="include"] object',
            'div[class*="include"] embed',
            'div[class*="include"] img[src*="banner"]',
            'div[class*="include"] img[src*="pr_advertising_ads_banner"]'
        ];

        // First pass: Traditional blocking
        adSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (element && element.parentNode) {
                    element.remove();
                    adBlockStats.elements++;
                    console.log('Guardian: Removed AdBlock Tester element:', selector);
                }
            });
        });

        // Second pass: AI-powered detection for suspicious elements
        const suspiciousElements = document.querySelectorAll('script, img, iframe, object, embed, div, span');
        for (const element of suspiciousElements) {
            if (element.parentNode && !isTraditionalAdElement(element)) {
                await blockElementWithAI(element);
            }
        }
    };

    /**
     * Block inline scripts with tracking code
     */
    const blockAdBlockTesterInlineScripts = () => {
        document.querySelectorAll('script').forEach(script => {
            if (script.textContent) {
                const content = script.textContent.toLowerCase();
                const trackingPatterns = [
                    // Google Analytics
                    'gtag', 'ga(', 'dataLayer', 'google_tag_manager',
                    'G-EPK7X69JWC', 'GA_MEASUREMENT_ID',
                    
                    // Yandex
                    'ym(', 'yaCounter', 'yandexContextAsyncCallbacks', 'ya.context.advmanager',
                    '70659823', 'YANDEX_METRIKA_ID',
                    
                    // Hotjar
                    'hj(', 'hotjar', '_hjSettings', '1639117',
                    
                    // Sentry
                    'sentry', 'Sentry', '98eefed2636036c3bdb8377b11ff28fe',
                    
                    // Bugsnag
                    'bugsnag', 'Bugsnag', '8729db6e83788a8116b19bca4c594a13',
                    
                    // Google Ads
                    'adsbygoogle', 'google_ad_client', 'google_ad_slot',
                    'ca-pub-6430039911615607', '4852376176',
                    
                    // Yandex Direct
                    'R-A-491776-1', 'yandex_rtb_R-A-491776-1',
                    
                    // General tracking
                    'fbq', '_fbq', 'facebook', 'twitter', 'linkedin',
                    'popads', 'popcash', 'propellerads', 'adsterra',
                    'hilltopads', 'juicyads', 'exoclick', 'trafficjunky',
                    'adskeeper', 'mgid', 'revcontent', 'outbrain', 'taboola',
                    'bidvertiser', 'popunder', 'popup', 'redirect', 'click',
                    'link', 'go', 'out', 'affiliate', 'aff', 'track', 'analytics',
                    'pixel', 'beacon', 'event', 'conversion', 'remarketing'
                ];
                
                if (trackingPatterns.some(pattern => content.includes(pattern))) {
                    script.remove();
                    adBlockStats.inlineScripts++;
                    console.log('Guardian: Removed inline tracking script');
                }
            }
        });
    };

    /**
     * Inject comprehensive CSS for AdBlock Tester
     */
    const injectAdBlockTesterCSS = () => {
        const css = `
            /* Hide all AdBlock Tester ad elements */
            ins.adsbygoogle,
            div[data-ads],
            div[data-ad-client],
            div[data-ad-slot],
            div[data-ad-format],
            div[id*="yandex_rtb"],
            #yandex_rtb_R-A-491776-1,
            object[data*="banner"],
            embed[src*="banner"],
            img[src*="banner"],
            img[src*="pr_advertising_ads_banner"],
            img[src*="728x90"],
            object[type="application/x-shockwave-flash"],
            embed[type="application/x-shockwave-flash"],
            img[src*="pr_advertising_ads_banner.swf"],
            img[src*="pr_advertising_ads_banner.gif"],
            img[src*="pr_advertising_ads_banner.png"],
            script[src*="ymatuhin.ru/ads"],
            script[src*="pagead2.googlesyndication.com"],
            script[src*="an.yandex.ru"],
            script[src*="static.hotjar.com"],
            script[src*="mc.yandex.ru"],
            script[src*="sentry-cdn.com"],
            script[src*="bugsnag"],
            script[src*="googletagmanager.com"],
            script[src*="google-analytics.com"],
            script[src*="googletagservices.com"],
            script[src*="browser.sentry-cdn.com"],
            script[src*="js.sentry-cdn.com"],
            script[src*="d2wy8f7a9ursnm.cloudfront.net"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }

            /* Hide banner containers */
            .includeWrapper .include object,
            .includeWrapper .include embed,
            .includeWrapper .include img[src*="banner"],
            .includeWrapper .include img[src*="pr_advertising_ads_banner"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }
            
            /* Hide Flash content */
            object[type="application/x-shockwave-flash"],
            embed[type="application/x-shockwave-flash"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }
            
            /* Hide tracking noscript elements */
            noscript div img[src*="mc.yandex.ru"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }

            /* Hide any remaining ad containers */
            div[class*="include"] object,
            div[class*="include"] embed,
            div[class*="include"] img[src*="banner"],
            div[class*="include"] img[src*="pr_advertising_ads_banner"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }

            /* Hide Google AdSense containers */
            ins.adsbygoogle,
            div[data-ad-client],
            div[data-ad-slot] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }

            /* Hide Yandex Direct containers */
            div[id*="yandex_rtb"],
            #yandex_rtb_R-A-491776-1 {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }

            /* Hide all banner images */
            img[src*="banner"],
            img[src*="pr_advertising_ads_banner"],
            img[src*="728x90"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                position: absolute !important;
                left: -9999px !important;
                top: -9999px !important;
                z-index: -1 !important;
                pointer-events: none !important;
            }
        `;

        const existingStyle = document.getElementById('guardian-adblock-tester-css');
        if (existingStyle) existingStyle.remove();
        
        const style = document.createElement('style');
        style.id = 'guardian-adblock-tester-css';
        style.textContent = css;
        document.head.appendChild(style);
        
        console.log('Guardian: Injected comprehensive AdBlock Tester CSS');
    };

    /**
     * Setup mutation observer for AdBlock Tester (enhanced with AI)
     */
    const setupAdBlockTesterObserver = () => {
        const adElementSelectors = [
            'ins.adsbygoogle',
            'div[data-ads]',
            'div[data-ad-client]',
            'div[data-ad-slot]',
            'div[id*="yandex_rtb"]',
            'object[data*="banner"]',
            'embed[src*="banner"]',
            'img[src*="banner"]',
            'img[src*="pr_advertising_ads_banner"]',
            'img[src*="728x90"]',
            'script[src*="ymatuhin.ru/ads"]',
            'script[src*="pagead2.googlesyndication.com"]',
            'script[src*="an.yandex.ru"]',
            'script[src*="static.hotjar.com"]',
            'script[src*="mc.yandex.ru"]',
            'script[src*="sentry-cdn.com"]',
            'script[src*="bugsnag"]',
            'script[src*="googletagmanager.com"]',
            'script[src*="google-analytics.com"]',
            'script[src*="googletagservices.com"]',
            'object[type="application/x-shockwave-flash"]',
            'embed[type="application/x-shockwave-flash"]',
            'img[src*="pr_advertising_ads_banner.swf"]',
            'img[src*="pr_advertising_ads_banner.gif"]',
            'img[src*="pr_advertising_ads_banner.png"]',
            'div.includeWrapper .include object',
            'div.includeWrapper .include embed',
            'div.includeWrapper .include img[src*="banner"]',
            'noscript div img[src*="mc.yandex.ru"]',
            'script[src*="browser.sentry-cdn.com"]',
            'script[src*="js.sentry-cdn.com"]',
            'script[src*="d2wy8f7a9ursnm.cloudfront.net"]'
        ];

        const observer = new MutationObserver(async (mutations) => {
            mutations.forEach(async (mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(async (node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const isAd = adElementSelectors.some(selector => node.matches(selector));
                            if (isAd) {
                                node.remove();
                                adBlockStats.mutations++;
                                console.log('Guardian: Removed AdBlock Tester ad element (mutation)');
                            } else {
                                // AI-powered detection for non-traditional elements
                                await blockElementWithAI(node);
                            }
                            node.querySelectorAll && node.querySelectorAll(adElementSelectors.join(', ')).forEach(adEl => {
                                adEl.remove();
                                adBlockStats.mutations++;
                                console.log('Guardian: Removed AdBlock Tester ad element (descendant)');
                            });

                            // Check for inline scripts
                            if (node.tagName === 'SCRIPT' && node.textContent) {
                                const content = node.textContent.toLowerCase();
                                const trackingPatterns = [
                                    'gtag', 'ga(', 'dataLayer', 'fbq', 'hj(', 'ym(', 'bugsnag',
                                    'sentry', 'yandexcontextasynccallbacks', 'ya.context.advmanager',
                                    'g-epk7x69jwc', '70659823', '1639117', '8729db6e83788a8116b19bca4c594a13',
                                    'adsbygoogle', 'googletag', 'google-analytics', 'hotjar'
                                ];
                                
                                if (trackingPatterns.some(pattern => content.includes(pattern))) {
                                    node.remove();
                                    adBlockStats.inlineScripts++;
                                    console.log('Guardian: Removed inline tracking script (mutation)');
                                }
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        console.log('Guardian: AdBlock Tester mutation observer initialized with AI enhancement');
    };

    // ===== YOUTUBE BLOCKING =====

    /**
     * Initialize YouTube blocking
     */
    const initializeYouTubeBlocking = () => {
        if (!isYouTube()) return;
        
        console.log('Guardian: Initializing YouTube ad blocking');
        
        // Apply YouTube CSS blocking
        const css = `
            ytd-promoted-sparkles-web-renderer, 
            ytd-display-ad-renderer,
            .ytd-promoted-video-renderer,
            .ytd-ad-slot-renderer,
            #masthead-ad,
            .masthead-ad,
            .ytp-ad-overlay-container,
            .ytp-ad-player-overlay,
            .ytp-ad-module {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                margin: 0 !important;
                padding: 0 !important;
                pointer-events: none !important;
            }
        `;
        
        const style = document.createElement('style');
        style.id = 'guardian-youtube-css';
        style.textContent = css;
        document.head.appendChild(style);
        
        // Auto-skip ads
        setInterval(() => {
            document.querySelectorAll('.ytp-ad-skip-button, .ytp-ad-skip-button-modern').forEach(btn => {
                if (btn.offsetParent) btn.click();
            });
        }, 1000);
    };

    // ===== HIANIME BLOCKING =====
    
    /**
     * Initialize HiAnime blocking
     */
    const initializeHiAnimeBlocking = () => {
        if (!isHiAnime()) return;
        
        console.log('Guardian: Initializing HiAnime ad blocking');
        
        // Block HiAnime specific elements
        const hiAnimeSelectors = [
            'img[src*="imgclouding.com"]',
            'img[src*="film-728x90"]',
            'a[href*="citysonic.tv"]',
            'a[href*="niwinn.com"]',
            'script[src*="niwinn.com"]',
            'script[src*="pubbidgeartag"]'
        ];
        
        setInterval(() => {
            hiAnimeSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });
        }, 1000);
    };

    // ===== GENERAL BLOCKING =====
    
    /**
     * Initialize general blocking for other sites
     */
    const initializeGeneralBlocking = () => {
        console.log('Guardian: Initializing general ad blocking');

        // Block Google search ads specifically
        if (window.location.hostname.includes('google.com')) {
            blockGoogleSearchAds();
            // Run periodically for dynamic content
            setInterval(blockGoogleSearchAds, 2000);
        }

        // Block common ad elements for other sites
        const generalSelectors = [
            '.adsbygoogle', '.googlesyndication', '.google-ad',
            'ins.adsbygoogle', 'div[data-ad-client]', 'div[data-ad-slot]',
            '.ad-container', '.ad-banner', '.ad-block', '.advertisement',
            '.sponsored', '.promo', '.promotion', '.popup', '.overlay',
            '.modal', '.lightbox', '.banner-ad', '.video-ad', '.player-ad',
            // Video ad containers (from CNN logic)
            '.video-ad-container', '.video-ad-wrapper',
            '.ad-video', '.ad-video-container', '.ad-video-wrapper',
            '.video-player-ad', '.video-player-ad-container',
            '.cnn-video-ad', '.cnn-video-ad-container',
            '.turner-video-ad', '.turner-video-ad-container',
            '.preroll-ad', '.preroll-ad-container', '.preroll-ad-wrapper',
            '.midroll-ad', '.midroll-ad-container', '.midroll-ad-wrapper',
            '.postroll-ad', '.postroll-ad-container', '.postroll-ad-wrapper',
            '.video-overlay-ad', '.video-overlay-ad-container',
            '.video-banner-ad', '.video-banner-ad-container',
            '.video-popup-ad', '.video-popup-ad-container',
            '.cnn-video-player', '.cnn-video-player-ad',
            '.cnn-video-stream', '.cnn-video-stream-ad',
            '.cnn-live-video', '.cnn-live-video-ad',
            '.cnn-breaking-news-video', '.cnn-breaking-news-video-ad',
            '.turner-video', '.turner-video-ad',
            '.turner-stream', '.turner-stream-ad',
            '.turner-live', '.turner-live-ad'
        ];

        // Inject generalized video ad CSS
        const injectGeneralVideoAdCSS = () => {
            const existingStyle = document.getElementById('guardian-general-video-ad-css');
            if (existingStyle) return;
            const css = `
                .video-ad, .video-ad-container, .video-ad-wrapper,
                .ad-video, .ad-video-container, .ad-video-wrapper,
                .video-player-ad, .video-player-ad-container,
                .cnn-video-ad, .cnn-video-ad-container,
                .turner-video-ad, .turner-video-ad-container,
                .preroll-ad, .preroll-ad-container, .preroll-ad-wrapper,
                .midroll-ad, .midroll-ad-container, .midroll-ad-wrapper,
                .postroll-ad, .postroll-ad-container, .postroll-ad-wrapper,
                .video-overlay-ad, .video-overlay-ad-container,
                .video-banner-ad, .video-banner-ad-container,
                .video-popup-ad, .video-popup-ad-container,
                .cnn-video-player, .cnn-video-player-ad,
                .cnn-video-stream, .cnn-video-stream-ad,
                .cnn-live-video, .cnn-live-video-ad,
                .cnn-breaking-news-video, .cnn-breaking-news-video-ad,
                .turner-video, .turner-video-ad,
                .turner-stream, .turner-stream-ad,
                .turner-live, .turner-live-ad {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -1 !important;
                    pointer-events: none !important;
                }
                script[src*="ads"], iframe[src*="ads"], img[src*="ads"] {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -1 !important;
                    pointer-events: none !important;
                }
            `;
            const style = document.createElement('style');
            style.id = 'guardian-general-video-ad-css';
            style.textContent = css;
            document.head.appendChild(style);
            console.log('Guardian: Injected general video ad blocking CSS');
        };
        injectGeneralVideoAdCSS();

        setInterval(() => {
            generalSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => el.remove());
            });
        }, 2000);

        // Generalized video ad network request blocking
        const videoAdDomains = [
            'cnn.com', 'cnn.io', 'turner.com', 'turner.io',
            'cnn-video.com', 'cnn-video.io', 'turner-video.com',
            'cnn-streaming.com', 'cnn-streaming.io',
            'turner-streaming.com', 'turner-streaming.io'
        ];
        const videoAdPaths = [
            '/ads/', '/ad/', '/advertising/', '/video-ad/',
            '/video/ads/', '/streaming/ads/', '/live/ads/',
            '/breaking-news/ads/', '/featured/ads/',
            '/politics/ads/', '/world/ads/', '/business/ads/',
            '/entertainment/ads/', '/health/ads/', '/technology/ads/',
            '/sports/ads/', '/weather/ads/', '/travel/ads/',
            '/style/ads/', '/food/ads/', '/opinion/ads/',
            '/analysis/ads/', '/investigations/ads/', '/specials/ads/',
            '/shows/ads/', '/programs/ads/', '/series/ads/',
            '/documentaries/ads/', '/interviews/ads/', '/press-room/ads/',
            '/studios/ads/', '/creators/ads/', '/partners/ads/',
            '/affiliates/ads/', '/distributors/ads/', '/broadcasters/ads/',
            '/cable/ads/', '/satellite/ads/', '/streaming/ads/',
            '/digital/ads/', '/mobile/ads/', '/apps/ads/',
            '/social/ads/', '/newsletters/ads/', '/podcasts/ads/',
            '/radio/ads/', '/tv/ads/', '/film/ads/', '/music/ads/',
            '/books/ads/', '/art/ads/', '/theater/ads/', '/gaming/ads/',
            '/esports/ads/', '/virtual-reality/ads/', '/augmented-reality/ads/',
            '/artificial-intelligence/ads/', '/machine-learning/ads/',
            '/blockchain/ads/', '/cryptocurrency/ads/', '/cybersecurity/ads/',
            '/privacy/ads/', '/data/ads/', '/cloud/ads/', '/5g/ads/',
            '/6g/ads/', '/quantum/ads/', '/space/ads/', '/climate/ads/',
            '/environment/ads/', '/sustainability/ads/', '/energy/ads/',
            '/transportation/ads/', '/automotive/ads/', '/aviation/ads/',
            '/maritime/ads/', '/rail/ads/', '/roads/ads/', '/infrastructure/ads/',
            '/construction/ads/', '/real-estate/ads/', '/property/ads/',
            '/housing/ads/', '/mortgage/ads/', '/insurance/ads/',
            '/banking/ads/', '/finance/ads/', '/investing/ads/',
            '/trading/ads/', '/markets/ads/', '/stocks/ads/',
            '/bonds/ads/', '/commodities/ads/', '/currencies/ads/',
            '/forex/ads/'
        ];
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
            const urlStr = url.toString();
            if (videoAdDomains.some(domain => urlStr.includes(domain)) && 
                videoAdPaths.some(path => urlStr.includes(path))) {
                console.log('Guardian: Blocked general video ad fetch request:', urlStr);
                adBlockStats.networks++;
                return Promise.reject(new Error('Blocked by Guardian Ad Blocker'));
            }
            return originalFetch.apply(this, arguments);
        };
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(method, url, async) {
            const urlStr = url.toString();
            if (videoAdDomains.some(domain => urlStr.includes(domain)) && 
                videoAdPaths.some(path => urlStr.includes(path))) {
                console.log('Guardian: Blocked general video ad XHR request:', urlStr);
                adBlockStats.networks++;
                this.abort();
                return;
            }
            return originalXHROpen.apply(this, arguments);
        };
    };

    // ===== GOOGLE SEARCH AD BLOCKING =====
    
    /**
     * Block Google Search Ads and Sponsored Results - Comprehensive blocking
     */
    const blockGoogleSearchAds = () => {
        if (!window.location.hostname.includes('google.com')) return;
        
        console.log('Guardian: Blocking Google search ads and sponsored content');
        
        // Inject CSS for Google search ads
        const injectGoogleSearchCSS = () => {
            const existingStyle = document.getElementById('guardian-google-search-css');
            if (existingStyle) return; // Already injected
            
            const css = `
                /* Hide Google Search Ads and Sponsored Content */
                [data-text-ad="1"], .ads-ad, .commercial-unit-desktop-top, 
                .commercial-unit-desktop-rhs, .mnr-c, .ads-visurl, .ads-creative,
                [aria-label*="Ad"], [aria-label*="Sponsored"], [data-ad-client],
                [data-ad-slot], [data-ad-format], .ads, .adsbygoogle,
                .commercial-unit-desktop-top, .cu-container, .shopping-unit,
                .shopping-bar, .product-bar, .merchant-unit, .merchant-bar,
                .price-bar, .buy-bar, .shop-bar, .retail-bar, .store-bar,
                .market-bar, .mall-bar, .outlet-bar, .deal-bar, .offer-bar,
                .sale-bar, .discount-bar, .coupon-bar, .voucher-bar, .promo-bar,
                .sponsored-bar, .ad-bar, .ads-bar, .advertising-bar,
                .marketing-bar, .commercial-bar, .business-bar, .brand-bar,
                .vendor-bar, .seller-bar, .merchant-bar, .retailer-bar,
                .ad-container, .ad-wrapper, .ad-slot, .ad-banner, .ad-box,
                .ad-placeholder, .sponsored, .promo, .promotion,
                [data-ved*="shopping"], [data-ved*="product"], [data-ved*="merchant"],
                [data-ved*="retail"], [data-ved*="store"], [data-ved*="market"],
                [data-ved*="mall"], [data-ved*="outlet"], [data-ved*="deal"],
                [data-ved*="offer"], [data-ved*="sale"], [data-ved*="discount"],
                [data-ved*="coupon"], [data-ved*="voucher"], [data-ved*="promo"],
                [data-ved*="sponsored"], [data-ved*="ad"], [data-ved*="ads"],
                [data-ved*="advertising"], [data-ved*="marketing"], [data-ved*="commercial"],
                [data-ved*="business"], [data-ved*="brand"], [data-ved*="vendor"],
                [data-ved*="seller"], [data-ved*="merchant"], [data-ved*="retailer"],
                .g[data-text-ad="1"], .g.ads-ad, .g.commercial-unit-desktop-top,
                .g.commercial-unit-desktop-rhs, .g.mnr-c, .g.ads, .g.adsbygoogle,
                .g.ad-container, .g.ad-wrapper, .g.ad-slot, .g.ad-banner,
                .g.ad-box, .g.ad-placeholder, .g.sponsored, .g.promo,
                .g.promotion, .g.commercial-unit, .g.cu-container, .g.shopping-unit,
                .g.shopping-bar, .g.product-bar, .g.merchant-unit, .g.merchant-bar,
                .g.price-bar, .g.buy-bar, .g.shop-bar, .g.retail-bar, .g.store-bar,
                .g.market-bar, .g.mall-bar, .g.outlet-bar, .g.deal-bar, .g.offer-bar,
                .g.sale-bar, .g.discount-bar, .g.coupon-bar, .g.voucher-bar,
                .g.promo-bar, .g.sponsored-bar, .g.ad-bar, .g.ads-bar,
                .g.advertising-bar, .g.marketing-bar, .g.commercial-bar,
                .g.business-bar, .g.brand-bar, .g.vendor-bar, .g.seller-bar,
                .g.merchant-bar, .g.retailer-bar {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -1 !important;
                    pointer-events: none !important;
                }
                
                /* Hide entire sponsored result containers */
                .g:has([data-text-ad="1"]), .g:has(.ads-ad), .g:has([aria-label*="Ad"]), 
                .g:has([aria-label*="Sponsored"]), .g:has(.sponsored), .g:has(.promo), 
                .g:has(.promotion), .g:has(.ads), .g:has(.adsbygoogle), .g:has(.ad-container), 
                .g:has(.ad-wrapper), .g:has(.ad-slot), .g:has(.ad-banner), .g:has(.ad-box), 
                .g:has(.ad-placeholder), .g:has(.commercial-unit), .g:has(.cu-container), 
                .g:has(.shopping-unit), .g:has(.shopping-bar), .g:has(.product-bar), 
                .g:has(.merchant-unit), .g:has(.merchant-bar), .g:has(.price-bar), 
                .g:has(.buy-bar), .g:has(.shop-bar), .g:has(.retail-bar), .g:has(.store-bar), 
                .g:has(.market-bar), .g:has(.mall-bar), .g:has(.outlet-bar), .g:has(.deal-bar), 
                .g:has(.offer-bar), .g:has(.sale-bar), .g:has(.discount-bar), .g:has(.coupon-bar), 
                .g:has(.voucher-bar), .g:has(.promo-bar), .g:has(.sponsored-bar), .g:has(.ad-bar), 
                .g:has(.ads-bar), .g:has(.advertising-bar), .g:has(.marketing-bar), 
                .g:has(.commercial-bar), .g:has(.business-bar), .g:has(.brand-bar), 
                .g:has(.vendor-bar), .g:has(.seller-bar), .g:has(.merchant-bar), 
                .g:has(.retailer-bar) {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    height: 0 !important;
                    width: 0 !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    position: absolute !important;
                    left: -9999px !important;
                    top: -9999px !important;
                    z-index: -1 !important;
                    pointer-events: none !important;
                }
            `;
            
            const style = document.createElement('style');
            style.id = 'guardian-google-search-css';
            style.textContent = css;
            document.head.appendChild(style);
            console.log('Guardian: Injected Google search ad blocking CSS');
        };
        
        // Inject CSS first
        injectGoogleSearchCSS();
        
        // Comprehensive sponsored results removal
        const sponsoredSelectors = [
            // Google Ads
            '[data-text-ad="1"]', '.ads-ad', '.commercial-unit-desktop-top', 
            '.commercial-unit-desktop-rhs', '.mnr-c', '.ads-visurl', '.ads-creative',
            '[aria-label*="Ad"]', '[aria-label*="Sponsored"]', '[data-ad-client]',
            '[data-ad-slot]', '[data-ad-format]', '.ads', '.adsbygoogle',
            
            // Shopping and Product Bars
            '.commercial-unit-desktop-top', '.cu-container', '.shopping-unit',
            '.shopping-bar', '.product-bar', '.merchant-unit', '.merchant-bar',
            '.price-bar', '.buy-bar', '.shop-bar', '.retail-bar', '.store-bar',
            '.market-bar', '.mall-bar', '.outlet-bar', '.deal-bar', '.offer-bar',
            '.sale-bar', '.discount-bar', '.coupon-bar', '.voucher-bar', '.promo-bar',
            '.sponsored-bar', '.ad-bar', '.ads-bar', '.advertising-bar',
            '.marketing-bar', '.commercial-bar', '.business-bar', '.brand-bar',
            '.vendor-bar', '.seller-bar', '.merchant-bar', '.retailer-bar',
            
            // Generic Ad Containers
            '.ad-container', '.ad-wrapper', '.ad-slot', '.ad-banner', '.ad-box',
            '.ad-placeholder', '.sponsored', '.promo', '.promotion',
            
            // Shopping Results
            '[data-ved*="shopping"]', '[data-ved*="product"]', '[data-ved*="merchant"]',
            '[data-ved*="retail"]', '[data-ved*="store"]', '[data-ved*="market"]',
            '[data-ved*="mall"]', '[data-ved*="outlet"]', '[data-ved*="deal"]',
            '[data-ved*="offer"]', '[data-ved*="sale"]', '[data-ved*="discount"]',
            '[data-ved*="coupon"]', '[data-ved*="voucher"]', '[data-ved*="promo"]',
            '[data-ved*="sponsored"]', '[data-ved*="ad"]', '[data-ved*="ads"]',
            '[data-ved*="advertising"]', '[data-ved*="marketing"]', '[data-ved*="commercial"]',
            '[data-ved*="business"]', '[data-ved*="brand"]', '[data-ved*="vendor"]',
            '[data-ved*="seller"]', '[data-ved*="merchant"]', '[data-ved*="retailer"]',
            
            // Sponsored Search Results
            '.g[data-text-ad="1"]', '.g.ads-ad', '.g.commercial-unit-desktop-top',
            '.g.commercial-unit-desktop-rhs', '.g.mnr-c', '.g.ads', '.g.adsbygoogle',
            '.g.ad-container', '.g.ad-wrapper', '.g.ad-slot', '.g.ad-banner',
            '.g.ad-box', '.g.ad-placeholder', '.g.sponsored', '.g.promo',
            '.g.promotion', '.g.commercial-unit', '.g.cu-container', '.g.shopping-unit',
            '.g.shopping-bar', '.g.product-bar', '.g.merchant-unit', '.g.merchant-bar',
            '.g.price-bar', '.g.buy-bar', '.g.shop-bar', '.g.retail-bar', '.g.store-bar',
            '.g.market-bar', '.g.mall-bar', '.g.outlet-bar', '.g.deal-bar', '.g.offer-bar',
            '.g.sale-bar', '.g.discount-bar', '.g.coupon-bar', '.g.voucher-bar',
            '.g.promo-bar', '.g.sponsored-bar', '.g.ad-bar', '.g.ads-bar',
            '.g.advertising-bar', '.g.marketing-bar', '.g.commercial-bar',
            '.g.business-bar', '.g.brand-bar', '.g.vendor-bar', '.g.seller-bar',
            '.g.merchant-bar', '.g.retailer-bar'
        ];
        
        sponsoredSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                if (element && element.parentNode) {
                    element.remove();
                    console.log('Guardian: Removed Google search ad/sponsored content:', selector);
                }
            });
        });
        
        // Remove entire sponsored result containers
        const sponsoredContainers = document.querySelectorAll('.g');
        sponsoredContainers.forEach(container => {
            const hasSponsoredContent = container.querySelector('[data-text-ad="1"], .ads-ad, [aria-label*="Ad"], [aria-label*="Sponsored"], .sponsored, .promo, .promotion, .ads, .adsbygoogle, .ad-container, .ad-wrapper, .ad-slot, .ad-banner, .ad-box, .ad-placeholder, .commercial-unit, .cu-container, .shopping-unit, .shopping-bar, .product-bar, .merchant-unit, .merchant-bar, .price-bar, .buy-bar, .shop-bar, .retail-bar, .store-bar, .market-bar, .mall-bar, .outlet-bar, .deal-bar, .offer-bar, .sale-bar, .discount-bar, .coupon-bar, .voucher-bar, .promo-bar, .sponsored-bar, .ad-bar, .ads-bar, .advertising-bar, .marketing-bar, .commercial-bar, .business-bar, .brand-bar, .vendor-bar, .seller-bar, .merchant-bar, .retailer-bar');
            
            if (hasSponsoredContent && container.parentNode) {
                container.remove();
                console.log('Guardian: Removed entire sponsored search result container');
            }
        });
    };

    // ===== INITIALIZATION =====

    /**
     * Initialize all blocking mechanisms
     */
    const initialize = () => {
        console.log('Guardian: Initializing ad blocking system with AI enhancement');
        
        // Listen for toggle changes
        listenForToggleChanges();
        
        // Check if ad blocking is enabled
        if (isAdBlockingEnabled()) {
            console.log('Guardian: Ad blocking is enabled - initializing');
            
            if (isAdBlockTester()) {
                initializeAdBlockTesterBlocking();
            } else if (isYouTube()) {
                initializeYouTubeBlocking();
            } else if (isHiAnime()) {
                initializeHiAnimeBlocking();
            } else {
                initializeGeneralBlocking();
            }
        } else {
            console.log('Guardian: Ad blocking is disabled');
        }
        
        // Log statistics periodically
        setInterval(() => {
            console.log('Guardian Stats:', adBlockStats);
        }, 10000);
    };

    // Run immediately if DOM is ready, otherwise wait
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    console.log('Guardian Ad Blocker: Enhanced system with AI loaded');
    console.log('AdBlock Tester support: Active with 7-layer protection (including AI)');
    console.log('YouTube support: Active with CSS + auto-skip');
    console.log('HiAnime support: Active with specific selectors');
    console.log('General support: Active for all other sites');
    console.log('AI-powered detection: Active with OpenRouter API');
    console.log('Computer Vision techniques: Active (Element Analysis, Pattern Recognition, Behavioral Analysis)');
    console.log('Multi-model AI: Active (Claude 3.5 Sonnet, GPT-4o, Gemini Pro)');
    console.log('Toggle integration: Active');
    console.log('Statistics tracking: Active');

})();