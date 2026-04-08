import React, { useEffect, useState } from "react";
import { FaClipboardList, FaCommentDots, FaBell, FaTimes } from "react-icons/fa";
import "./dashboardReminderPopup.css";

const DashboardReminderPopup = ({ requisitionCount = 0, feedbackCount = 0 }) => {

    const [showPopup, setShowPopup] = useState(false);

    const totalCount = requisitionCount + feedbackCount;

    // Auto open after 1 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowPopup(true);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Auto close after 10 seconds
    useEffect(() => {
        if (showPopup) {
            const autoClose = setTimeout(() => {
                setShowPopup(false);
            }, 6000);
            return () => clearTimeout(autoClose);
        }
    }, [showPopup]);

    return (
        <>
            {/* Floating Bell Button */}
            <div className="reminder-bell-wrapper">
                <button
                    className="reminder-float-btn"
                    onClick={() => setShowPopup(true)}
                >
                    <FaBell />
                </button>

                {totalCount > 0 && (
                    <span className="reminder-badge">
                        {totalCount}
                    </span>
                )}
            </div>

            {/* Popup */}
            {showPopup && (
                <div className="reminder-popup shadow-lg">
                    <div className="reminder-header">
                        <div className="reminder-title">
                            <FaBell className="me-2 pulse-icon" />
                            Pending Notifications
                        </div>
                        <FaTimes
                            className="close-icon"
                            onClick={() => setShowPopup(false)}
                        />
                    </div>

                    <div className="reminder-body">

                        <div className="reminder-card req-card">
                            <div className="card-left">
                                <FaClipboardList className="reminder-icon" />
                            </div>
                            <div className="card-content">
                                <span className="card-label">Requisition Pending</span>
                                <span className="card-count">{requisitionCount}</span>
                            </div>
                        </div>

                        <div className="reminder-card feedback-card">
                            <div className="card-left">
                                <FaCommentDots className="reminder-icon" />
                            </div>
                            <div className="card-content">
                                <span className="card-label">Feedback Pending</span>
                                <span className="card-count">{feedbackCount}</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
};

export default DashboardReminderPopup;