import React, { useState, useEffect, useRef } from 'react';
import Autocomplete from 'react-google-autocomplete';
import { DateRange } from 'react-date-range';
import { addDays, format } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import environment from '../../config/environment';
import './QuestionFlow.css';

// Fallback inline styles in case CSS doesn't load
const fallbackStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: 'Fredoka, "Comic Sans MS", "Baloo", cursive, sans-serif'
    },
    questionBox: {
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        zIndex: 1001
    },
    questionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
    },
    questionIcon: {
        fontSize: '2.5rem'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        color: '#666',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    questionText: {
        fontSize: '1.8rem',
        fontWeight: '700',
        color: '#222',
        marginBottom: '1.5rem',
        lineHeight: '1.3'
    },
    questionInput: {
        width: '100%',
        padding: '1rem 1.5rem',
        border: '2px solid #e1e5e9',
        borderRadius: '15px',
        fontSize: '1.1rem',
        fontFamily: 'inherit',
        background: '#fff',
        boxSizing: 'border-box'
    },
    questionOptions: {
        display: 'grid',
        gap: '0.8rem'
    },
    questionOption: {
        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
        border: '2px solid #e1e5e9',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        fontSize: '1rem',
        fontFamily: 'inherit',
        fontWeight: '500',
        color: '#333',
        cursor: 'pointer',
        textAlign: 'left'
    },
    progressContainer: {
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #e1e5e9'
    },
    progressBar: {
        height: '4px',
        background: 'linear-gradient(90deg, #ff4500, #ff6b35)',
        borderRadius: '2px',
        marginBottom: '0.5rem',
        transition: 'width 0.5s ease'
    },
    progressText: {
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: '500'
    }
};

const QuestionFlow = ({ isVisible, onComplete, onClose, isCreatingTrip = false, creationError = null }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [animationState, setAnimationState] = useState('entering');
    const [answers, setAnswers] = useState({});
    const [destinationCoords, setDestinationCoords] = useState(null);
    const [isLoadingDestination, setIsLoadingDestination] = useState(false);

    const calendarRef = useRef(null);

    // Date range picker state
    const [dateRange, setDateRange] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 1),
            key: 'selection'
        }
    ]);
    const [showCalendar, setShowCalendar] = useState(false);
    const [datesSelected, setDatesSelected] = useState(false);

    // Tab state for date selection
    const [activeDateTab, setActiveDateTab] = useState('calendar');

    const questions = [
        {
            id: 'destination',
            question: "Where would you like to travel?",
            type: 'text',
            placeholder: 'Enter destination...',
            icon: '🌍'
        },
        {
            id: 'dates',
            question: "When are you planning to travel?",
            type: 'date-selection',
            icon: '📅'
        },
        {
            id: 'budget',
            question: "What's your budget range?",
            type: 'select',
            options: ['Budget-friendly', 'Moderate', 'Luxury', 'No limit'],
            icon: '💰'
        },
        {
            id: 'interests',
            question: "What interests you most?",
            type: 'select',
            options: ['Culture & History', 'Nature & Adventure', 'Food & Dining', 'Shopping', 'Relaxation', 'Nightlife'],
            icon: '🎯'
        },
        {
            id: 'travelStyle',
            question: "How do you prefer to travel?",
            type: 'select',
            options: ['Solo', 'Couple', 'Family', 'Group of friends', 'Business'],
            icon: '👥'
        },
        {
            id: 'summary',
            question: "Review Your Trip Details",
            type: 'summary',
            icon: '✅'
        }
    ];

    useEffect(() => {
        if (isVisible && currentQuestionIndex === 0) {
            setAnimationState('entering');
            const timer = setTimeout(() => {
                setAnimationState('visible');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isVisible, currentQuestionIndex]);

    // Handle clicks outside calendar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target)) {
                setShowCalendar(false);
                // Don't reset datesSelected here - let it persist so the confirm button can appear
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAnswer = (answer) => {
        console.log('handleAnswer called with:', answer);

        // Special handling for trip confirmation (last step)
        if (questions[currentQuestionIndex].id === 'summary' && answer === 'confirmed') {
            const finalAnswers = { ...answers, [questions[currentQuestionIndex].id]: answer };
            console.log('Question flow completed. Final answers:', finalAnswers);
            console.log('Destination coordinates:', destinationCoords);
            onComplete(finalAnswers, destinationCoords);
            return;
        }

        setAnswers(prev => ({
            ...prev,
            [questions[currentQuestionIndex].id]: answer
        }));

        // Start exit animation
        setAnimationState('exiting');

        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setAnimationState('entering');
                setTimeout(() => {
                    setAnimationState('visible');
                }, 300);
            } else {
                // All questions completed (this case shouldn't happen with summary handling above)
                const finalAnswers = { ...answers, [questions[currentQuestionIndex].id]: answer };
                console.log('Question flow completed. Final answers:', finalAnswers);
                console.log('Destination coordinates:', destinationCoords);
                onComplete(finalAnswers, destinationCoords);
            }
        }, 400);
    };

    const handlePlaceSelected = (place) => {
        setIsLoadingDestination(true);

        try {
            const destination = place.formatted_address || place.name;

            // Extract coordinates
            if (place.geometry && place.geometry.location) {
                const lat = place.geometry.location.lat();
                const lng = place.geometry.location.lng();
                setDestinationCoords({ lat, lng });
            }

            handleAnswer(destination);
        } catch (error) {
            console.error('Error processing selected place:', error);
            setIsLoadingDestination(false);
        }
    };

    const handleDateRangeChange = (item) => {
        setDateRange([item.selection]);
        // Only set datesSelected to true if the dates are different from default
        const defaultStartDate = new Date();
        const defaultEndDate = addDays(new Date(), 1);

        if (item.selection.startDate.getTime() !== defaultStartDate.getTime() ||
            item.selection.endDate.getTime() !== defaultEndDate.getTime()) {
            setDatesSelected(true);
        }
    };

    const handleDateRangeConfirm = () => {
        const startDate = format(dateRange[0].startDate, 'yyyy-MM-dd');
        const endDate = format(dateRange[0].endDate, 'yyyy-MM-dd');
        const dateRangeString = `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`;

        setAnswers(prev => ({
            ...prev,
            startDate,
            endDate
        }));

        setShowCalendar(false);
        setDatesSelected(false);
        handleAnswer(dateRangeString);
    };

    const handleClose = () => {
        setAnimationState('exiting');
        setTimeout(() => {
            onClose();
            setCurrentQuestionIndex(0);
            setAnswers({});
            setAnimationState('entering');
        }, 400);
    };

    const renderQuestionInput = (question) => {
        switch (question.type) {
            case 'text':
                if (question.id === 'destination') {
                    return (
                        <div className="destination-input-container">
                            <Autocomplete
                                apiKey={environment.apiKeys.googleMaps}
                                onPlaceSelected={handlePlaceSelected}
                                types={['(cities)']}
                                placeholder={question.placeholder}
                                className="question-input autocomplete-input"
                                style={fallbackStyles.questionInput}
                                autoFocus
                            />
                            {isLoadingDestination && (
                                <div className="loading-indicator">
                                    <div className="loading-spinner"></div>
                                    <span>Processing destination...</span>
                                </div>
                            )}
                        </div>
                    );
                }
                return (
                    <input
                        type="text"
                        placeholder={question.placeholder}
                        className="question-input"
                        style={fallbackStyles.questionInput}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                                handleAnswer(e.target.value.trim());
                            }
                        }}
                        autoFocus
                    />
                );
            case 'select':
                return (
                    <div className="question-options" style={fallbackStyles.questionOptions}>
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className="question-option"
                                style={fallbackStyles.questionOption}
                                onClick={() => handleAnswer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );
            case 'date-range':
                const formattedDateRange = `${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`;
                return (
                    <div className="date-range-container">
                        <div
                            className="date-range-input"
                            onClick={() => {
                                if (showCalendar) {
                                    setShowCalendar(false);
                                } else {
                                    setShowCalendar(true);
                                    // Reset datesSelected when opening calendar again
                                    setDatesSelected(false);
                                }
                            }}
                        >
                            <span className="date-range-text">{formattedDateRange}</span>
                            <span className="date-range-icon">📅</span>
                        </div>
                        {showCalendar && (
                            <div className="calendar-popup" ref={calendarRef}>
                                <DateRange
                                    onChange={handleDateRangeChange}
                                    ranges={dateRange}
                                    minDate={new Date()}
                                    staticRanges={[]}
                                    inputRanges={[]}
                                    locale={enUS}
                                    rangeColors={['#FF4500']}
                                />
                            </div>
                        )}
                        <div className="calendar-external-actions">
                            <button
                                className={`confirm-dates-btn ${!datesSelected ? 'disabled' : ''}`}
                                onClick={handleDateRangeConfirm}
                                disabled={!datesSelected}
                            >
                                {datesSelected ? 'Confirm Dates' : 'Select dates to continue'}
                            </button>
                        </div>
                    </div>
                );
            case 'date-selection':
                return (
                    <div className="date-selection-container">
                        {/* Tab Navigation */}
                        <div className="date-tabs">
                            <button
                                className={`date-tab ${activeDateTab === 'calendar' ? 'active' : ''}`}
                                onClick={() => setActiveDateTab('calendar')}
                            >
                                <span className="tab-icon">📅</span>
                                <span className="tab-text">Calendar</span>
                            </button>
                            <button
                                className={`date-tab ${activeDateTab === 'flexible' ? 'active' : ''}`}
                                onClick={() => setActiveDateTab('flexible')}
                            >
                                <span className="tab-icon">🎯</span>
                                <span className="tab-text">Flexible Dates</span>
                            </button>
                        </div>

                        {/* Tab Content */}
                        <div className="tab-content">
                            {activeDateTab === 'calendar' && (
                                <div className="calendar-tab">
                                    <div className="date-range-container">
                                        <div
                                            className="date-range-input"
                                            onClick={() => {
                                                if (showCalendar) {
                                                    setShowCalendar(false);
                                                } else {
                                                    setShowCalendar(true);
                                                    // Reset datesSelected when opening calendar again
                                                    setDatesSelected(false);
                                                }
                                            }}
                                        >
                                            <span className="date-range-text">
                                                {`${format(dateRange[0].startDate, 'MMM dd, yyyy')} - ${format(dateRange[0].endDate, 'MMM dd, yyyy')}`}
                                            </span>
                                            <span className="date-range-icon">📅</span>
                                        </div>
                                        {showCalendar && (
                                            <div className="calendar-popup" ref={calendarRef}>
                                                <DateRange
                                                    onChange={handleDateRangeChange}
                                                    ranges={dateRange}
                                                    minDate={new Date()}
                                                    staticRanges={[]}
                                                    inputRanges={[]}
                                                    locale={enUS}
                                                    rangeColors={['#FF4500']}
                                                />
                                            </div>
                                        )}
                                        <div className="calendar-external-actions">
                                            <button
                                                className={`confirm-dates-btn ${!datesSelected ? 'disabled' : ''}`}
                                                onClick={handleDateRangeConfirm}
                                                disabled={!datesSelected}
                                            >
                                                {datesSelected ? 'Confirm Dates' : 'Select dates to continue'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeDateTab === 'flexible' && (
                                <div className="flexible-tab">
                                    <div className="flexible-options">
                                        <button
                                            className="flexible-option"
                                            onClick={() => handleAnswer('1-3 days')}
                                        >
                                            <span className="option-icon">🌅</span>
                                            <span className="option-text">1-3 days</span>
                                            <span className="option-desc">Weekend getaway</span>
                                        </button>
                                        <button
                                            className="flexible-option"
                                            onClick={() => handleAnswer('4-7 days')}
                                        >
                                            <span className="option-icon">🏖️</span>
                                            <span className="option-text">4-7 days</span>
                                            <span className="option-desc">Week vacation</span>
                                        </button>
                                        <button
                                            className="flexible-option"
                                            onClick={() => handleAnswer('1-2 weeks')}
                                        >
                                            <span className="option-icon">✈️</span>
                                            <span className="option-text">1-2 weeks</span>
                                            <span className="option-desc">Extended trip</span>
                                        </button>
                                        <button
                                            className="flexible-option"
                                            onClick={() => handleAnswer('2+ weeks')}
                                        >
                                            <span className="option-icon">🌍</span>
                                            <span className="option-text">2+ weeks</span>
                                            <span className="option-desc">Long adventure</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'multi-select':
                return (
                    <div className="question-options multi-select">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                className="question-option"
                                onClick={() => handleAnswer(option)}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                );
            case 'summary':
                return (
                    <div className="summary-container">
                        <div className="summary-items">
                            <div className="summary-item">
                                <div className="summary-label">
                                    <span className="summary-icon">🌍</span>
                                    <span>Destination</span>
                                </div>
                                <div className="summary-value">
                                    <span>{answers.destination || 'Not selected'}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setCurrentQuestionIndex(0); // Go back to destination question
                                            setAnimationState('entering');
                                            setTimeout(() => setAnimationState('visible'), 300);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div className="summary-label">
                                    <span className="summary-icon">📅</span>
                                    <span>Travel Dates</span>
                                </div>
                                <div className="summary-value">
                                    <span>
                                        {answers.startDate && answers.endDate
                                            ? `${format(new Date(answers.startDate), 'MMM dd, yyyy')} - ${format(new Date(answers.endDate), 'MMM dd, yyyy')}`
                                            : answers.dates || 'Not selected'
                                        }
                                    </span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setCurrentQuestionIndex(1); // Go back to dates question
                                            setAnimationState('entering');
                                            setTimeout(() => setAnimationState('visible'), 300);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div className="summary-label">
                                    <span className="summary-icon">💰</span>
                                    <span>Budget</span>
                                </div>
                                <div className="summary-value">
                                    <span>{answers.budget || 'Not selected'}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setCurrentQuestionIndex(2); // Go back to budget question
                                            setAnimationState('entering');
                                            setTimeout(() => setAnimationState('visible'), 300);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div className="summary-label">
                                    <span className="summary-icon">🎯</span>
                                    <span>Interests</span>
                                </div>
                                <div className="summary-value">
                                    <span>{answers.interests || 'Not selected'}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setCurrentQuestionIndex(3); // Go back to interests question
                                            setAnimationState('entering');
                                            setTimeout(() => setAnimationState('visible'), 300);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>

                            <div className="summary-item">
                                <div className="summary-label">
                                    <span className="summary-icon">👥</span>
                                    <span>Travel Style</span>
                                </div>
                                <div className="summary-value">
                                    <span>{answers.travelStyle || 'Not selected'}</span>
                                    <button
                                        className="edit-btn"
                                        onClick={() => {
                                            setCurrentQuestionIndex(4); // Go back to travel style question
                                            setAnimationState('entering');
                                            setTimeout(() => setAnimationState('visible'), 300);
                                        }}
                                    >
                                        ✏️ Edit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {creationError && (
                            <div className="creation-error">
                                <span className="error-icon">⚠️</span>
                                <span>{creationError}</span>
                            </div>
                        )}

                        <div className="summary-actions">
                            <button
                                className={`confirm-trip-btn ${isCreatingTrip ? 'loading' : ''}`}
                                onClick={() => handleAnswer('confirmed')}
                                disabled={isCreatingTrip}
                            >
                                {isCreatingTrip ? (
                                    <>
                                        <span className="btn-icon loading-spinner">⏳</span>
                                        <span>Creating Your Trip...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="btn-icon">🚀</span>
                                        <span>Start Planning My Trip</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    if (!isVisible) return null;

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="question-flow-overlay" style={fallbackStyles.overlay}>
            <div className="question-flow-backdrop" onClick={handleClose}></div>
            <div className={`question-box ${animationState}`} style={fallbackStyles.questionBox}>
                <div className="question-header" style={fallbackStyles.questionHeader}>
                    <span className="question-icon" style={fallbackStyles.questionIcon}>{currentQuestion.icon}</span>
                    <button className="question-close-btn" style={fallbackStyles.closeBtn} onClick={handleClose}>
                        ✕
                    </button>
                </div>
                <div className="question-content">
                    <h3 className="question-text" style={fallbackStyles.questionText}>{currentQuestion.question}</h3>
                    {renderQuestionInput(currentQuestion)}
                </div>
                <div className="question-progress" style={fallbackStyles.progressContainer}>
                    <div
                        className="progress-bar"
                        style={{
                            ...fallbackStyles.progressBar,
                            width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`
                        }}
                    ></div>
                    <span className="progress-text" style={fallbackStyles.progressText}>
                        {currentQuestionIndex + 1} of {questions.length}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default QuestionFlow; 