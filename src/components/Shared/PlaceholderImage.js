import React from 'react';

/**
 * Generate a beautiful gradient placeholder image based on city name
 * @param {string} cityName - Name of the city for color generation
 * @param {string} className - CSS class name
 * @param {string} alt - Alt text
 */
const PlaceholderImage = ({ cityName = 'Unknown', className = '', alt = 'City placeholder' }) => {
    // Generate consistent colors based on city name
    const generateColors = (name) => {
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }

        // Generate hue from hash
        const hue = Math.abs(hash) % 360;

        // Use complementary colors for gradient
        const hue2 = (hue + 60) % 360;

        const color1 = `hsl(${hue}, 70%, 60%)`;
        const color2 = `hsl(${hue2}, 70%, 75%)`;

        return { color1, color2 };
    };

    const { color1, color2 } = generateColors(cityName);

    // Select appropriate travel emoji based on city name
    const getTravelEmoji = (name) => {
        const emojis = ['🏙️', '🗽', '🏛️', '🌆', '🎡', '🏰', '🗼', '🌉', '🏔️', '🏖️'];
        const index = Math.abs(name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % emojis.length;
        return emojis[index];
    };

    const emoji = getTravelEmoji(cityName);

    const placeholderStyle = {
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '0.5rem',
        color: 'white',
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        minHeight: '200px',
        width: '100%'
    };

    return (
        <div className={`placeholder-image ${className}`} style={placeholderStyle} title={alt}>
            <div style={{ fontSize: '3rem' }}>{emoji}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', textAlign: 'center' }}>
                {cityName}
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                Travel Destination
            </div>
        </div>
    );
};

export default PlaceholderImage; 