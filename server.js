const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/campus-chronicles', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// News Schema
const newsSchema = new mongoose.Schema({
    title: String,
    content: String,
    category: String,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now },
    keywords: [String]
});

const News = mongoose.model('News', newsSchema);

// Admin Schema
const adminSchema = new mongoose.Schema({
    username: String,
    password: String
});

const Admin = mongoose.model('Admin', adminSchema);

// Routes
app.get('/api/news', async (req, res) => {
    const { sort, category, keyword } = req.query;
    let query = {};
    
    if (category) {
        query.category = category;
    }
    
    if (keyword) {
        query.keywords = { $in: [keyword] };
    }
    
    let sortOption = {};
    if (sort === 'newest') {
        sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
        sortOption = { createdAt: 1 };
    }
    
    try {
        const news = await News.find(query).sort(sortOption);
        res.json(news);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post('/api/news', async (req, res) => {
    const news = new News({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        imageUrl: req.body.imageUrl,
        keywords: req.body.keywords
    });

    try {
        const newNews = await news.save();
        res.status(201).json(newNews);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Serve static files
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
