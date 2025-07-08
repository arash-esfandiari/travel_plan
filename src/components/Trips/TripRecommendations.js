// src/components/Trips/TripRecommendations.js
import React from 'react';
import './TripRecommendations.css';

// Robust JSON parsing algorithm that handles any kind of response
const parseRecommendations = (rawData) => {
    console.log('🔍 Starting robust parsing algorithm...');
    console.log('📝 Raw data type:', typeof rawData);
    console.log('📏 Raw data length:', rawData?.length);

    if (typeof rawData === 'string') {
        console.log('🔤 First 300 chars:', rawData.substring(0, 300));
        console.log('🔚 Last 200 chars:', rawData.substring(Math.max(0, rawData.length - 200)));
    }

    // Strategy 1: Already an object
    if (typeof rawData === 'object' && rawData !== null) {
        console.log('✅ Strategy 1: Already an object');
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
            /(?:Day\s*\d+|Budget|Packing|Transportation|Cultural|Safety|Food|Itinerary)[\s:]+([^]*?)(?=(?:Day\s*\d+|Budget|Packing|Transportation|Cultural|Safety|Food|Itinerary)|$)/gi,
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

const TripRecommendations = ({ recommendations }) => {
    console.log('🔍 TripRecommendations component received:', recommendations);

    const parseResult = parseRecommendations(recommendations);
    const { success, data, method, rawText } = parseResult;

    console.log('📊 Parse result:', { success, method, dataKeys: Object.keys(data || {}) });

    // Handle different parsing outcomes
    if (!success && method === 'raw_fallback') {
        console.log('📝 Showing raw text since all parsing strategies failed');
        return (
            <div className="trip-recommendations">
                <h3>Trip Recommendations</h3>
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
                <h3>Trip Recommendations</h3>
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

        // Handle nested itinerary structure
        if (data.itinerary && typeof data.itinerary === 'object') {
            const itineraryKeys = Object.keys(data.itinerary);
            const otherKeys = Object.keys(data).filter(key => key !== 'itinerary');

            return (
                <div>
                    {debugInfo}

                    {/* General recommendations */}
                    {otherKeys.length > 0 && (
                        <div className="general-recommendations">
                            <h4>General Information</h4>
                            {otherKeys.map(key => (
                                <div key={key} className="recommendation-detail">
                                    <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                                    <div style={{ marginTop: '0.5rem' }}>
                                        {typeof data[key] === 'object' ?
                                            JSON.stringify(data[key], null, 2) :
                                            String(data[key])
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Day-by-day itinerary */}
                    {itineraryKeys.length > 0 && (
                        <div className="day-recommendations">
                            <h4>Day-by-Day Itinerary</h4>
                            {itineraryKeys.map(dayKey => {
                                const dayData = data.itinerary[dayKey];
                                return (
                                    <div key={dayKey} className="recommendation-item">
                                        <h5>{dayKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                                        {typeof dayData === 'object' ?
                                            Object.entries(dayData).map(([subKey, content]) => (
                                                <div key={subKey} className="recommendation-detail">
                                                    <strong>{subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                                                    <div style={{ marginTop: '0.5rem' }}>
                                                        {String(content)}
                                                    </div>
                                                </div>
                                            )) :
                                            <div className="recommendation-detail">
                                                <div>{String(dayData)}</div>
                                            </div>
                                        }
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        // Handle flat structure or simple key-value pairs
        const allKeys = Object.keys(data);
        const dayKeys = allKeys.filter(key => key.toLowerCase().includes('day'));
        const generalKeys = allKeys.filter(key => !key.toLowerCase().includes('day'));

        return (
            <div>
                {debugInfo}

                {/* General recommendations */}
                {generalKeys.length > 0 && (
                    <div className="general-recommendations">
                        <h4>General Recommendations</h4>
                        {generalKeys.map(key => (
                            <div key={key} className="recommendation-detail">
                                <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                                <div style={{ marginTop: '0.5rem' }}>
                                    {typeof data[key] === 'object' ?
                                        <pre style={{
                                            fontFamily: 'inherit',
                                            margin: 0,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {JSON.stringify(data[key], null, 2)}
                                        </pre> :
                                        String(data[key])
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Day-specific recommendations */}
                {dayKeys.length > 0 && (
                    <div className="day-recommendations">
                        <h4>Day-by-Day Information</h4>
                        {dayKeys.map(dayKey => (
                            <div key={dayKey} className="recommendation-item">
                                <h5>{dayKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
                                <div className="recommendation-detail">
                                    {typeof data[dayKey] === 'object' ?
                                        <pre style={{
                                            fontFamily: 'inherit',
                                            margin: 0,
                                            whiteSpace: 'pre-wrap'
                                        }}>
                                            {JSON.stringify(data[dayKey], null, 2)}
                                        </pre> :
                                        String(data[dayKey])
                                    }
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Fallback for unexpected structure */}
                {generalKeys.length === 0 && dayKeys.length === 0 && (
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
                                {JSON.stringify(data, null, 2)}
                            </pre>
                        </details>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="trip-recommendations">
            <h3>Trip Recommendations</h3>
            {renderRecommendations()}
        </div>
    );
};

export default TripRecommendations;