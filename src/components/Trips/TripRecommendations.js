// src/components/Trips/TripRecommendations.js
import React from 'react';
import './TripRecommendations.css';

const TripRecommendations = ({ recommendations }) => {
    console.log('🔍 TripRecommendations - Raw recommendations:', recommendations);
    console.log('🔍 TripRecommendations - Type:', typeof recommendations);
    console.log('🔍 TripRecommendations - Length:', recommendations?.length);

    // Show first 500 characters for debugging
    if (typeof recommendations === 'string') {
        console.log('🔍 TripRecommendations - First 500 chars:', recommendations.substring(0, 500));
        console.log('🔍 TripRecommendations - Last 200 chars:', recommendations.substring(Math.max(0, recommendations.length - 200)));
    }

    let recObj = {};
    let isJsonParsed = false;
    let rawText = '';

    // If recommendations is a string, try to parse it.
    if (typeof recommendations === 'string') {
        rawText = recommendations;

        // Try multiple parsing strategies
        try {
            // Strategy 1: Direct JSON parse
            recObj = JSON.parse(recommendations);
            isJsonParsed = true;
            console.log('✅ JSON parsed successfully with direct parse');
        } catch (error1) {
            console.warn('❌ Direct JSON parse failed:', error1.message);

            try {
                // Strategy 2: Extract JSON from text (look for { ... })
                const jsonMatch = recommendations.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    recObj = JSON.parse(jsonMatch[0]);
                    isJsonParsed = true;
                    console.log('✅ JSON parsed successfully with regex extraction');
                } else {
                    throw new Error('No JSON object found in text');
                }
            } catch (error2) {
                console.warn('❌ Regex JSON extraction failed:', error2.message);

                try {
                    // Strategy 3: Try to fix common JSON issues
                    let fixedJson = recommendations
                        .replace(/'/g, '"')  // Replace single quotes with double quotes
                        .replace(/(\w+):/g, '"$1":')  // Quote unquoted keys
                        .replace(/,\s*}/g, '}')  // Remove trailing commas
                        .replace(/,\s*]/g, ']'); // Remove trailing commas in arrays

                    recObj = JSON.parse(fixedJson);
                    isJsonParsed = true;
                    console.log('✅ JSON parsed successfully with fixes');
                } catch (error3) {
                    console.error('❌ All JSON parsing strategies failed:', error3.message);
                    isJsonParsed = false;
                }
            }
        }
    } else if (typeof recommendations === 'object' && recommendations !== null) {
        recObj = recommendations;
        isJsonParsed = true;
        console.log('✅ Recommendations already an object');
    }

    // If JSON parsing failed, show raw text with basic formatting
    if (!isJsonParsed && rawText) {
        console.log('📝 Showing raw text since JSON parsing failed');
        return (
            <div className="trip-recommendations">
                <h3>Trip Recommendations</h3>
                <div className="raw-recommendations">
                    <div className="recommendation-detail">
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'inherit',
                            fontSize: '0.95rem',
                            lineHeight: '1.5',
                            margin: 0
                        }}>
                            {rawText}
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    // If we have no valid data at all
    if (!isJsonParsed && !rawText) {
        return (
            <div className="trip-recommendations">
                <h3>Trip Recommendations</h3>
                <div className="no-recommendations">
                    <p>No recommendations available at this time.</p>
                </div>
            </div>
        );
    }

    // Separate general recommendations and day-specific recommendations.
    const generalKeys = [];
    const dayKeys = [];

    Object.keys(recObj).forEach(key => {
        if (key.toLowerCase().startsWith("day")) {
            dayKeys.push(key);
        } else {
            generalKeys.push(key);
        }
    });

    return (
        <div className="trip-recommendations">
            <h3>Trip Recommendations</h3>

            {generalKeys.length > 0 && (
                <div className="general-recommendations">
                    <h4>General Recommendations</h4>
                    {generalKeys.map(key => (
                        <div key={key} className="recommendation-detail">
                            <strong>{key}:</strong> <span>{recObj[key]}</span>
                        </div>
                    ))}
                </div>
            )}

            {dayKeys.length > 0 && (
                <div className="day-recommendations">
                    <h4>Day-by-Day Itinerary</h4>
                    {dayKeys.map(day => (
                        <div key={day} className="recommendation-item">
                            <h5>{day}</h5>
                            {typeof recObj[day] === 'object' ?
                                Object.entries(recObj[day]).map(([subKey, content]) => (
                                    <div key={subKey} className="recommendation-detail">
                                        <strong>{subKey}:</strong> <span>{content}</span>
                                    </div>
                                )) :
                                <div className="recommendation-detail">
                                    <span>{recObj[day]}</span>
                                </div>
                            }
                        </div>
                    ))}
                </div>
            )}

            {generalKeys.length === 0 && dayKeys.length === 0 && isJsonParsed && (
                <div className="no-structured-data">
                    <p>Recommendations received but in unexpected format.</p>
                    <details>
                        <summary>View raw data</summary>
                        <pre style={{
                            whiteSpace: 'pre-wrap',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            background: '#f5f5f5',
                            padding: '1rem',
                            borderRadius: '4px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(recObj, null, 2)}
                        </pre>
                    </details>
                </div>
            )}
        </div>
    );
};

export default TripRecommendations;