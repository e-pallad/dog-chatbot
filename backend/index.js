const express = require("express");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

const DOG_API_URL = "https://api.thedogapi.com/v1/breeds";
const DOG_API_KEY =
  "live_GAqpZhQoqZrfrgEdCnDttIgKSQS6AIqd3tfb8obBUjkb7t1xskPenJ5mDlGtKJwW"; // Replace with your actual API key
const DATA_FILE = path.resolve(__dirname, "dog_breeds.json");

// Function to fetch data from TheDogAPI if needed
async function fetchBreedsData() {
  let breedsData = [];

  // Check if `dog_breeds.json` exists
  if (fs.existsSync(DATA_FILE)) {
    console.log("Loading breeds data from local file.");
    breedsData = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } else {
    console.log("No local file found. Fetching data from TheDogAPI...");
  }

  // Check for missing image IDs
  const missingImageIds = breedsData.filter(
    (breed) => !breed.reference_image_id
  );

  if (missingImageIds.length > 0 || breedsData.length === 0) {
    console.log("Fetching breed data from TheDogAPI for missing entries...");

    try {
      const response = await axios.get(DOG_API_URL, {
        headers: { "x-api-key": DOG_API_KEY },
      });

      const apiBreeds = response.data;
      const updatedBreedsData = apiBreeds.map((breed) => {
        // Find existing data if available
        const existingBreed = breedsData.find(
          (b) => b.breedName === breed.name
        );

        return {
          breedName: breed.name,
          imageId: breed.reference_image_id || existingBreed?.imageId || null,
          image: breed.image || existingBreed?.image || null,
          size: existingBreed?.size || categorizeSize(breed.weight.metric),
          temperament:
            existingBreed?.temperament || breed.temperament || "Unknown",
          coatType: existingBreed?.coatType || "Unknown",
          coatColor: existingBreed?.coatColor || "Varies",
          exerciseNeeds:
            existingBreed?.exerciseNeeds || estimateExerciseNeeds(breed),
          groomingNeeds: existingBreed?.groomingNeeds || "Moderate",
          healthIssues: existingBreed?.healthIssues || "Varies",
          lifespan: existingBreed?.lifespan || breed.life_span,
          origin: existingBreed?.origin || breed.origin || "Unknown",
          popularity: existingBreed?.popularity || "Unknown",
          goodWithChildren:
            existingBreed?.goodWithChildren || estimateGoodWithChildren(breed),
          breedGroup:
            existingBreed?.breedGroup || breed.breed_group || "Unknown",
          externalLink:
            existingBreed?.externalLink ||
            `https://www.akc.org/dog-breeds/${breed.name
              .toLowerCase()
              .replace(/ /g, "-")}`,
        };
      });

      // Update breedsData
      breedsData = updatedBreedsData;

      // Save updated data to JSON file
      fs.writeFileSync(DATA_FILE, JSON.stringify(breedsData, null, 2));
      console.log("Breeds data updated and saved to local file.");
    } catch (error) {
      console.error("Error fetching breeds from TheDogAPI:", error);
    }
  } else {
    console.log("All breed data is already complete in the local file.");
  }

  return breedsData;
}

// Route to serve breeds data
app.get("/api/breeds", async (req, res) => {
  const breedsData = await fetchBreedsData();
  res.json(breedsData);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Helper functions
function categorizeSize(weight) {
  const avgWeight = parseFloat(
    weight.split("-").reduce((a, b) => parseFloat(a) + parseFloat(b)) / 2
  );
  if (avgWeight < 10) return "Small";
  else if (avgWeight < 25) return "Medium";
  else if (avgWeight < 40) return "Large";
  else return "Extra-large";
}

function estimateExerciseNeeds(breed) {
  if (breed.breed_group === "Working" || breed.breed_group === "Herding")
    return "High";
  else if (breed.breed_group === "Toy" || breed.size === "Small") return "Low";
  else return "Moderate";
}

function estimateGoodWithChildren(breed) {
  return breed.temperament &&
    breed.temperament.toLowerCase().includes("friendly")
    ? "Yes"
    : "Depends";
}
