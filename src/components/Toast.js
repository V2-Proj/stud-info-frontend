import React, { useEffect } from "react";

const COLORS = {
    error: "#e74c3c",
    warn: "#f39c12",
    info: "#3498db",
};

const Toast = ({ message, type = "error", onClose }) => {
    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div style={{
            position: "fixed",
            bottom: 24,
            right: 24,
            backgroundColor: COLORS[type] || COLORS.error,
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 6,
            boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            zIndex: 9999,
            minWidth: 220,
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 14,
        }}>
            <span style={{ flex: 1 }}>{message}</span>
            <button
                onClick={onClose}
                style={{
                    background: "none",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 18,
                    lineHeight: 1,
                    padding: 0,
                }}
            >
                ×
            </button>
        </div>
    );
};

export default Toast;
