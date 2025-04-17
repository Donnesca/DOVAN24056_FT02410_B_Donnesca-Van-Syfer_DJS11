import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Favorites() {
  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavoriteEpisodes = async () => {
      setLoading(true);
      setError(null);
      const favoriteKeys = Object.keys(localStorage).filter((key) =>
        key.startsWith("favorite-show-")
      );
      const favoriteEpisodeDetails = [];

      for (const key of favoriteKeys) {
        if (localStorage.getItem(key) === "true") {
          const parts = key.split("-");
          const showId = parts[2];
          const episodeId = parts[4];

          try {
            const response = await fetch(
              `https://podcast-api.netlify.app/id/${showId}`
            );
            if (!response.ok) {
              console.warn(
                `Failed to fetch show ${showId}: ${response.status}`
              );
              continue;
            }
            const showData = await response.json();

            showData.seasons.forEach((season) => {
              const foundEpisode =
                season.episodes &&
                season.episodes.find((ep) => ep.id === episodeId);
              if (foundEpisode) {
                favoriteEpisodeDetails.push({
                  show: showData,
                  season,
                  episode: foundEpisode,
                });
              }
            });
          } catch (error) {
            console.error(`Error fetching show ${showId}:`, error);
            setError(error.message);
          }
        }
      }

      setFavoriteEpisodes(favoriteEpisodeDetails);
      setLoading(false);
    };

    fetchFavoriteEpisodes();
  }, []);

  if (loading) {
    return <div className="loading">Loading favorite episodes...</div>;
  }

  if (error) {
    return (
      <div className="error">Error loading favorite episodes: {error}</div>
    );
  }

  if (favoriteEpisodes.length === 0) {
    return <div>No favorite episodes yet.</div>;
  }

  return (
    <div className="favorites">
      <h2>Your Favorite Episodes</h2>
      <ul>
        {favoriteEpisodes.map((fav) => (
          <li key={`${fav.show.id}-${fav.season.id}-${fav.episode.id}`}>
            <Link to={`/show/${fav.show.id}`}>
              {fav.show.title} - Season {fav.season.title} - Episode{" "}
              {fav.episode.title}
            </Link>
            <button onClick={() => console.log("Play", fav.episode.file)}>
              Play
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Favorites;
