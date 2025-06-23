const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();   

const express = require("express");
const app = express();
const session = require('express-session');
const passport = require('passport');

// Trust proxy for Azure App Service
app.set('trust proxy', 1);

app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// Mock data
const adventures = [
  {
    id: "animals",
    title: "Animal Encounters + Picnic",
    subtitle: "Woodland Park Zoo + Green Lake",
    image: "/images/zoo.jpg"
  },
  {
    id: "forest",
    title: "Forest Hike + Donuts",
    subtitle: "Twin Falls Trail + Bakery",
    image: "/images/forest-hike.jpg"
  },
  {
    id: "beach",
    title: "Beach Play + Ice Cream",
    subtitle: "Alki Beach + Molly Moon’s",
    image: "/images/beach.jpg"
  }
];

// Serve static files from the built client
// The client files are copied to dist/client during build
const clientPath = path.join(__dirname, "../client");

app.use(express.static(clientPath));

const adventureRouter = require("./routes/adventure").default;
app.use(adventureRouter);

const recommendationRouter = require("./routes/recommendation").default;
app.use(recommendationRouter);

const authRouter = require("./routes/auth").default;
app.use(authRouter);

// SPA fallback - serve index.html for any non-API routes
app.get('*', (req: any, res: any) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

//app.get("/api/adventures", (_: any, res: any) => res.json(adventures));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
