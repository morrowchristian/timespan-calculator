/**
 * Storage management for Time Span Calculator
 * Handles Chrome extension storage operations
 */

class StorageManager {
    /**
     * Saves the current state to storage
     */
    static saveToStorage(startTime, endTime, minutes, addMinutes) {
        const data = {
            startTime: startTime,
            endTime: endTime,
            minutes: minutes,
            addMinutes: addMinutes
        };
        
        chrome.storage.local.set(data, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving to storage:', chrome.runtime.lastError);
            }
        });
    }
    
    /**
     * Loads saved data from storage
     */
    static loadFromStorage(callback) {
        chrome.storage.local.get(['startTime', 'endTime', 'minutes', 'addMinutes'], function(result) {
            if (chrome.runtime.lastError) {
                console.error('Error loading from storage:', chrome.runtime.lastError);
                callback(null);
                return;
            }
            
            if (result.startTime || result.endTime) {
                callback(result);
            } else {
                callback(null);
            }
        });
    }
    
    /**
     * Clears saved data from storage
     */
    static clearStorage() {
        chrome.storage.local.remove(['startTime', 'endTime', 'minutes'], function() {
            if (chrome.runtime.lastError) {
                console.error('Error clearing storage:', chrome.runtime.lastError);
            }
        });
    }
}