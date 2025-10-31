/**
 * Main application logic for Time Span Calculator
 * Coordinates between all modules
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Element References
    const elements = {
        startTimeInput: document.getElementById('start-time'),
        endTimeInput: document.getElementById('end-time'),
        minutesValue: document.getElementById('minutes-value'),
        updateCurrentTimeBtn: document.getElementById('update-current-time-btn'),
        copyBtn: document.getElementById('copy-btn'),
        addMinutesInput: document.getElementById('add-minutes'),
        addMinutesBtn: document.getElementById('add-minutes-btn'),
        addMinutesResult: document.getElementById('add-minutes-result'),
        copyAddMinutesBtn: document.getElementById('copy-add-minutes-btn')
    };

    // Initialize application
    initializeApplication();

    /**
     * Main initialization function
     */
    function initializeApplication() {
        setupEventListeners();
        UIComponents.setupTimeDropdowns();
        loadSavedData();
        
        // Initialize with current time if empty
        if (elements.startTimeInput && (!elements.startTimeInput.value || 
            elements.startTimeInput.value.trim().toUpperCase() === '00:00 AM')) {
            setCurrentTime();
        }
    }

    /**
     * Sets up all event listeners
     */
    function setupEventListeners() {
        // Update current time button
        elements.updateCurrentTimeBtn.addEventListener('click', updateCurrentTime);
        
        // Copy buttons
        elements.copyBtn.addEventListener('click', copyMinutesToClipboard);
        elements.copyAddMinutesBtn.addEventListener('click', copyAddMinutesResult);
        
        // Time input controls
        setupTimeInputListeners();
        
        // Add minutes functionality
        setupAddMinutesListeners();
    }

    /**
     * Sets up time input event listeners
     */
    function setupTimeInputListeners() {
        document.querySelectorAll('.time-input-container').forEach(container => {
            const timeInput = container.querySelector('.time-input');
            const upBtn = container.querySelector('.time-btn.up');
            const downBtn = container.querySelector('.time-btn.down');
            
            upBtn.addEventListener('click', () => {
                TimeInputParser.incrementTime(timeInput);
                saveAndCalculate();
            });
            
            downBtn.addEventListener('click', () => {
                TimeInputParser.decrementTime(timeInput);
                saveAndCalculate();
            });
            
            timeInput.addEventListener('focus', function() {
                this.select();
            });
            
            timeInput.addEventListener('change', handleTimeInputChange);
            timeInput.addEventListener('blur', handleTimeInputChange);
            timeInput.addEventListener('input', function() {
                TimeInputParser.autoFormatTimeInput(this);
            });

            // Keyboard navigation
            timeInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const parsed = TimeInputParser.smartParseTime(this);
                    if (parsed && parsed !== this.value) {
                        this.value = parsed;
                    }
                    
                    if (this.id === 'start-time') {
                        elements.endTimeInput.focus();
                        elements.endTimeInput.select();
                    } else {
                        this.blur();
                    }
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    TimeInputParser.incrementTime(timeInput);
                    saveAndCalculate();
                } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    TimeInputParser.decrementTime(timeInput);
                    saveAndCalculate();
                }
            });
        });
    }

    /**
     * Sets up add minutes functionality
     */
    function setupAddMinutesListeners() {
        if (elements.addMinutesInput) {
            // Add minutes increment/decrement buttons
            const addMinutesUpBtn = document.querySelector('.add-minutes-controls .time-btn.up');
            const addMinutesDownBtn = document.querySelector('.add-minutes-controls .time-btn.down');
            
            if (addMinutesUpBtn) {
                addMinutesUpBtn.addEventListener('click', incrementAddMinutes);
            }
            
            if (addMinutesDownBtn) {
                addMinutesDownBtn.addEventListener('click', decrementAddMinutes);
            }

            elements.addMinutesInput.addEventListener('input', function() {
                tryApplyAddMinutes(false);
                saveToStorage();
            });
            
            elements.addMinutesInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    tryApplyAddMinutes(true);
                }
            });
            
            elements.addMinutesInput.addEventListener('focus', function() {
                this.select();
            });
        }
        
        if (elements.addMinutesBtn) {
            elements.addMinutesBtn.addEventListener('click', function() {
                tryApplyAddMinutes(true);
            });
        }
    }

    /**
     * Handles time input changes
     */
    function handleTimeInputChange() {
        const parsed = TimeInputParser.smartParseTime(this);
        if (parsed && parsed !== this.value) {
            this.value = parsed;
        }
        saveAndCalculate();
    }

    /**
     * Saves state and calculates difference
     */
    function saveAndCalculate() {
        saveToStorage();
        calculateTimeDifference();
    }

    /**
     * Calculates and displays time difference
     */
    function calculateTimeDifference() {
        const startTime12 = elements.startTimeInput.value;
        const endTime12 = elements.endTimeInput.value;
        
        UIComponents.clearErrorStates([elements.startTimeInput, elements.endTimeInput]);
        
        if (!TimeCalculator.isValidTime12(startTime12)) {
            UIComponents.displayInputError(elements.startTimeInput, 
                'Invalid start time format. Use: HH:MM AM/PM', elements.minutesValue);
            return;
        }
        
        if (!TimeCalculator.isValidTime12(endTime12)) {
            UIComponents.displayInputError(elements.endTimeInput, 
                'Invalid end time format. Use: HH:MM AM/PM', elements.minutesValue);
            return;
        }
        
        const difference = TimeCalculator.calculateTimeDifference(startTime12, endTime12);
        
        if (difference !== null) {
            UIComponents.updateMinutesDisplay(elements.minutesValue, difference);
        }
    }

    /**
     * Adds minutes to start time functionality
     */
    function tryApplyAddMinutes(updateEndField = true) {
        if (!elements.addMinutesInput) return;
        
        const raw = String(elements.addMinutesInput.value || '').trim();
        if (raw === '') {
            if (elements.addMinutesResult) elements.addMinutesResult.textContent = 'End at: —';
            if (elements.copyAddMinutesBtn) elements.copyAddMinutesBtn.style.display = 'none';
            return;
        }

        const delta = parseInt(raw, 10);
        if (Number.isNaN(delta) || delta < 0) {
            if (elements.addMinutesResult) elements.addMinutesResult.textContent = 'End at: —';
            if (elements.copyAddMinutesBtn) elements.copyAddMinutesBtn.style.display = 'none';
            return;
        }

        const startStr = TimeInputParser.smartParseTime(elements.startTimeInput) || elements.startTimeInput.value;
        const resultTime = TimeCalculator.addMinutesToTime(startStr, delta);
        
        if (resultTime) {
            // Create date object for formatting
            const now = new Date();
            const resultDate = new Date(now);
            const time24 = TimeCalculator.convertTo24Hour(resultTime);
            const [hours, minutes] = time24.split(':').map(Number);
            resultDate.setHours(hours, minutes, 0, 0);
            
            // Format with the new format: 10/31/2025 11:29 AM (CDT)
            const formattedStr = TimeCalculator.formatDateWithTimezone(resultDate);
            
            if (elements.addMinutesResult) {
                elements.addMinutesResult.textContent = `End at: ${formattedStr}`;
                if (elements.copyAddMinutesBtn) {
                    elements.copyAddMinutesBtn.style.display = 'flex';
                    elements.copyAddMinutesBtn.dataset.copyText = formattedStr;
                }
            }
            
            if (updateEndField) {
                elements.endTimeInput.value = resultTime;
                calculateTimeDifference();
            }
        }
    }

    /**
     * Increments add minutes value
     */
    function incrementAddMinutes() {
        if (!elements.addMinutesInput) return;
        const currentValue = parseInt(elements.addMinutesInput.value || '0', 10);
        elements.addMinutesInput.value = currentValue + 1;
        tryApplyAddMinutes(false);
        saveToStorage();
    }

    /**
     * Decrements add minutes value
     */
    function decrementAddMinutes() {
        if (!elements.addMinutesInput) return;
        const currentValue = parseInt(elements.addMinutesInput.value || '0', 10);
        if (currentValue > 0) {
            elements.addMinutesInput.value = currentValue - 1;
            tryApplyAddMinutes(false);
            saveToStorage();
        }
    }

    /**
     * Copies minutes value to clipboard
     */
    async function copyMinutesToClipboard() {
        if (!elements.minutesValue) return;
        const minutesText = elements.minutesValue.textContent.trim();
        await UIComponents.copyToClipboard(minutesText, elements.copyBtn);
    }

    /**
     * Copies add minutes result to clipboard
     */
    async function copyAddMinutesResult() {
        if (!elements.copyAddMinutesBtn || !elements.copyAddMinutesBtn.dataset.copyText) return;
        const textToCopy = elements.copyAddMinutesBtn.dataset.copyText;
        await UIComponents.copyToClipboard(textToCopy, elements.copyAddMinutesBtn);
    }

    /**
     * Sets current time as start time
     */
    function setCurrentTime() {
        const currentTime = TimeCalculator.getCurrentTime();
        elements.startTimeInput.value = currentTime;
        calculateTimeDifference();
        
        // Auto-calculate add minutes when time updates
        if (elements.addMinutesInput && elements.addMinutesInput.value) {
            tryApplyAddMinutes(false);
        }
    }

    /**
     * Updates only the start time to current time
     */
    function updateCurrentTime() {
        setCurrentTime();
        UIComponents.addPulseAnimation(elements.updateCurrentTimeBtn);
    }

    /**
     * Saves current state to storage
     */
    function saveToStorage() {
        StorageManager.saveToStorage(
            elements.startTimeInput.value,
            elements.endTimeInput.value,
            elements.minutesValue ? elements.minutesValue.textContent.trim() : '0',
            elements.addMinutesInput ? elements.addMinutesInput.value : ''
        );
    }

    /**
     * Loads saved data from storage
     */
    function loadSavedData() {
        StorageManager.loadFromStorage(function(savedData) {
            const hasSaved = savedData && savedData.startTime && savedData.endTime;
            const savedStart = hasSaved ? String(savedData.startTime).trim() : '';
            const savedEnd = hasSaved ? String(savedData.endTime).trim() : '';

            const looksUninitialized = savedStart === '00:00 AM' || savedStart === '0:00 AM' || savedStart === '';

            if (hasSaved && !looksUninitialized && savedStart !== '00:00 AM') {
                elements.startTimeInput.value = savedStart;
                elements.endTimeInput.value = savedEnd;

                calculateTimeDifference();

                if (savedData.minutes && elements.minutesValue) {
                    elements.minutesValue.textContent = savedData.minutes;
                }

                if (elements.addMinutesInput) {
                    elements.addMinutesInput.value = savedData.addMinutes || '90';
                    tryApplyAddMinutes(false);
                }

                console.log('Time Span Calculator loaded with saved data');
            } else {
                setCurrentTime();
                if (!savedEnd || savedEnd === '00:00 AM') {
                    elements.endTimeInput.value = '07:00 AM';
                } else {
                    elements.endTimeInput.value = savedEnd;
                }
                calculateTimeDifference();

                // Set default 90 minutes and calculate
                if (elements.addMinutesInput) {
                    elements.addMinutesInput.value = '90';
                    tryApplyAddMinutes(false);
                }

                saveToStorage();
                console.log('Time Span Calculator initialized with default values');
            }
        });
    }
});