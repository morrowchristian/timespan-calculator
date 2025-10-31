/**
 * Time calculation utilities
 * Handles time format conversion, validation, and calculations
 */

class TimeCalculator {
    /**
     * Converts 24-hour time to 12-hour AM/PM format
     */
    static convertTo12Hour(time24) {
        if (!this.isValidTime24(time24)) return time24;
        
        const [hours, minutes] = time24.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        
        return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
    }
    
    /**
     * Converts 12-hour AM/PM time to 24-hour format
     */
    static convertTo24Hour(time12) {
        if (!this.isValidTime12(time12)) return time12;
        
        const timeParts = time12.match(/(\d+):(\d+)\s*([AP]M)/i);
        if (!timeParts) return time12;
        
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const period = timeParts[3].toUpperCase();
        
        if (period === 'PM' && hours !== 12) {
            hours += 12;
        } else if (period === 'AM' && hours === 12) {
            hours = 0;
        }
        
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    
    /**
     * Validates 24-hour time format (HH:MM)
     */
    static isValidTime24(time) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(time);
    }
    
    /**
     * Validates 12-hour time format (HH:MM AM/PM)
     */
    static isValidTime12(time) {
        const timeRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]\s*([AP]M)$/i;
        return timeRegex.test(time);
    }
    
    /**
     * Calculates time difference between start and end times in minutes
     */
    static calculateTimeDifference(startTime12, endTime12) {
        if (!this.isValidTime12(startTime12) || !this.isValidTime12(endTime12)) {
            return null;
        }
        
        const startTime24 = this.convertTo24Hour(startTime12);
        const endTime24 = this.convertTo24Hour(endTime12);
        
        const [startHours, startMinutes] = startTime24.split(':').map(Number);
        const [endHours, endMinutes] = endTime24.split(':').map(Number);
        
        const startTotalMinutes = startHours * 60 + startMinutes;
        const endTotalMinutes = endHours * 60 + endMinutes;
        
        let difference = endTotalMinutes - startTotalMinutes;
        
        if (difference < 0) {
            difference += 24 * 60;
        }
        
        return difference;
    }
    
    /**
     * Adds minutes to a time and returns the result
     */
    static addMinutesToTime(time12, minutesToAdd) {
        if (!this.isValidTime12(time12)) return null;
        
        const time24 = this.convertTo24Hour(time12);
        const [hours, minutes] = time24.split(':').map(Number);
        
        let totalMinutes = hours * 60 + minutes + minutesToAdd;
        totalMinutes = ((totalMinutes % (24 * 60)) + (24 * 60)) % (24 * 60);
        
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        
        const newTime24 = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        return this.convertTo12Hour(newTime24);
    }
    
    /**
     * Gets timezone abbreviation (CDT/CST)
     */
    static getTimezoneAbbrev() {
        const date = new Date();
        const tzString = date.toLocaleTimeString('en-US', {
            timeZoneName: 'short', 
            timeZone: 'America/Chicago'
        });
        const match = tzString.match(/\s([A-Z]{3,4})$/);
        return match ? match[1] : 'CDT';
    }
    
    /**
     * Formats date in MM/DD/YYYY HH:MM AM/PM (TZ) format
     */
    static formatDateWithTimezone(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours();
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const period = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        
        const timezone = this.getTimezoneAbbrev();
        
        return `${month}/${day}/${year} ${hours12}:${minutes} ${period} (${timezone})`;
    }
    
    /**
     * Gets current time in Central Time
     */
    static getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', {
            timeZone: 'America/Chicago',
            hour12: true,
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}