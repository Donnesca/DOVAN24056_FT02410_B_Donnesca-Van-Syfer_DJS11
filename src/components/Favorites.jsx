import React, { useState, useEffect } from "react";
import FavoritesToolbar from "./FavoritesToolbar";
import EpisodeList from "./EpisodeList";

function Favorites() {
  // State to store the grouped favorite episodes
  const [favoriteEpisodes, setFavoriteEpisodes] = useState({});
  // State to manage the loading state during data fetching
  const [loading, setLoading] = useState(true);
  // State to store any error that occurs during fetching
  const [error, setError] = useState(null);
  // State to keep track of the current sort order (e.g., 'default', 'a-z', 'newest')
  const [sortOrder, setSortOrder] = useState("default");
  // State to keep track of the current sorting option selected by the user
  const [sortOption, setSortOption] = useState("date");
  // Async function to fetch favorite episodes from local storage and group them by show and season
  const fetchAndGroupFavorites = async () => {
    setLoading(true); // Set loading to true when starting the fetch
    setError(null); // Reset any previous errors
    // Filter local storage keys to find those related to favorited shows
    const favoriteKeys = Object.keys(localStorage).filter(
      (key) =>
        key.startsWith("favorite-show-") && localStorage.getItem(key) === "true"
    );
    const allFavoriteDetails = [];
    // Iterate over the keys of favorited shows
    for (const key of favoriteKeys) {
      const parts = key.split("-");
      const showId = parts[2]; // Extract the show ID from the key
      const episodeId = parts[4]; // Extract the episode ID from the key
      const favoritedAt = localStorage.getItem(`${key}-timestamp`); // Retrieve the timestamp when the episode was favorited
      try {
        // Fetch details for the specific podcast show using its ID
        const response = await fetch(
          `https://podcast-api.netlify.app/id/${showId}`
        );
        if (response.ok) {
          const showData = await response.json();
          let newestEpisodeDate;
          let oldestEpisodeDate = Infinity;
          // Iterate through the seasons and episodes of the fetched show data
          showData.seasons.forEach((season) => {
            season.episodes?.forEach((episode) => {
              const pubDate = new Date(episode.published_at).getTime();
              //Determine the newest and oldest episode publish dates for sorting purposes
              if (!newestEpisodeDate || pubDate > newestEpisodeDate) {
                newestEpisodeDate = pubDate;
              }
              if (pubDate < oldestEpisodeDate) {
                oldestEpisodeDate = pubDate;
              }

              //If the current episode's ID matches the favorited episode ID, add its details to the array
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
        setError(err.message); // Set error state if fetching fails
      }
    }

    // Sort the fetched favorite details alphabetically by show title, then by season title
    allFavoriteDetails.sort((a, b) => {
      if (a.show.title < b.show.title) return -1;
      if (a.show.title > b.show.title) return 1;
      if (a.season.title < b.season.title) return -1;
      if (a.season.title > b.season.title) return 1;
      return 0;
    });

    const groupedFavorites = {};

    // Group the favorite episodes by show title and then by season title
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

      groupedFavorites[show.title].newestUpdate = Math.max(
        groupedFavorites[show.title].newestUpdate,
        new Date(episode.published_at).getTime() // Ensure episode has published_at
      );
      groupedFavorites[show.title].oldestUpdate = Math.min(
        groupedFavorites[show.title].oldestUpdate,
        new Date(episode.published_at).getTime() // Ensure episode has published_at
      );
    });

    setFavoriteEpisodes(groupedFavorites); // Update the state with the grouped favorites
    setLoading(false); // Set loading to false after fetching is complete
  };

  // useEffect hook to fetch and group favorites when the component mounts
  useEffect(() => {
    fetchAndGroupFavorites();
  }, []); // Empty dependency array ensures this runs only once after the initial render

  // Function to sort favorite episodes alphabetically by title
  const sortFavoritesByTitle = (order = "asc") => {
    // Create a deep copy of the favorite episodes to avoid direct state mutation
    const sortedFavorites = JSON.parse(JSON.stringify(favoriteEpisodes));
    for (const showTitle in sortedFavorites) {
      for (const seasonTitle in sortedFavorites[showTitle].seasons) {
        // Sort the episodes within each season based on the episode title
        sortedFavorites[showTitle].seasons[seasonTitle].sort((a, b) => {
          return order === "asc"
            ? a.episode.title.localeCompare(b.episode.title)
            : b.episode.title.localeCompare(a.episode.title);
        });
      }
    }

    setFavoriteEpisodes(sortedFavorites); // Update the state with the sorted favorites
    setSortOrder(order === "asc" ? "a-z" : "z-a"); // Update the sort order state
    setSortOption("title"); // Update the sort option state
  };

  // Function to sort favorite episodes by the date they were added to favorites
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
  // Function to sort favorite episodes alphabetically by show title
  const sortFavoritesByShow = (order = "asc") => {
    // Sort the shows based on their titles
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
  // Function to sort favorite episodes by the most recent update of their respective shows
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
  // Function to remove an episode from favorites
  const removeFromFavorites = (showId, seasonId, episodeId) => {
    // Construct the local storage key for the favorited episode
    const key = `favorite-show-${showId}-season-${seasonId}-episode-${episodeId}`;
    localStorage.removeItem(key); // Remove the favorite flag from local storage
    localStorage.removeItem(`${key}-timestamp`); // Remove the timestamp as well
    // Create a deep copy of the favorite episodes to update the state immutably
    const updatedFavorites = JSON.parse(JSON.stringify(favoriteEpisodes));
    for (const showTitle in updatedFavorites) {
      // Filter out the removed episode from the season's episode list
      for (const seasonTitle in updatedFavorites[showTitle]?.seasons) {
        updatedFavorites[showTitle].seasons[seasonTitle] = updatedFavorites[
          showTitle
        ].seasons[seasonTitle].filter(
          (item) => item.episode.id.toString() !== episodeId.toString()
        );
        // If a season has no episodes left, remove the season
        if (updatedFavorites[showTitle].seasons[seasonTitle].length === 0) {
          delete updatedFavorites[showTitle].seasons[seasonTitle];
        }
      }
      // If a show has no seasons left, remove the show
      if (
        Object.keys(updatedFavorites[showTitle]?.seasons || {}).length === 0
      ) {
        delete updatedFavorites[showTitle];
      }
    }
    setFavoriteEpisodes(updatedFavorites); // Update the state with the removed episode
  };
  // Handler function for when the user changes the sorting option
  const handleSortOptionChange = (event) => {
    const selectedOption = event.target.value;
    setSortOption(selectedOption); // Update the selected sort option
    setSortOrder("custom"); // Indicate a custom sorting is applied
    // Apply the selected sorting logic
    switch (selectedOption) {
      case "date":
        sortFavoritesByDate("desc"); // Sort by date added (newest first)
        break;
      case "title":
        sortFavoritesByTitle("asc"); // Sort by episode title (A-Z)
        break;
      case "show":
        sortFavoritesByShow("asc"); // Sort by show name (A-Z)
        break;
      case "updated-newest":
        sortByUpdated("desc"); // Sort by recently updated shows
        break;
      case "updated-oldest":
        sortByUpdated("asc"); // Sort by oldest updated shows
        break;
      default:
        setSortOrder("default"); // Reset to default sorting
        fetchAndGroupFavorites(); // Re-fetch and group favorites with default sorting
        break;
    }
  };
  // Render loading message if data is being fetched
  if (loading)
    return <div className="loading">Loading favorite episodes...</div>;
  // Render error message if fetching failed
  if (error)
    return <div className="error">Error loading favorites: {error}</div>;
  // Render message if there are no favorite episodes
  if (Object.keys(favoriteEpisodes).length === 0)
    return <div>No favorite episodes yet.</div>;
  // Render the main content of the Favorites component
  return (
    <div className="favorites">
      <h2>Your Favorite Episodes</h2>
      {/* Toolbar for basic sorting options (A-Z, Z-A, Reset) */}
      <FavoritesToolbar
        sortOrder={sortOrder}
        onSortAsc={() => sortFavoritesByTitle("asc")}
        onSortDesc={() => sortFavoritesByTitle("desc")}
        onReset={() => {
          setSortOrder("default");
          fetchAndGroupFavorites();
        }}
      />
      {/* Dropdown to select more advanced sorting options */}
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
      {/* Component to display the list of favorite episodes */}
      <EpisodeList episodes={favoriteEpisodes} onRemove={removeFromFavorites} />
    </div>
  );
}

export default Favorites;
