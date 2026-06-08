import React from "react";
import { logger } from "../utils/logger";

const thStyle = {
    textAlign: "left",
    padding: "8px 12px",
    borderBottom: "2px solid #ccc",
};

const tdStyle = {
    padding: "8px 12px",
    borderBottom: "1px solid #eee",
};

const StudentList = ({ students, deleteStudent, selectStudent, showToast }) => {
    if (!students) {
        logger.error("Students is null");
        return <p>No students found</p>;
    }

    return (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
            <thead>
                <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Age</th>
                    <th style={thStyle}>Email</th>
                    <th style={thStyle}>Fees</th>
                    <th style={thStyle}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {students.map((s, index) => (
                    <tr key={index}>
                        <td style={tdStyle}>{s.name}</td>
                        <td style={tdStyle}>{s.age}</td>
                        <td style={tdStyle}>{s.email}</td>
                        <td style={tdStyle}>{s.fees}</td>
                        <td style={tdStyle}>
                            <button onClick={() => selectStudent(s)} style={{ marginRight: 8 }}>
                                Edit
                            </button>
                            <button
                                onClick={() => {
                                    try {
                                        deleteStudent(s.id);
                                    } catch (error) {
                                        logger.error("Delete failed", error);
                                        showToast("Failed to delete student");
                                    }
                                }}
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default StudentList;
