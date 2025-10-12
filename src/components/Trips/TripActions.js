import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { deleteTrip } from '../../services/tripService';
import './TripActions.css';

const TripActions = ({ trip, onDeleted }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
    const navigate = useNavigate();
    const actionsRef = useRef(null);

    const toggleMenu = (e) => {
        e.stopPropagation(); // Prevent card click

        if (!menuOpen && actionsRef.current) {
            // Calculate position for dropdown
            const rect = actionsRef.current.getBoundingClientRect();
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            const dropdownWidth = window.innerWidth > 768 ? 180 : (window.innerWidth > 480 ? 160 : 140);
            const viewportHeight = window.innerHeight;

            // Calculate left position, ensuring dropdown stays within viewport
            let left = rect.right + scrollLeft - dropdownWidth;
            if (left < scrollLeft + 10) {
                left = scrollLeft + 10; // Ensure it doesn't go off the left edge
            }

            // Calculate top position, check if there's space below, otherwise position above
            let top = rect.bottom + scrollTop + 10;
            const dropdownHeight = 120; // Approximate height
            if (rect.bottom + dropdownHeight > viewportHeight) {
                top = rect.top + scrollTop - dropdownHeight - 10;
            }

            setDropdownPosition({ top, left });
        }

        setMenuOpen(!menuOpen);
    };

    // Close menu when clicking outside or on scroll/resize
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (actionsRef.current && !actionsRef.current.contains(event.target)) {
                // Check if the click is on the dropdown portal - if so, don't close
                const dropdownPortal = event.target.closest('.actions-dropdown-portal');
                if (!dropdownPortal) {
                    setMenuOpen(false);
                }
            }
        };

        const handleScroll = () => {
            if (menuOpen) {
                setMenuOpen(false);
            }
        };

        const handleResize = () => {
            if (menuOpen) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('scroll', handleScroll, true);
            window.addEventListener('resize', handleResize);
            return () => {
                document.removeEventListener('mousedown', handleClickOutside);
                window.removeEventListener('scroll', handleScroll, true);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [menuOpen]);

    const handleUpdate = (e) => {
        e.stopPropagation(); // Prevent card click
        navigate(`/trips/${trip.id}/edit`);
    };

    const handleDelete = (e) => {
        e.stopPropagation(); // Prevent card click
        setConfirmDelete(true);
    };

    const confirmDeletion = async (e) => {
        e.stopPropagation(); // Prevent card click
        try {
            await deleteTrip(trip.id);
            setConfirmDelete(false);
            setMenuOpen(false);
            if (onDeleted) onDeleted(trip.id);
        } catch (error) {
            console.error('Error deleting trip:', error);
            alert('Failed to delete trip.');
        }
    };

    const cancelDeletion = (e) => {
        e.stopPropagation(); // Prevent card click
        setConfirmDelete(false);
        setMenuOpen(false); // Also close the menu
    };

    return (
        <>
            <div className="trip-actions" ref={actionsRef} onClick={(e) => e.stopPropagation()}>
                <button className={`actions-btn ${menuOpen ? 'menu-open' : ''}`} onClick={toggleMenu}>
                    <span className="actions-icon">...</span>
                </button>
            </div>

            {/* Render dropdown in portal to avoid overflow clipping */}
            {menuOpen && createPortal(
                <div
                    className="actions-dropdown-portal"
                    style={{
                        position: 'absolute',
                        top: `${dropdownPosition.top}px`,
                        left: `${dropdownPosition.left}px`,
                        zIndex: 1000
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="actions-dropdown">
                        <button className="action-item edit-action" onClick={handleUpdate}>
                            <span className="action-icon">✏️</span>
                            <span className="action-text">Edit Trip</span>
                        </button>
                        <button className="action-item delete-action" onClick={handleDelete}>
                            <span className="action-icon">🗑️</span>
                            <span className="action-text">Delete Trip</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Render confirm modal in portal */}
            {confirmDelete && createPortal(
                <div className="confirm-overlay" onClick={(e) => e.stopPropagation()}>
                    <div className="confirm-modal">
                        <div className="confirm-header">
                            <span className="confirm-icon">⚠️</span>
                            <h3>Delete Trip</h3>
                        </div>
                        <p>Are you sure you want to delete <strong>"{trip.trip_name}"</strong>?</p>
                        <p className="confirm-warning">This action cannot be undone.</p>
                        <div className="confirm-actions">
                            <button className="cancel-btn" onClick={cancelDeletion}>
                                <span className="btn-icon">❌</span>
                                Cancel
                            </button>
                            <button className="delete-btn" onClick={confirmDeletion}>
                                <span className="btn-icon">🗑️</span>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default TripActions;