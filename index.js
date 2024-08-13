const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());
app.use(
  cors({
    // origin: ["http://localhost:5173", "https://geolocation.topoship.com"],
    origin: "*",
    // methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  })
);

app.post("/api/recommend-place", async (req, res) => {
  const { locations } = req.body;
  if (locations.length !== 3)
    return res.status(400).send("Three locations required.");

  // Calculate geometric median or average point
  const latitudes = locations.map((loc) => loc.latitude);
  const longitudes = locations.map((loc) => loc.longitude);
  console.log(latitudes);
  console.log(longitudes);

  const avgLatitude = latitudes.reduce((a, b) => a + b) / latitudes.length;
  const avgLongitude = longitudes.reduce((a, b) => a + b) / longitudes.length;

  // Use Google Places API to find a place near the central point
  const response = await axios.get(
    "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
    {
      params: {
        location: `${avgLatitude},${avgLongitude}`,
        radius: 5000, // 5km radius
        type: "shopping_mall",
        key: process.env.GOOGLEAPIS_KEY,
      },
    }
  );

  if (response.data.results.length > 0) {
    const recommendedPlace = response.data.results[0];
    res.json({
      name: recommendedPlace.name,
      address: recommendedPlace.vicinity,
    });
  } else {
    res.status(404).send("No places found nearby.");
  }
});

app.listen(3000, () => {
  console.log("Server is running");
});
