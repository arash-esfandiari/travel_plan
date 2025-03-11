-- Insert Users
INSERT INTO users (name, email, password)
VALUES (
        'Alice Johnson',
        'alice@example.com',
        '$2b$10$5hKljhzGZmz02szgyxgAeOvH8AIXi.EFnq4lv2R3rDJei02eAjmJa'
    ),
    -- hashed password: password123
    (
        'Bob Smith',
        'bob@example.com',
        '$2b$10$Z5R1VUMgADZkLj8I68zE5uU7Sxy7vvYl/xyN9FEcXOEi49Y/mO5s6'
    ),
    -- hashed password: bobpass456
    (
        'Carol Williams',
        'carol@example.com',
        '$2b$10$Lj3tAb1pXAdh0eXHLV8Eme9Diyc8L4bMynN9A3zJ8fH1Hv3I29x0y'
    );
-- hashed password: mysecurepass
-- Insert Trips
INSERT INTO trips (
        user_id,
        trip_name,
        start_date,
        end_date,
        description
    )
VALUES (
        1,
        'European Adventure',
        '2024-06-01',
        '2024-06-21',
        'Exploring top European cities.'
    ),
    (
        2,
        'Japan Exploration',
        '2024-07-10',
        '2024-07-25',
        'A cultural journey through Japan.'
    ),
    (
        3,
        'US Road Trip',
        '2024-08-05',
        '2024-08-20',
        'Driving across the US, coast to coast.'
    );
-- Insert Itinerary Items for European Adventure (Trip ID 1)
INSERT INTO itinerary_items (
        trip_id,
        type,
        title,
        start_time,
        end_time,
        location,
        cost,
        notes
    )
VALUES (
        1,
        'Flight',
        'Flight to Paris',
        '2024-06-01 09:00:00',
        '2024-06-01 15:00:00',
        'Toronto Pearson Airport to Paris Charles de Gaulle',
        750.00,
        'Direct flight.'
    ),
    (
        1,
        'Hotel',
        'Hotel Stay in Paris',
        '2024-06-01 16:00:00',
        '2024-06-05 11:00:00',
        'Hotel Le Meurice, Paris',
        1200.00,
        'Luxury stay near the Louvre.'
    ),
    (
        1,
        'Activity',
        'Eiffel Tower Visit',
        '2024-06-02 10:00:00',
        '2024-06-02 12:00:00',
        'Eiffel Tower, Paris',
        30.00,
        'Pre-booked tickets.'
    );
-- Insert Itinerary Items for Japan Exploration (Trip ID 2)
INSERT INTO itinerary_items (
        trip_id,
        type,
        title,
        start_time,
        end_time,
        location,
        cost,
        notes
    )
VALUES (
        2,
        'Flight',
        'Flight to Tokyo',
        '2024-07-10 08:00:00',
        '2024-07-11 08:00:00',
        'Los Angeles International Airport to Narita Airport',
        950.00,
        'Economy Class'
    ),
    (
        2,
        'Hotel',
        'Stay in Shinjuku',
        '2024-07-11 14:00:00',
        '2024-07-16 11:00:00',
        'Hotel Gracery Shinjuku, Tokyo',
        800.00,
        'Godzilla view room.'
    ),
    (
        2,
        'Activity',
        'Mt. Fuji Tour',
        '2024-07-14 07:00:00',
        '2024-07-14 19:00:00',
        'Mount Fuji, Japan',
        200.00,
        'Full-day guided tour.'
    );
-- Insert Itinerary Items for US Road Trip (Trip ID 3)
INSERT INTO itinerary_items (
        trip_id,
        type,
        title,
        start_time,
        end_time,
        location,
        cost,
        notes
    )
VALUES (
        3,
        'Car Rental',
        'Pick up rental car',
        '2024-08-05 09:00:00',
        '2024-08-05 10:00:00',
        'New York City',
        400.00,
        'SUV rental for the entire trip.'
    ),
    (
        3,
        'Activity',
        'Grand Canyon Visit',
        '2024-08-12 09:00:00',
        '2024-08-12 17:00:00',
        'Grand Canyon National Park',
        50.00,
        'Park entrance fee.'
    ),
    (
        3,
        'Hotel',
        'Stay in San Francisco',
        '2024-08-18 15:00:00',
        '2024-08-20 11:00:00',
        'Fairmont San Francisco',
        500.00,
        'Room with a city view.'
    );