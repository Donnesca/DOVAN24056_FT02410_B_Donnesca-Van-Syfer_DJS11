import React, { useState, useEffect } from "react";
//import { Link } from "react-router-dom";

function Favorites() {
  const [favoriteEpisodes, setFavoriteEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAndGroupFavorites = async () => {
      setLoading(true);
      setError(null);
      const favoriteKeys = Object.keys(localStorage).filter(
        (key) =>
          key.startsWith("favorite-show-") &&
          localStorage.getItem(key) === "true"
      );
      const allFavoriteDetails = [];

      for (const key of favoriteKeys) {
        const parts = key.split("-");
        const showId = parts[2];
        const episodeId = parts[4];

        try {
          const response = await fetch(
            `https://podcast-api.netlify.app/id/${showId}`
          );
          if (response.ok) {
            const showData = await response.json();
            showData.seasons.forEach((season) => {
              const foundEpisode =
                season.episodes &&
                season.episodes.find((ep) => ep.id === episodeId);
              if (foundEpisode) {
                allFavoriteDetails.push({
                  show: showData,
                  season,
                  episode: foundEpisode,
                });
              }
            });
          }
        } catch (error) {
          console.error(`Error fetching show ${showId}:`, error);
          setError(error.message);
        }
      }

      // Sort favorites by show title then season title
      allFavoriteDetails.sort((a, b) => {
        if (a.show.title < b.show.title) return -1;
        if (a.show.title > b.show.title) return 1;
        if (a.season.title < b.season.title) return -1;
        if (a.season.title > b.season.title) return 1;
        return 0;
      });

      // Group favorites
      const groupedFavorites = {};
      allFavoriteDetails.forEach((fav) => {
        const showTitle = fav.show.title;
        const seasonTitle = fav.season.title;
        if (!groupedFavorites[showTitle]) {
          groupedFavorites[showTitle] = {};
        }
        if (!groupedFavorites[showTitle][seasonTitle]) {
          groupedFavorites[showTitle][seasonTitle] = [];
        }
        groupedFavorites[showTitle][seasonTitle].push(fav.episode);
      });

      setFavoriteEpisodes(groupedFavorites);
      setLoading(false);
    };

    fetchAndGroupFavorites();
  }, []);

  if (loading) {
    return <div className="loading">Loading favorite episodes...</div>;
  }

  if (error) {
    return (
      <div className="error">Error loading favorite episodes: {error}</div>
    );
  }

  if (Object.keys(favoriteEpisodes).length === 0) {
    return <div>No favorite episodes yet.</div>;
  }

  return (
    <div className="favorites">
      <h2>Your Favorite Episodes</h2>
      {Object.keys(favoriteEpisodes).map((showTitle) => (
        <div key={showTitle} className="show-group">
          <h3>{showTitle}</h3>
          {Object.keys(favoriteEpisodes[showTitle]).map((seasonTitle) => (
            <div key={seasonTitle} className="season-group">
              <h4>Season {seasonTitle}</h4>
              <ul>
                {favoriteEpisodes[showTitle][seasonTitle].map((episode) => (
                  <li key={episode.id}>
                    {episode.title}
                    <button
                      onClick={() =>
                        /* Implement play */ console.log("Play", episode.file)
                      }
                    >
                      Play
                    </button>
                    {/* Add remove from favorites button if needed */}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Favorites;
