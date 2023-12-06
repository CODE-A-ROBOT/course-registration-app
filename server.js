// server.js
const TEST_MODE = true;

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path'); // Import the 'path' module

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

if (!TEST_MODE) {
    // Connect to MongoDB (replace 'your-mongodb-uri' with your actual MongoDB URI)
    mongoose.connect('mongodb://localhost:27017/your-database-name', { useNewUrlParser: true, useUnifiedTopology: true });
}
const courseSchema = new mongoose.Schema({
    abbreviation: String,
    name: String,
    type: String,
    supertype: String,
  });
  
  const Course = mongoose.model('Course', courseSchema);
  
  // Serve static files from the 'public' folder
  app.use(express.static(path.join(__dirname, 'public')));
  
  // Routes
  app.get('/courses', async (req, res) => {
    const courses = await Course.find();
    res.json(courses);
  });
  
  // Route to add courses to the database
  app.post('/courses', async (req, res) => {
    try {
      const { abbreviation, name } = req.body;
      const newCourse = new Course({ abbreviation, name });
      await newCourse.save();
      res.status(201).json({ message: 'Course added successfully', course: newCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Route to delete a course based on its abbreviation
  app.delete('/courses/:abbreviation', async (req, res) => {
    try {
      const { abbreviation } = req.params;
      const deletedCourse = await Course.findOneAndDelete({ abbreviation });
      
      if (!deletedCourse) {
        return res.status(404).json({ error: 'Course not found' });
      }
  
      res.json({ message: 'Course deleted successfully', course: deletedCourse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Route to delete all courses
  app.delete('/courses', async (req, res) => {
    try {
      const deletedCourses = await Course.deleteMany({});
      res.json({ message: 'All courses deleted successfully', count: deletedCourses.deletedCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/courses', async (req, res) => {
  const courses = await Course.find();
  res.json(courses);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


