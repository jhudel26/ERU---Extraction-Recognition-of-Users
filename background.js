// Background script for ERU - User Extractor
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'storeNames') {
        // Store extracted names in local storage
        chrome.storage.local.set({ 
            extractedNames: message.names,
            lastExtraction: new Date().toISOString()
        }, () => {
            sendResponse({ success: true });
        });
        return true; // Keep message channel open for async response
    }
    
    if (message.action === 'getStoredNames') {
        // Retrieve stored names
        chrome.storage.local.get(['extractedNames', 'lastExtraction'], (result) => {
            sendResponse({
                names: result.extractedNames || [],
                lastExtraction: result.lastExtraction
            });
        });
        return true;
    }
    
    if (message.action === 'clearStoredData') {
        // Clear stored data
        chrome.storage.local.remove(['extractedNames', 'lastExtraction'], () => {
            sendResponse({ success: true });
        });
        return true;
    }
});

// Handle extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('ERU - User Extractor installed');
        
        // Initialize storage
        chrome.storage.local.set({
            extractedNames: [],
            settings: {
                autoScroll: true,
                maxScrollAttempts: 5,
                delayBetweenScrolls: 2000
            }
        });
    } else if (details.reason === 'update') {
        console.log('ERU - User Extractor updated');
    }
});

// Handle browser action click (when extension icon is clicked)
chrome.action.onClicked.addListener((tab) => {
    // Only open popup on Facebook group pages
    if (tab.url.includes('facebook.com/groups/') && tab.url.includes('/members')) {
        chrome.action.openPopup();
    } else {
        // Show notification or redirect to instructions
        chrome.tabs.create({
            url: chrome.runtime.getURL('instructions.html')
        });
    }
});
