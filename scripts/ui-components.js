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
     * Updates minutes display with animation
     */
    static updateMinutesDisplay(minutesValue, difference) {
        if (minutesValue) {
            minutesValue.textContent = difference.toLocaleString();
            
            minutesValue.classList.add('pulse');
            setTimeout(() => {
                minutesValue.classList.remove('pulse');
            }, 600);
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
     * Displays error state for input field
     */
    static displayInputError(input, message, minutesValue = null) {
        input.classList.add('error');
        input.title = message;
        if (minutesValue) {
            minutesValue.textContent = 'Error';
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