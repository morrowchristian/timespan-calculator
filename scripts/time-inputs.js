/**
 * Time input parsing and formatting
 * Handles smart time parsing and auto-formatting
 */

class TimeInputParser {
    /**
     * Smart parsing of time input - handles various formats
     */
    static smartParseTime(input) {
        let value = (typeof input === 'string' ? input : input.value).trim().toUpperCase();
        
        value = value.replace(/[^0-9:APM\s]/gi, '');
        
        if (!value) return value;
        
        let period = '';
        const periodMatch = value.match(/([AP]M?)$/i);
        if (periodMatch) {
            period = periodMatch[1].startsWith('A') ? 'AM' : 'PM';
            value = value.replace(/[AP]M?$/i, '').trim();
        }
        
        if (value.includes(':')) {
            const parts = value.split(':');
            const hPart = parts[0].replace(/\D/g, '');
            let mPart = parts[1].replace(/\D/g, '');
            let hours = parseInt(hPart || '0', 10);
            let minutes = 0;
            
            if (mPart.length === 1) {
                minutes = parseInt(mPart, 10) * 10;
            } else if (mPart.length >= 2) {
                minutes = parseInt(mPart.substring(0, 2), 10);
            }

            if (hours === 0) {
                hours = 12;
                period = period || 'AM';
            } else if (hours > 12) {
                period = period || 'PM';
                hours = hours - 12;
            } else {
                period = period || 'AM';
            }

            if (minutes >= 60) {
                hours += Math.floor(minutes / 60);
                minutes = minutes % 60;
                if (hours > 12) {
                    hours = hours % 12 || 12;
                    period = period === 'AM' ? 'PM' : 'AM';
                }
            }

            const hoursStr = String(hours).padStart(2, '0');
            const minutesStr = String(minutes).padStart(2, '0');
            return `${hoursStr}:${minutesStr} ${period || 'AM'}`;
        }

        const numbers = value.replace(/[:\s]/g, '');
        
        let hours = 0;
        let minutes = 0;
        
        if (numbers.length === 0) {
            return '';
        } else if (numbers.length === 1) {
            hours = parseInt(numbers[0]);
            minutes = 0;
        } else if (numbers.length === 2) {
            const twoDigitNum = parseInt(numbers);
            if (twoDigitNum <= 12) {
                hours = twoDigitNum;
                minutes = 0;
            } else {
                hours = parseInt(numbers[0]);
                minutes = parseInt(numbers[1]);
            }
        } else if (numbers.length === 3) {
            hours = parseInt(numbers[0]);
            minutes = parseInt(numbers.substring(1));
        } else if (numbers.length === 4) {
            hours = parseInt(numbers.substring(0, 2));
            minutes = parseInt(numbers.substring(2));
        } else {
            hours = parseInt(numbers.substring(0, 2));
            minutes = parseInt(numbers.substring(2, 4));
        }
        
        if (hours > 12 || (hours === 12 && period === '')) {
            if (hours > 12 && hours < 24) {
                period = period || 'PM';
                hours = hours - 12;
            } else if (hours === 0) {
                hours = 12;
                period = period || 'AM';
            } else {
                period = period || (hours >= 12 ? 'PM' : 'AM');
                if (hours > 12) hours = hours % 12 || 12;
            }
        } else if (hours === 0) {
            hours = 12;
            period = period || 'AM';
        } else {
            period = period || 'AM';
        }
        
        if (minutes >= 60) {
            hours += Math.floor(minutes / 60);
            minutes = minutes % 60;
            if (hours > 12) {
                hours = hours % 12 || 12;
                if (period === 'AM') period = 'PM';
                else if (period === 'PM') period = 'AM';
            }
        }
        
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        
        return `${hoursStr}:${minutesStr} ${period}`;
    }
    
    /**
     * Auto-formats time input as user types
     */
    static autoFormatTimeInput(input) {
        const cursorPos = input.selectionStart;
        let value = input.value.toUpperCase();
        
        value = value.replace(/[^0-9:APM\s]/gi, '');
        
        const hasNumbers = /\d/.test(value);
        
        if (hasNumbers && (value.length >= 1 || value.match(/[AP]M/i))) {
            const periodMatch = value.match(/[AP]M?$/i);
            if (periodMatch || value.length >= 3) {
                const formatted = this.smartParseTime(input);
                if (formatted) {
                    input.value = formatted;
                    const newLength = formatted.length;
                    const newPos = Math.min(cursorPos, newLength);
                    setTimeout(() => {
                        input.setSelectionRange(newPos, newPos);
                    }, 0);
                    return;
                }
            }
        }
        
        if (value.length === 2 && !value.includes(':') && /^\d{2}$/.test(value)) {
            value = value + ':';
        }
        
        if (value.length > 4 && !value.includes(' ') && /[AP]M/i.test(value)) {
            const timePart = value.substring(0, 5);
            const periodPart = value.substring(5);
            value = timePart + ' ' + periodPart;
        }
        
        input.value = value;
    }
    
    /**
     * Increments time by 1 minute with rollover
     */
    static incrementTime(timeInput) {
        const time12 = timeInput.value;
        if (!TimeCalculator.isValidTime12(time12)) return;
        
        const time24 = TimeCalculator.convertTo24Hour(time12);
        const [hours, minutes] = time24.split(':').map(Number);
        
        let totalMinutes = hours * 60 + minutes;
        totalMinutes = (totalMinutes + 1) % (24 * 60);
        
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        
        const newTime24 = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        const newTime12 = TimeCalculator.convertTo12Hour(newTime24);
        
        timeInput.value = newTime12;
    }
    
    /**
     * Decrements time by 1 minute with rollover
     */
    static decrementTime(timeInput) {
        const time12 = timeInput.value;
        if (!TimeCalculator.isValidTime12(time12)) return;
        
        const time24 = TimeCalculator.convertTo24Hour(time12);
        const [hours, minutes] = time24.split(':').map(Number);
        
        let totalMinutes = hours * 60 + minutes;
        totalMinutes = (totalMinutes - 1 + 24 * 60) % (24 * 60);
        
        const newHours = Math.floor(totalMinutes / 60);
        const newMinutes = totalMinutes % 60;
        
        const newTime24 = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
        const newTime12 = TimeCalculator.convertTo12Hour(newTime24);
        
        timeInput.value = newTime12;
    }
}