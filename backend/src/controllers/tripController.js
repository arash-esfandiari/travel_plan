const tripModel = require('../models/tripModel');
const itineraryModel = require('../models/itineraryModel');
const OpenAI = require('openai').default; // Use CommonJS require and access the default export

exports.getAllTrips = async (req, res) => {
    try {
        const userId = req.user.userId;
        const trips = await tripModel.getUserTrips(userId);
        return res.json(trips);
    } catch (error) {
        console.error('Get trips error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await tripModel.getTripById(tripId);
        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        const itinerary = await itineraryModel.getItineraryForTrip(tripId);
        return res.json({ trip, itinerary });
    } catch (error) {
        console.error('Get trip by id error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.createTrip = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Extract required fields from the request body
        const { trip_name, start_date, end_date, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Ensure OPENAI_API_KEY is set
        if (!process.env.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is not defined in environment variables");
        }

        // Create an OpenAI client instance using the default export
        const GPTClient = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        // const deepseekClient = new OpenAI({
        //     baseURL: 'https://api.deepseek.com',
        //     apiKey: process.env.DEEPSEEK_API_KEY,
        // });


        // Construct the prompt for GPT-3.5 Turbo
        const prompt = `I am planning a trip to ${trip_name} from ${start_date} to ${end_date}; 
        please provide a detailed, day-by-day itinerary that includes clothing and essentials recommendations based on the season and typical weather in ${trip_name}, as well as a rough cost estimate in USD not including flights. 
        Return the result as a JSON object with name:value pairs. The name field of each pair should be the name of the section on the page (e.g., "Visit on Day 1", "Clothes to pack"), and the value field should be the content of that section.
        There should be one field to estimate the cost of the trip, one field for clothing and essentials recommendations for the entire trip, and one field for each day of the trip with restaurant and attraction recommendations for the day.
        Example:
        Recommendations: {
            "Cost Estimate": "Approximately $800-$1000 USD for 4 days including accommodation, food, city transportation, and activities.",
            "Clothes to Pack": "Lightweight clothing such as t-shirts, shorts, dresses, and sandals, as well as a light jacket for cooler evenings. Comfortable walking shoes, sunglasses, sunscreen, and a hat are also recommended.",
            "Day 1": {
                "Visit": "Explore the historic neighborhood of Alfama, visit the São Jorge Castle, and enjoy the views from Miradouro das Portas do Sol. Have lunch at a local tasca and try traditional Portuguese dishes like bacalhau (codfish) and pastéis de nata (custard tarts). In the afternoon, visit the Lisbon Cathedral and take a tram ride on Tram 28. End the day with dinner in Bairro Alto, known for its lively nightlife.",
                "Recommendations": "Tasca do Chico for lunch, Lisbon Cathedral, Tram 28 ride, dinner at Time Out Market Lisboa in Bairro Alto."
            },
            "Day 2": {
                "Visit": "Take a day trip to Sintra to visit Pena Palace, Quinta da Regaleira, and the town center. Enjoy a traditional Portuguese lunch in Sintra and explore the charming streets and shops. Return to Lisbon in the evening and have dinner in the trendy neighborhood of Chiado.",
                "Recommendations": "Pena Palace, Quinta da Regaleira, lunch at Tascantiga in Sintra, explore Chiado for dinner options."
            },
            "Day 3": {
                "Visit": "Spend the day in Belém visiting the Jerónimos Monastery, Belém Tower, and the Discoveries Monument. Enjoy a pastel de nata at Pastéis de Belém and have lunch at a seafood restaurant by the river. In the afternoon, visit the MAAT museum and take a stroll along the waterfront. End the day with dinner at a traditional Portuguese restaurant in Belém.",
                "Recommendations": "Jerónimos Monastery, Belém Tower, Discoveries Monument, Pastéis de Belém, lunch at Ponto Final, MAAT museum, dinner at Restaurante A Margem."
            },
            "Day 4": {
                "Visit": "Explore the modern district of Parque das Nações, visit the Oceanarium, and take a cable car ride for panoramic views. Have lunch at Vasco da Gama shopping center and spend the afternoon relaxing at the park or visiting the Lisbon Casino. End the trip with a farewell dinner at a waterfront restaurant.",
                "Recommendations": "Oceanarium, cable car ride, lunch at Time Out Market Lisboa in Vasco da Gama, relax at Parque das Nações, dinner at Restaurante Ponto Final."
            }
        }`;

        // Request a chat completion from GPT-3.5 Turbo
        const chatCompletion = await GPTClient.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        });

        // const chatCompletion = await deepseekClient.chat.completions.create({
        //     model: "deepseek-chat",
        //     messages: [{ role: 'user', content: prompt }],
        //     temperature: 0.7,
        // });

        // Extract recommendations from the response
        const recommendations = chatCompletion.choices[0].message.content;


        // Create the trip record in your database
        const newTrip = await tripModel.createTrip(
            userId,
            trip_name,
            start_date,
            end_date,
            description,
            imageUrl,
            recommendations,
        );

        return res.status(201).json(newTrip);
    } catch (error) {
        console.error('Create trip error:', error);
        return res.status(500).json({ error: 'Server error', details: error.message });
    }
};

exports.updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { trip_name, start_date, end_date, description } = req.body;
        const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
        const updatedTrip = await tripModel.updateTrip(
            tripId,
            trip_name,
            start_date,
            end_date,
            description,
            imageUrl
        );
        if (!updatedTrip) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        return res.json(updatedTrip);
    } catch (error) {
        console.error('Update trip error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const deleted = await tripModel.deleteTrip(tripId);
        if (!deleted) {
            return res.status(404).json({ error: 'Trip not found' });
        }
        return res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        console.error('Delete trip error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};