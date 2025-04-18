import React, { useState, useEffect } from "react";
import FavoritesToolbar from "./FavoritesToolbar";
import EpisodeList from "./EpisodeList";

function Favorites() {
  const [favoriteEpisodes, setFavoriteEpisodes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [sortOption, setSortOption] = useState("date");

  const fetchAndGroupFavorites = async () => {
    setLoading(true);
    setError(null);

    const favoriteKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("favorite-show-") && localStorage.getItem(key) === "true"
    );

    const allFavoriteDetails = [];

    for (const key of favoriteKeys) {
      const parts = key.split("-");
      const showId = parts[2];
      const episodeId = parts[4];
      const favoritedAt = localStorage.getItem(`${key}-timestamp`);

      try {
        const response = await fetch(
          `https://podcast-api.netlify.app/id/${showId}`
        );
        if (response.ok) {
          const showData = await response.json();
          let newestEpisodeDate;
          let oldestEpisodeDate = Infinity;

          showData.seasons.forEach((season) => {
            season.episodes?.forEach((episode) => {
              const pubDate = new Date(episode.published_at).getTime();
              if (!newestEpisodeDate || pubDate > newestEpisodeDate) {
                newestEpisodeDate = pubDate;
              }
              if (pubDate < oldestEpisodeDate) {
                oldestEpisodeDate = pubDate;
              }
              if (episode.id.toString() === episodeId.toString()) {
                allFavoriteDetails.push({
                  show: showData,
                  season: season,
                  episode: episode,
                  showId,
                  seasonId: season.id,
                  favoritedAt,
                  newestEpisodeDate,
                  oldestEpisodeDate: isFinite(oldestEpisodeDate)
                    ? oldestEpisodeDate
                    : null,
                });
              }
            });
          });
        }
      } catch (err) {
        console.error(`Error fetching show ${showId}:`, err);
        setError(err.message);
      }
    }

    allFavoriteDetails.sort((a, b) => {
      if (a.show.title < b.show.title) return -1;
      if (a.show.title > b.show.title) return 1;
      if (a.season.title < b.season.title) return -1;
      if (a.season.title > b.season.title) return 1;
      return 0;
    });

    const groupedFavorites = {};
    allFavoriteDetails.forEach((fav) => {
      const {
        show,
        season,
        episode,
        showId,
        seasonId,
        favoritedAt,
        newestEpisodeDate,
        oldestEpisodeDate,
      } = fav;
      if (!groupedFavorites[show.title])
        groupedFavorites[show.title] = {
          newestUpdate: newestEpisodeDate,
          oldestUpdate: oldestEpisodeDate,
          seasons: {},
        };
      if (!groupedFavorites[show.title].seasons[season.title])
        groupedFavorites[show.title].seasons[season.title] = [];
      groupedFavorites[show.title].seasons[season.title].push({
        episode,
        showId,
        seasonId,
        favoritedAt,
      });
    });

    setFavoriteEpisodes(groupedFavorites);
    setLoading(false);
  };

  useEffect(() => {
    fetchAndGroupFavorites();
  }, []);

  const sortFavoritesByTitle = (order = "asc") => {
    const sortedFavorites = JSON.parse(JSON.stringify(favoriteEpisodes));
    for (const showTitle in sortedFavorites) {
      for (const seasonTitle in sortedFavorites[showTitle].seasons) {
        sortedFavorites[showTitle].seasons[seasonTitle].sort((a, b) => {
          return order === "asc"
            ? a.episode.title.localeCompare(b.episode.title)
            : b.episode.title.localeCompare(a.episode.title);
        });
      }
    }
    setFavoriteEpisodes(sortedFavorites);
    setSortOrder(order === "asc" ? "a-z" : "z-a");
    setSortOption("title");
  };

  const sortFavoritesByDate = (order = "desc") => {
    const sortedFavorites = JSON.parse(JSON.stringify(favoriteEpisodes));
    for (const showTitle in sortedFavorites) {
      for (const seasonTitle in sortedFavorites[showTitle].seasons) {
        sortedFavorites[showTitle].seasons[seasonTitle].sort((a, b) => {
          const dateA = new Date(a.favoritedAt);
          const dateB = new Date(b.favoritedAt);
          return order === "desc" ? dateB - dateA : dateA - dateB;
        });
      }
    }
    setFavoriteEpisodes(sortedFavorites);
    setSortOrder(order === "desc" ? "newest" : "oldest");
    setSortOption("date");
  };

  const sortFavoritesByShow = (order = "asc") => {
    const sortedFavorites = Object.entries(favoriteEpisodes)
      .sort(([, showA], [, showB]) => {
        return order === "asc"
          ? Object.keys(showA.seasons)[0]?.localeCompare(
              Object.keys(showB.seasons)[0] || ""
            )
          : Object.keys(showB.seasons)[0]?.localeCompare(
              Object.keys(showA.seasons)[0] || ""
            );
      })
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    setFavoriteEpisodes(sortedFavorites);
    setSortOrder(order === "asc" ? "show-a-z" : "show-z-a");
    setSortOption("show");
  };

  const sortByUpdated = (order = "desc") => {
    const sortedFavorites = Object.entries(favoriteEpisodes)
      .sort(([, showA], [, showB]) => {
        const dateA = showA.newestUpdate || 0;
        const dateB = showB.newestUpdate || 0;
        return order === "desc" ? dateB - dateA : dateA - dateB;
      })
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});

    setFavoriteEpisodes(sortedFavorites);
    setSortOrder(order === "desc" ? "newly-updated" : "oldest-updated");
    setSortOption("updated");
  };

  const removeFromFavorites = (showId, seasonId, episodeId) => {
    const key = `favorite-show-${showId}-season-${seasonId}-episode-${episodeId}`;
    localStorage.removeItem(key);
    localStorage.removeItem(`${key}-timestamp`);

    const updatedFavorites = JSON.parse(JSON.stringify(favoriteEpisodes));
    for (const showTitle in updatedFavorites) {
      for (const seasonTitle in updatedFavorites[showTitle]?.seasons) {
        updatedFavorites[showTitle].seasons[seasonTitle] = updatedFavorites[
          showTitle
        ].seasons[seasonTitle].filter(
          (item) => item.episode.id.toString() !== episodeId.toString()
        );
        if (updatedFavorites[showTitle].seasons[seasonTitle].length === 0) {
          delete updatedFavorites[showTitle].seasons[seasonTitle];
        }
      }
      if (
        Object.keys(updatedFavorites[showTitle]?.seasons || {}).length === 0
      ) {
        delete updatedFavorites[showTitle];
      }
    }

    setFavoriteEpisodes(updatedFavorites);
  };

  const handleSortOptionChange = (event) => {
    const selectedOption = event.target.value;
    setSortOption(selectedOption);
    setSortOrder("custom");

    switch (selectedOption) {
      case "date":
        sortFavoritesByDate("desc");
        break;
      case "title":
        sortFavoritesByTitle("asc");
        break;
      case "show":
        sortFavoritesByShow("asc");
        break;
      case "updated-newest":
        sortByUpdated("desc");
        break;
      case "updated-oldest":
        sortByUpdated("asc");
        break;
      default:
        setSortOrder("default");
        fetchAndGroupFavorites();
        break;
    }
  };

  if (loading)
    return <div className="loading">Loading favorite episodes...</div>;
  if (error)
    return <div className="error">Error loading favorites: {error}</div>;
  if (Object.keys(favoriteEpisodes).length === 0)
    return <div>No favorite episodes yet.</div>;

  return (
    <div className="favorites">
      <h2>Your Favorite Episodes</h2>
      <FavoritesToolbar
        sortOrder={sortOrder}
        onSortAsc={() => sortFavoritesByTitle("asc")}
        onSortDesc={() => sortFavoritesByTitle("desc")}
        onReset={() => {
          setSortOrder("default");
          fetchAndGroupFavorites();
        }}
      />
      <div className="sort-control">
        <label htmlFor="sort-select">Sort by: </label>
        <select
          id="sort-select"
          value={sortOption}
          onChange={handleSortOptionChange}
        >
          <option value="date">Date Added (Newest)</option>
          <option value="title">Episode Title (A–Z)</option>
          <option value="show">Show Name (A–Z)</option>
          <option value="updated-newest">Recently Updated</option>
          <option value="updated-oldest">Oldest Updated</option>
        </select>
      </div>
      <EpisodeList episodes={favoriteEpisodes} onRemove={removeFromFavorites} />
    </div>
  );
}

export default Favorites;
