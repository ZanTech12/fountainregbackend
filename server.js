// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB (Simplified to prevent ECONNREFUSED and deprecation errors)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("MongoDB Connection Error:", err));

// Define Student Schema
const studentSchema = new mongoose.Schema({
    FirstName: { type: String, required: true },
    LastName: { type: String, required: true },
    Gender: { type: String, required: true },
    ClassName: { type: String, required: true },
    Section: { type: String, required: true, default: 'A' } // Unchangeable
});

const Student = mongoose.model('Student', studentSchema);

// Routes
// Register a new student
app.post('/api/students', async (req, res) => {
    try {
        const { FirstName, LastName, Gender, ClassName } = req.body;
        
        // Create new student, Section is hardcoded to 'A'
        const newStudent = new Student({
            FirstName,
            LastName,
            Gender,
            ClassName,
            Section: 'A' 
        });

        await newStudent.save();
        res.status(201).json({ message: "Student registered successfully!", student: newStudent });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Get all students (for Admin page)
app.get('/api/students', async (req, res) => {
    try {
        const students = await Student.find().sort({ createdAt: -1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

// Download CSV (for Admin page)
app.get('/api/students/download', async (req, res) => {
    try {
        const students = await Student.find();
        
        // Create CSV headers based on the image you provided
        const header = 'FirstName,LastName,Gender,ClassName,Section\n';
        const rows = students.map(s => 
            `${s.FirstName},${s.LastName},${s.Gender},${s.ClassName},${s.Section}`
        ).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
        res.status(200).send(header + rows);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));