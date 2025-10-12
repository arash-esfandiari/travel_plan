import React, { useRef, useState } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onFileSelected, initialPreview }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(initialPreview || null);

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file) {
            onFileSelected(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onFileSelected(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div
            className="image-uploader"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={handleClick}
        >
            {preview ? (
                <img src={preview} alt="Selected" className="uploader-preview" />
            ) : (
                <div className="uploader-placeholder">
                    <span className="plus-sign">+</span>
                    <p>Select Trip Image</p>
                </div>
            )}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />
        </div>
    );
};

export default ImageUploader;