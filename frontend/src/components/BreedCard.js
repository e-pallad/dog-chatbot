import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
} from "@mui/material";
import axios from "axios";

const DOG_API_IMAGE_URL = "https://api.thedogapi.com/v1/images";
const DOG_API_KEY =
  "live_GAqpZhQoqZrfrgEdCnDttIgKSQS6AIqd3tfb8obBUjkb7t1xskPenJ5mDlGtKJwW"; // Replace with your actual API key

const BreedCard = ({ breed }) => {
  const [imageUrl, setImageUrl] = useState(null);

  // Fetch image URL when component mounts
  useEffect(() => {
    async function fetchImageUrl() {
      if (!breed.image) {
        if (breed.imageId) {
          try {
            const response = await axios.get(
              `${DOG_API_IMAGE_URL}/${breed.imageId}`,
              {
                headers: { "x-api-key": DOG_API_KEY },
              }
            );
            setImageUrl(response.data.url);
          } catch (error) {
            console.error(
              `Error fetching image for ${breed.breedName}:`,
              error
            );
            setImageUrl("https://via.placeholder.com/150"); // Fallback image
          }
        } else {
          setImageUrl("https://via.placeholder.com/150"); // Placeholder image if no ID
        }
      } else {
        setImageUrl(breed.image);
      }
    }

    fetchImageUrl();
  }, [breed.imageId]);

  return (
    <Card className="mb-4" sx={{ maxWidth: 345, mx: "auto" }}>
      <CardMedia
        component="img"
        height="140"
        image={imageUrl || "https://via.placeholder.com/150"}
        alt={`${breed.breedName} image`}
        loading="lazy"
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {breed.breedName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {`Size: ${breed.size}, Temperament: ${breed.temperament}, Lifespan: ${breed.lifespan}`}
        </Typography>
        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            href={breed.externalLink}
            target="_blank"
          >
            Learn More
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BreedCard;
