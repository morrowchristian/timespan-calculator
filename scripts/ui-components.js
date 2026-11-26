/**
 * UI Components and interactions
 * Handles dropdowns, copy functionality, and UI updates
 */

class UIComponents {
    /**
     * Sets up time dropdown functionality
     */
    static setupTimeDropdowns() {
        document.querySelectorAll('.time-dropdown').forEach(dropdown => {
            const button = dropdown.querySelector('.dropdown-btn');
            const content = dropdown.querySelector('.dropdown-content');
            const timeInput = dropdown.closest('.time-input-container').querySelector('.time-input');

            // Toggle dropdown on button click
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const isShowing = content.classList.contains('show');
                this.closeAllDropdowns();
                if (!isShowing) {
                    content.classList.add('show');
                }
            });

            // Handle time selection
            content.querySelectorAll('.dropdown-item').forEach(item => {
                item.addEventListener('click', () => {
                    const timeValue = item.dataset.time;
                    if (timeValue === 'now') {
                        this.setTimeToNow(timeInput);
                    } else {
                        timeInput.value = timeValue;
                    }
                    timeInput.dispatchEvent(new Event('change', { bubbles: true }));
                    content.classList.remove('show');
                });
            });
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', () => this.closeAllDropdowns());
    }

    /**
     * Closes all open dropdowns
     */
    static closeAllDropdowns() {
        document.querySelectorAll('.dropdown-content').forEach(content => {
            content.classList.remove('show');
        });
    }

    /**
     * Sets input to current time
     */
    static setTimeToNow(timeInput) {
        const currentTime = TimeCalculator.getCurrentTime();
        timeInput.value = currentTime;
    }

    /**
     * Formats a minute count as a human-friendly breakdown
     * (90 -> "1h 30m", 45 -> "45m", 150 -> "2h 30m", 0 -> "0m")
     */
    static formatDuration(totalMinutes) {
        const minutes = Math.max(0, Math.floor(totalMinutes));
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    }

    /**
     * Updates minutes display with animation, plus the
     * human-friendly hours/minutes breakdown underneath
     */
    static updateMinutesDisplay(minutesValue, difference) {
        if (minutesValue) {
            minutesValue.textContent = difference.toLocaleString();
            
            minutesValue.classList.add('pulse');
            setTimeout(() => {
                minutesValue.classList.remove('pulse');
            }, 600);
        }
        const breakdown = document.getElementById('minutes-breakdown');
        if (breakdown) {
            breakdown.textContent = this.formatDuration(difference);
        }
    }

    /**
     * Copies text to clipboard
     */
    static async copyToClipboard(text, buttonElement) {
        try {
            await navigator.clipboard.writeText(text);
            
            buttonElement.classList.add('copied');
            buttonElement.title = 'Copied!';
            
            setTimeout(() => {
                buttonElement.classList.remove('copied');
                buttonElement.title = 'Copy to clipboard';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text, buttonElement);
        }
    }

    /**
     * Fallback copy method for older browsers
     */
    static fallbackCopyToClipboard(text, buttonElement) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            buttonElement.classList.add('copied');
            buttonElement.title = 'Copied!';
            setTimeout(() => {
                buttonElement.classList.remove('copied');
                buttonElement.title = 'Copy to clipboard';
            }, 2000);
        } catch (fallbackErr) {
            console.error('Fallback copy failed:', fallbackErr);
        }
        document.body.removeChild(textArea);
    }

    /**
     * Displays error state for input field, with a visible inline
     * message and a dash in place of the minutes result
     */
    static displayInputError(input, message, minutesValue = null) {
        input.classList.add('error');
        input.title = message;
        if (minutesValue) {
            minutesValue.textContent = '—';
        }
        const breakdown = document.getElementById('minutes-breakdown');
        if (breakdown) {
            breakdown.textContent = '';
        }
        const errorEl = document.getElementById('input-error');
        if (errorEl) {
            errorEl.textContent = message;
            errorEl.hidden = false;
        }
        
        console.warn('Time Span Calculator Input Error:', message);
    }

    /**
     * Clears all error states
     */
    static clearErrorStates(inputs) {
        inputs.forEach(input => {
            input.classList.remove('error');
            input.title = '';
        });
        const errorEl = document.getElementById('input-error');
        if (errorEl) {
            errorEl.textContent = '';
            errorEl.hidden = true;
        }
    }

    /**
     * Adds pulse animation to element
     */
    static addPulseAnimation(element) {
        element.classList.add('pulse');
        setTimeout(() => {
            element.classList.remove('pulse');
        }, 300);
    }
}