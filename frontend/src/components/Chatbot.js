import React, { useState, useEffect } from "react";
import axios from "axios";
import { Box, TextField, Typography, Button, CardContent } from "@mui/material";
import nlp from "compromise";
import BreedCard from "./BreedCard";

const Chatbot = () => {
  const [breeds, setBreeds] = useState([]);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState([]);

  // Fetch breed data
  useEffect(() => {
    axios
      .get("/api/breeds")
      .then((res) => setBreeds(res.data))
      .catch((error) => console.error("Error fetching breed data:", error));
  }, []);

  const handleQuery = () => {
    if (!query.trim()) {
      setResponse([]); // Reset response if query is empty
      return;
    }

    const doc = nlp(query.toLowerCase());

    // Extract filters
    const size = doc.match("(small|medium|large|extra-large)").text();
    const exerciseNeed = doc.match("(high|moderate|low) exercise").text();
    const childFriendly = doc.match(
      "(good with children|family friendly)"
    ).found;
    const temperamentKeywords = doc
      .match("(friendly|aggressive|independent|playful)")
      .text();

    // Apply filters to breed data
    let filteredBreeds = breeds;
    if (size)
      filteredBreeds = filteredBreeds.filter(
        (breed) => breed.size.toLowerCase() === size.toLowerCase()
      );
    if (exerciseNeed)
      filteredBreeds = filteredBreeds.filter((breed) =>
        breed.exerciseNeeds.toLowerCase().includes(exerciseNeed.split(" ")[0])
      );
    if (childFriendly)
      filteredBreeds = filteredBreeds.filter(
        (breed) => breed.goodWithChildren === "Yes"
      );
    if (temperamentKeywords)
      filteredBreeds = filteredBreeds.filter((breed) =>
        breed.temperament.toLowerCase().includes(temperamentKeywords)
      );

    // Update response with filtered results
    setResponse(filteredBreeds);
  };

  // Clear response and reset query when needed
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setResponse([]); // Clear previous results to allow a fresh query
  };

  return (
    <Box className="p-5 max-w-lg mx-auto">
      <CardContent>
        <Typography variant="h4" className="mb-4 text-blue-600">
          Dog Breed Chatbot
        </Typography>

        <TextField
          label="Ask about a breed"
          variant="outlined"
          fullWidth
          className="mb-4"
          value={query}
          onChange={handleInputChange}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleQuery}
        >
          Ask
        </Button>

        {response.length > 0 ? (
          <Box className="mt-4">
            {response.map((breed, index) => (
              <BreedCard key={index} breed={breed} />
            ))}
          </Box>
        ) : (
          query && (
            <Typography variant="body1" className="mt-4 text-gray-500">
              No breeds found matching "{query}".
            </Typography>
          )
        )}
      </CardContent>
    </Box>
  );
};

export default Chatbot;
