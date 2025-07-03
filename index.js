const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Your user model
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/carboniq', { useNewUrlParser: true, useUnifiedTopology: true });

// Add your authentication and data retrieval routes here...

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
