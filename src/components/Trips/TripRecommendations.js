// src/components/Trips/TripRecommendations.js
import React, { useState, useEffect } from 'react';
import { parseAIRecommendations } from '../../utils/itineraryTextParser';
import './TripRecommendations.css';

// Robust JSON parsing algorithm that handles any kind of response
const parseRecommendations = (rawData) => {
    console.log('🔍 Starting robust parsing algorithm...');
    console.log('📝 Raw data type:', typeof rawData);
    console.log('📏 Raw data length:', rawData?.length);


    // Strategy 1: Already an object
    if (typeof rawData === 'object' && rawData !== null) {
        return { success: true, data: rawData, method: 'object' };
    }

    if (typeof rawData !== 'string') {
        console.warn('❌ Invalid data type:', typeof rawData);
        return { success: false, data: null, method: 'invalid_type', rawText: String(rawData) };
    }

    const cleanText = rawData.trim();

    // Strategy 2: Direct JSON parse
    try {
        const parsed = JSON.parse(cleanText);
        console.log('✅ Strategy 2: Direct JSON parse successful');
        return { success: true, data: parsed, method: 'direct_parse' };
    } catch (error) {
        console.log('❌ Strategy 2 failed:', error.message);
    }

    // Strategy 3: Extract JSON block (most common AI response format)
    try {
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ Strategy 3: JSON block extraction successful');
            return { success: true, data: parsed, method: 'json_extraction' };
        }
    } catch (error) {
        console.log('❌ Strategy 3 failed:', error.message);
    }

    // Strategy 4: Fix common JSON formatting issues
    try {
        let fixedJson = cleanText
            // Remove any text before first {
            .replace(/^[^{]*/, '')
            // Remove any text after last }
            .replace(/[^}]*$/, '')
            // Fix common quote issues
            .replace(/'/g, '"')
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
            .replace(/:\s*([^",\[\{\d][^",\]\}]*?)(\s*[,\}])/g, ': "$1"$2')  // Quote unquoted string values
            // Fix trailing commas
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            // Fix escaped quotes inside strings
            .replace(/\\"/g, '\\"');

        const parsed = JSON.parse(fixedJson);
        console.log('✅ Strategy 4: JSON fixing successful');
        return { success: true, data: parsed, method: 'json_fixing' };
    } catch (error) {
        console.log('❌ Strategy 4 failed:', error.message);
    }

    // Strategy 5: Aggressive JSON reconstruction
    try {
        // Look for key-value patterns and reconstruct JSON
        const keyValuePattern = /["']?(\w+)["']?\s*:\s*["']?([^"'\n,}]+)["']?/g;
        const matches = [...cleanText.matchAll(keyValuePattern)];

        if (matches.length > 0) {
            const reconstructed = {};
            matches.forEach(match => {
                const key = match[1].replace(/['"]/g, '');
                const value = match[2].replace(/['"]/g, '').trim();
                reconstructed[key] = value;
            });

            console.log('✅ Strategy 5: JSON reconstruction successful');
            return { success: true, data: reconstructed, method: 'reconstruction' };
        }
    } catch (error) {
        console.log('❌ Strategy 5 failed:', error.message);
    }

    // Strategy 6: Extract structured text sections
    try {
        const sections = {};

        // Look for common section patterns
        const sectionPatterns = [
            /(?:Day\s*\d+|Budget|Packing|Transportation|Cultural|Safety|Food)[\s:]+([^]*?)(?=(?:Day\s*\d+|Budget|Packing|Transportation|Cultural|Safety|Food)|$)/gi,
            /(\w+(?:\s+\w+)*):\s*([^]*?)(?=\w+(?:\s+\w+)*:|$)/g,
            /\*\*([^*]+)\*\*\s*([^]*?)(?=\*\*|$)/g  // Markdown bold headers
        ];

        for (const pattern of sectionPatterns) {
            const matches = [...cleanText.matchAll(pattern)];
            if (matches.length > 0) {
                matches.forEach(match => {
                    const key = match[1].trim().toLowerCase().replace(/\s+/g, '_');
                    const value = match[2].trim();
                    if (value) sections[key] = value;
                });
                break;
            }
        }

        if (Object.keys(sections).length > 0) {
            console.log('✅ Strategy 6: Text section extraction successful');
            return { success: true, data: sections, method: 'text_extraction' };
        }
    } catch (error) {
        console.log('❌ Strategy 6 failed:', error.message);
    }

    // Strategy 7: Fallback - return as single text block
    console.log('⚠️ All parsing strategies failed, returning as raw text');
    return {
        success: false,
        data: { raw_content: cleanText },
        method: 'raw_fallback',
        rawText: cleanText
    };
};

const TripRecommendations = ({ recommendations, trip, onParseToDailyPlans }) => {

    const [isParsingLoading, setIsParsingLoading] = useState(false);
    const [parseSuccess, setParseSuccess] = useState(false);
    const [hasAutoParsed, setHasAutoParsed] = useState(false);
    const [activeTab, setActiveTab] = useState('budget');

    const parseResult = parseRecommendations(recommendations);
    const { success, data, method, rawText } = parseResult;

    // Auto-parse recommendations to daily plans when available
    useEffect(() => {
        const autoParseToDailyPlans = async () => {
            if (!trip || hasAutoParsed || !onParseToDailyPlans || !data) {
                return;
            }

            console.log('🤖 Auto-parsing recommendations to daily plans...');
            setIsParsingLoading(true);

            try {
                // Parse AI recommendations into daily plan items
                const parsedItems = parseAIRecommendations(
                    recommendations,
                    trip.start_date,
                    trip.end_date
                );

                console.log('📋 Auto-parsed items:', parsedItems);

                if (parsedItems.length > 0) {
                    // Call parent function to handle bulk creation
                    await onParseToDailyPlans(parsedItems);
                    setParseSuccess(true);
                    setHasAutoParsed(true);
                    setTimeout(() => setParseSuccess(false), 3000);
                }
            } catch (error) {
                console.error('❌ Error auto-parsing to daily plans:', error);
            } finally {
                setIsParsingLoading(false);
            }
        };

        // Small delay to ensure all components are loaded
        const timeoutId = setTimeout(autoParseToDailyPlans, 1000);
        return () => clearTimeout(timeoutId);
    }, [trip, data, hasAutoParsed, onParseToDailyPlans, recommendations]);

    // Handle different parsing outcomes
    if (!success && method === 'raw_fallback') {
        console.log('📝 Showing raw text since all parsing strategies failed');
        return (
            <div className="trip-recommendations">
                <h3>Trip Recommendations</h3>
                {isParsingLoading && (
                    <div className="auto-parse-status">
                        <span className="loading-spinner">⏳</span>
                        Auto-adding recommendations to your daily plans...
                    </div>
                )}
                {parseSuccess && (
                    <div className="auto-parse-status success">
                        <span className="success-icon">✅</span>
                        Recommendations automatically added to daily plans!
                    </div>
                )}
                <div className="parse-info">
                    <small style={{ color: '#666' }}>
                        ⚠️ Content parsed as text (Method: {method})
                    </small>
                </div>
                <div className="raw-recommendations">
                    <div className="recommendation-detail">
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            margin: 0,
                            background: '#f9f9f9',
                            padding: '1rem',
                            borderRadius: '8px',
                            border: '1px solid #e0e0e0'
                        }}>
                            {rawText || data?.raw_content || 'No content available'}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    // If we have no valid data at all
    if (!data) {
        return (
            <div className="trip-recommendations">
                <h3>🌟 AI Travel Guide</h3>
                <div className="no-recommendations">
                    <p>No recommendations available at this time.</p>
                    <small style={{ color: '#666' }}>Parse method: {method}</small>
                </div>
            </div>
        );
    }

    // Successfully parsed data - separate different types of content
    const renderRecommendations = () => {
        // Show parsing method for debugging
        const debugInfo = (
            <div className="parse-info" style={{ marginBottom: '1rem' }}>
                <small style={{ color: '#666' }}>
                    ✅ Content parsed successfully (Method: {method})
                </small>
            </div>
        );

        const generalSections = {
            budget: { icon: '💰', data: data.budget },
            packing: { icon: '🎒', data: data.packing },
            transportation: { icon: '🚗', data: data.transportation },
            cultural_tips: { icon: '🌍', data: data.cultural_tips },
            safety_considerations: { icon: '🛡️', data: data.safety_considerations }
        };

        const availableGeneralSections = Object.keys(generalSections).filter(key => generalSections[key].data);

        // Set default active tab to the first available section
        if (availableGeneralSections.length > 0 && !availableGeneralSections.includes(activeTab)) {
            setActiveTab(availableGeneralSections[0]);
        }

        return (
            <div className="recommendations-container">
                <div className="recommendations-tabs">
                    {availableGeneralSections.map(key => (
                        <button
                            key={key}
                            className={`tab-button ${activeTab === key ? 'active' : ''}`}
                            onClick={() => setActiveTab(key)}
                        >
                            {generalSections[key].icon} {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </button>
                    ))}
                </div>

                <div className="recommendations-content">
                    {availableGeneralSections.map(key =>
                        activeTab === key && (
                            <div key={key} className="tab-pane active">
                                <div className="general-recommendations-card">
                                    <div className="recommendation-detail">
                                        <p>{String(generalSections[key].data)}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="trip-recommendations">
            <div className="recommendations-header">
                <h3>🌟 AI Travel Guide</h3>
                {(isParsingLoading || parseSuccess) && (
                    <div className={`auto-parse-status ${parseSuccess ? 'success' : ''}`}>
                        {isParsingLoading ? (
                            <>
                                <span className="loading-spinner">⏳</span>
                                Auto-adding to daily plans...
                            </>
                        ) : parseSuccess ? (
                            <>
                                <span className="success-icon">✅</span>
                                Added to daily plans!
                            </>
                        ) : null}
                    </div>
                )}
            </div>
            {renderRecommendations()}
        </div>
    );
};

export default TripRecommendations;