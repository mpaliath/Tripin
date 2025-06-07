const fs   = require('fs');
const path = require('path');
const envPath = path.join(__dirname, '.env');   // will exist only in local builds

require('dotenv').config();   

const express = require("express");
const app = express();
app.use(express.json());

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

const clientPath = path.join(__dirname, "../client");
app.use(express.static(clientPath));

const adventureRouter = require("./routes/adventure").default;
app.use(adventureRouter);

const recommendationRouter = require("./routes/recommendation").default;
app.use(recommendationRouter);

//app.get("/api/adventures", (_: any, res: any) => res.json(adventures));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
