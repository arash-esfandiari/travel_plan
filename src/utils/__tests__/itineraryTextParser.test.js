import {
    parseItineraryText,
    extractDayMarkers,
    parseSentences,
    extractTitleAndDescription
} from '../itineraryTextParser';

describe('itineraryTextParser', () => {
    describe('extractTitleAndDescription', () => {
        test('should extract title and description with separator', () => {
            const sentence = "Visit Eiffel Tower - Take photos and enjoy the view from the top";
            const result = extractTitleAndDescription(sentence);

            expect(result.title).toBe("Visit Eiffel Tower");
            expect(result.description).toBe("Take photos and enjoy the view from the top");
        });

        test('should use entire sentence as title for short sentences', () => {
            const sentence = "Check into hotel";
            const result = extractTitleAndDescription(sentence);

            expect(result.title).toBe("Check into hotel");
            expect(result.description).toBe("");
        });

        test('should split long sentences without separators', () => {
            const sentence = "Visit the famous Louvre Museum and spend time exploring the art collections and historical artifacts";
            const result = extractTitleAndDescription(sentence);

            expect(result.title).toContain("Visit the famous Louvre Museum");
            expect(result.description).toContain("exploring");
        });
    });

    describe('parseSentences', () => {
        test('should split text into sentences', () => {
            const text = "Visit the museum. Have lunch at a local restaurant. Take a walking tour of the city.";
            const sentences = parseSentences(text);

            expect(sentences).toHaveLength(3);
            expect(sentences[0]).toContain("Visit the museum");
            expect(sentences[1]).toContain("Have lunch at a local restaurant");
            expect(sentences[2]).toContain("Take a walking tour");
        });

        test('should filter out very short sentences', () => {
            const text = "Visit museum. Go. Have lunch at the restaurant.";
            const sentences = parseSentences(text);

            expect(sentences).toHaveLength(2);
            expect(sentences).not.toContain("Go");
        });

        test('should handle bullet points', () => {
            const text = "• Visit the museum\n• Have lunch\n• Take photos";
            const sentences = parseSentences(text);

            expect(sentences[0]).toBe("Visit the museum");
            expect(sentences[1]).toBe("Have lunch");
        });
    });

    describe('extractDayMarkers', () => {
        test('should extract day markers with content', () => {
            const text = `Day 1: Visit Paris
      Explore the Eiffel Tower. Have dinner at a local bistro.
      
      Day 2: Museum day
      Visit Louvre Museum. See Mona Lisa.`;

            const dayGroups = extractDayMarkers(text);

            expect(dayGroups).toHaveLength(2);
            expect(dayGroups[0].day).toBe(1);
            expect(dayGroups[0].content).toContain("Visit Paris");
            expect(dayGroups[1].day).toBe(2);
            expect(dayGroups[1].content).toContain("Museum day");
        });

        test('should handle different day formats', () => {
            const text = `1st day: Arrival
      Check into hotel
      
      2nd day: Sightseeing
      Visit attractions`;

            const dayGroups = extractDayMarkers(text);

            expect(dayGroups).toHaveLength(2);
            expect(dayGroups[0].day).toBe(1);
            expect(dayGroups[1].day).toBe(2);
        });
    });

    describe('parseItineraryText', () => {
        test('should parse complete itinerary with day markers', () => {
            const text = `Day 1: Arrival in Paris
      Check into hotel near Champs-Élysées. Have dinner at local bistro.
      
      Day 2: Sightseeing
      Visit Eiffel Tower in the morning. Explore Louvre Museum in afternoon.`;

            const startDate = '2024-07-20';
            const endDate = '2024-07-21';

            const result = parseItineraryText(text, startDate, endDate);

            expect(result.length).toBeGreaterThan(0);
            expect(result[0].plan_date).toBe('2024-07-20');
            expect(result[0].day).toBe(1);
            expect(result[0].category).toBe('Activity');
            expect(result[0]).toHaveProperty('title');
            expect(result[0]).toHaveProperty('originalText');
        });

        test('should handle text without day markers', () => {
            const text = "Visit the museum. Have lunch. Take photos.";
            const startDate = '2024-07-20';
            const endDate = '2024-07-20';

            const result = parseItineraryText(text, startDate, endDate);

            expect(result.length).toBe(3);
            result.forEach(item => {
                expect(item.plan_date).toBe('2024-07-20');
                expect(item.day).toBe(1);
            });
        });

        test('should return empty array for empty text', () => {
            const result = parseItineraryText('', '2024-07-20', '2024-07-20');
            expect(result).toEqual([]);
        });
    });
});