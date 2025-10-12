import { format, addDays } from 'date-fns';

/**
 * Parse AI recommendations JSON structure into daily plan items
 * @param {string|Object} recommendations - Raw AI recommendations (JSON string or parsed object)
 * @param {string} startDate - Trip start date in YYYY-MM-DD format
 * @param {string} endDate - Trip end date in YYYY-MM-DD format
 * @returns {Array} Array of parsed daily plan items
 */
export const parseAIRecommendations = (recommendations, startDate, endDate) => {
    try {


        // Parse recommendations if it's a string
        let data = recommendations;
        if (typeof recommendations === 'string') {
            console.log('📝 Parsing string recommendations...');
            data = JSON.parse(recommendations);
            console.log('✅ Successfully parsed JSON');
        }

        // Extract itinerary section
        if (!data || !data.itinerary) {
            console.log('❌ No itinerary found in recommendations');
            return [];
        }

        const itinerary = data.itinerary;
        const parsedItems = [];
        let tempId = 1;


        // Process each day in the itinerary
        Object.keys(itinerary).forEach((dayKey, dayIndex) => {
            const dayData = itinerary[dayKey];
            const dayDate = addDays(new Date(startDate), dayIndex);
            const formattedDate = format(dayDate, 'yyyy-MM-dd');


            // Process day_plan content
            if (dayData.day_plan) {
                console.log(`🎯 Processing day_plan: ${dayData.day_plan.substring(0, 100)}...`);
                const dayPlanItems = parseItineraryText(dayData.day_plan, formattedDate, formattedDate);
                console.log(`✅ Parsed ${dayPlanItems.length} day plan items`);

                dayPlanItems.forEach((item, index) => {
                    const newItem = {
                        ...item,
                        id: `temp_${tempId++}`,
                        day: dayIndex + 1,
                        plan_date: formattedDate,
                        category: classifyActivity(item.title, item.description),
                        order: index
                    };
                    console.log(`📋 Adding day plan item:`, newItem);
                    parsedItems.push(newItem);
                });
            }

            // Process food recommendations as separate items
            if (dayData.food) {
                console.log(`🍽️ Processing food: ${dayData.food.substring(0, 100)}...`);
                const foodItems = parseItineraryText(dayData.food, formattedDate, formattedDate);
                console.log(`✅ Parsed ${foodItems.length} food items`);

                foodItems.forEach((item, index) => {
                    const newItem = {
                        ...item,
                        id: `temp_${tempId++}`,
                        day: dayIndex + 1,
                        plan_date: formattedDate,
                        category: 'Restaurant',
                        order: index + 1000 // Put food items after activities
                    };
                    console.log(`🍽️ Adding food item:`, newItem);
                    parsedItems.push(newItem);
                });
            }
        });


        // Deduplicate the results to prevent repetitive entries
        const uniqueItems = [];
        const seenTitles = new Set();

        for (const item of parsedItems) {
            const trimmedTitle = item.title.toLowerCase().trim();
            const key = `${item.plan_date}|${trimmedTitle}`;

            if (!seenTitles.has(key)) {
                uniqueItems.push(item);
                seenTitles.add(key);
            } else {
                console.log(`🗑️ Removing duplicate plan: "${item.title}" on ${item.plan_date}`);
            }
        }

        return uniqueItems;
    } catch (error) {
        console.error('❌ Error parsing AI recommendations:', error);
        console.error('📊 Error details:', {
            message: error.message,
            stack: error.stack,
            recommendationsType: typeof recommendations,
            startDate,
            endDate
        });
        return [];
    }
};

/**
 * Classify activity based on title and description to determine category
 * @param {string} title - Activity title
 * @param {string} description - Activity description
 * @returns {string} Category for the activity
 */
export const classifyActivity = (title, description) => {
    const text = `${title} ${description}`.toLowerCase();

    // Hotel/Accommodation keywords
    if (text.match(/\b(hotel|hostel|accommodation|stay|check.?in|check.?out|lodge|resort|airbnb|room|suite)\b/)) {
        return 'Hotel';
    }

    // Restaurant/Food keywords
    if (text.match(/\b(restaurant|cafe|food|eat|dining|lunch|dinner|breakfast|meal|cuisine|bistro|bar|pub|coffee|snack)\b/)) {
        return 'Restaurant';
    }

    // Transportation keywords
    if (text.match(/\b(transport|taxi|bus|train|metro|subway|flight|drive|walk|uber|lyft|tram|ferry|boat|car|rental)\b/)) {
        return 'Transportation';
    }

    // Attraction keywords
    if (text.match(/\b(museum|gallery|monument|church|cathedral|temple|palace|castle|park|garden|zoo|aquarium|tower|bridge|landmark|statue|memorial)\b/)) {
        return 'Attraction';
    }

    // Activity keywords
    if (text.match(/\b(tour|excursion|show|concert|theater|theatre|shopping|market|beach|hike|walk|explore|visit|experience|activity|sport|game)\b/)) {
        return 'Activity';
    }

    // Default to Activity
    return 'Activity';
};

/**
 * Main function to parse itinerary text into structured daily plan items
 * @param {string} text - The raw itinerary text
 * @param {string} startDate - Trip start date in YYYY-MM-DD format
 * @param {string} endDate - Trip end date in YYYY-MM-DD format
 * @returns {Array} Array of parsed daily plan items
 */
export const parseItineraryText = (text, startDate, endDate) => {
    if (!text || !text.trim()) {
        return [];
    }

    const cleanText = text.trim();
    const dayGroups = extractDayMarkers(cleanText);
    const parsedItems = [];
    let tempId = 1;

    // If no day markers found, treat as single day
    if (dayGroups.length === 0) {
        const sentences = parseSentences(cleanText);
        sentences.forEach((sentence, index) => {
            const { title, description } = extractTitleAndDescription(sentence);
            if (title) {
                parsedItems.push({
                    id: `temp_${tempId++}`,
                    day: 1,
                    plan_date: startDate,
                    category: classifyActivity(title, description),
                    title,
                    description,
                    originalText: sentence,
                    confidence: 0.5,
                    isEdited: false,
                    order: index
                });
            }
        });
        return parsedItems;
    }

    // Process each day group
    dayGroups.forEach((dayGroup, dayIndex) => {
        const sentences = parseSentences(dayGroup.content);
        const dayDate = addDays(new Date(startDate), dayIndex);
        const formattedDate = format(dayDate, 'yyyy-MM-dd');

        sentences.forEach((sentence, sentenceIndex) => {
            const { title, description } = extractTitleAndDescription(sentence);
            if (title) {
                parsedItems.push({
                    id: `temp_${tempId++}`,
                    day: dayIndex + 1,
                    plan_date: formattedDate,
                    category: classifyActivity(title, description),
                    title,
                    description,
                    originalText: sentence,
                    confidence: 0.5,
                    isEdited: false,
                    order: sentenceIndex
                });
            }
        });
    });

    return parsedItems;
};

/**
 * Extract day markers and group content by days
 * @param {string} text - The raw itinerary text
 * @returns {Array} Array of day groups with day number and content
 */
export const extractDayMarkers = (text) => {
    const dayGroups = [];

    // Patterns to match day markers
    const dayPatterns = [
        /^day\s+(\d+)[:\-\s]*/gmi,
        /^(\d+)(st|nd|rd|th)\s+day[:\-\s]*/gmi,
        /^day\s+(one|two|three|four|five|six|seven|eight|nine|ten)[:\-\s]*/gmi
    ];

    // Split text by lines for processing
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    let currentDay = null;
    let currentContent = [];

    for (const line of lines) {
        let isDayMarker = false;

        // Check if line matches any day pattern
        for (const pattern of dayPatterns) {
            pattern.lastIndex = 0; // Reset regex
            const match = pattern.exec(line);
            if (match) {
                // Save previous day if exists
                if (currentDay !== null && currentContent.length > 0) {
                    dayGroups.push({
                        day: currentDay,
                        content: currentContent.join(' ')
                    });
                }

                // Start new day
                currentDay = extractDayNumber(match[1] || match[0]);
                currentContent = [];
                isDayMarker = true;

                // Include remaining content after day marker
                const remainingContent = line.substring(match.index + match[0].length).trim();
                if (remainingContent) {
                    currentContent.push(remainingContent);
                }
                break;
            }
        }

        // If not a day marker, add to current content
        if (!isDayMarker) {
            if (currentDay === null) {
                // No day marker found yet, might be content before first day
                currentDay = 1;
            }
            currentContent.push(line);
        }
    }

    // Add the last day
    if (currentDay !== null && currentContent.length > 0) {
        dayGroups.push({
            day: currentDay,
            content: currentContent.join(' ')
        });
    }

    return dayGroups;
};

/**
 * Extract day number from text
 * @param {string} dayText - Text containing day number
 * @returns {number} Day number
 */
const extractDayNumber = (dayText) => {
    const numberWords = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };

    const lowerText = dayText.toLowerCase();
    if (numberWords[lowerText]) {
        return numberWords[lowerText];
    }

    const num = parseInt(dayText);
    return isNaN(num) ? 1 : num;
};

/**
 * Parse day content into individual sentences/activities
 * @param {string} dayText - Text content for a specific day
 * @returns {Array} Array of sentences
 */
export const parseSentences = (dayText) => {
    if (!dayText || !dayText.trim()) {
        return [];
    }

    // Split by common sentence delimiters
    const sentences = dayText
        .split(/[.!?;]|\n/)
        .map(sentence => sentence.trim())
        .filter(sentence => {
            // Filter out empty sentences and very short ones
            return sentence.length > 10 &&
                !sentence.match(/^(day\s+\d+|^\d+(st|nd|rd|th)\s+day)/i);
        })
        .map(sentence => {
            // Clean up sentence
            return sentence
                .replace(/^[-•*]\s*/, '') // Remove bullet points
                .replace(/^\d+\.\s*/, '') // Remove numbered lists
                .trim();
        })
        .filter(sentence => sentence.length > 5);

    return sentences;
};

/**
 * Extract title and description from a sentence
 * @param {string} sentence - The sentence to process
 * @returns {Object} Object with title and description
 */
export const extractTitleAndDescription = (sentence) => {
    if (!sentence || !sentence.trim()) {
        return { title: '', description: '' };
    }

    // Use the entire cleaned sentence as the title and leave the description empty.
    return {
        title: sentence.trim(),
        description: ''
    };
};