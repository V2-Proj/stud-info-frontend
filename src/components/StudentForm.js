import React, { useState, useEffect } from "react";
import { logger } from "../utils/logger";

const StudentForm = ({
  addStudent,
  selectedStudent,
  updateStudent,
  showToast,
  onSaved,
}) => {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [fees, setFees] = useState("");

  useEffect(() => {
    if (selectedStudent) {
      setName(selectedStudent.name);
      setAge(selectedStudent.age);
      setEmail(selectedStudent.email || "");
      setFees(selectedStudent.fees || "");
    }
  }, [selectedStudent]);

  const handleSubmit = (e) => {
    e.preventDefault();

    try {
      if (!name || !age || !email) {
        logger.warn("Empty fields submitted", { name, age, email, fees });
        showToast("Name, age and email are required", "warn");
        return;
      }

      const student = {
        id: selectedStudent ? selectedStudent.id : Date.now(),
        name,
        age,
        email,
        fees,
      };

      if (selectedStudent) {
        updateStudent(student);
      } else {
        //student
        addStudent();
      }

      setName("");
      setAge("");
      setEmail("");
      setFees("");
      onSaved();
    } catch (error) {
      logger.error("Form error", error);
      showToast("Failed to submit form");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}
    >
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        placeholder="Age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
      />
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Fees"
        type="number"
        value={fees}
        onChange={(e) => setFees(e.target.value)}
      />
      <button type="submit">Save</button>
    </form>
  );
};

export default StudentForm;
