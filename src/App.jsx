import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
  useLocation,
} from "react-router-dom";
import ShowPreview from "./components/ShowPreview";
import ShowDetails from "./components/ShowDetails";
import Favorites from "./components/Favorites";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import {
  getCompletedEpisodes,
  markEpisodeAsComplete,
} from "./utils/localStorageUtils"; // Import utility functions for local storage

function App() {
  // State to store the list of fetched podcast shows
  const [shows, setShows] = useState([]);
  // State to manage the loading status while fetching data
  const [loading, setLoading] = useState(true);
  // State to store any error that occurs during data fetching
  const [error, setError] = useState(null);
  // State to hold the URL of the currently playing audio
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  // State to track if audio is currently playing
  const [isPlaying, setIsPlaying] = useState(false);
  // State to store the list of selected genres for filtering shows
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State to store the list of all available genres from the fetched shows
  const [availableGenres, setAvailableGenres] = useState([]);
  // State to store IDs of episodes marked as complete, loaded from localStorage
  const [completedEpisodes, setCompletedEpisodes] = useState(() =>
    getCompletedEpisodes()
  );

  // Function to set the audio URL and start playback
  const playAudio = (url, episodeId) => {
    setCurrentAudioUrl(url);
    setIsPlaying(true);
  };

  // Function to update the isPlaying state from the audio player
  const updateIsPlaying = (playing) => {
    setIsPlaying(playing);
  };

  // Function to handle when an episode finishes playing
  const handleEpisodeEnded = (episodeId) => {
    // If the episode ID is valid and not already marked as complete
    if (episodeId && !completedEpisodes.includes(episodeId)) {
      // Mark the episode as complete in local storage and update the state
      const updatedCompletedEpisodes = markEpisodeAsComplete(episodeId);
      setCompletedEpisodes(updatedCompletedEpisodes);
    }
  };

  // useEffect to handle the 'beforeunload' event to warn users if audio is playing
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isPlaying) {
        event.preventDefault();
        event.returnValue = ""; // Standard for most browsers
        return "Are you sure you want to close? Audio is currently playing."; // Message for older browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]); // Only re-run when isPlaying state changes

  // useEffect to fetch the list of shows and their genres
  useEffect(() => {
    const fetchShowsWithGenres = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("https://podcast-api.netlify.app");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Map over each show to fetch genre titles based on genre IDs
        const showsWithGenres = await Promise.all(
          data.map(async (show) => {
            if (show.genres && show.genres.length > 0) {
              const genreTitles = await Promise.all(
                show.genres.map(async (genreId) => {
                  try {
                    const genreResponse = await fetch(
                      `https://podcast-api.netlify.app/genre/${genreId}`
                    );
                    if (!genreResponse.ok) {
                      console.warn(
                        `Failed to fetch genre with ID ${genreId}: ${genreResponse.status}`
                      );
                      return `Genre ID: ${genreId}`; // Fallback if genre fetch fails
                    }
                    const genreData = await genreResponse.json();
                    return genreData.title;
                  } catch (genreError) {
                    console.error(
                      `Error fetching genre ${genreId}:`,
                      genreError
                    );
                    return `Genre ID: ${genreId}`; // Fallback on error
                  }
                })
              );
              return { ...show, genreTitles };
            }
            return { ...show, genreTitles: [] };
          })
        );
        // Sort shows alphabetically by title
        const sortedShows = showsWithGenres.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setShows(sortedShows);

        // Extract all unique genres from the fetched shows
        const allGenres = sortedShows.reduce((acc, show) => {
          show.genreTitles.forEach((genre) => {
            if (!acc.includes(genre)) {
              acc.push(genre);
            }
          });
          return acc;
        }, []);
        // Set the available genres and sort them alphabetically
        setAvailableGenres(allGenres.sort());
      } catch (error) {
        console.error("Error fetching shows and genres:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsWithGenres();
  }, []); // Empty dependency array means this runs once after the initial render

  // Function to handle changes in the selected genres for filtering
  const handleGenreChange = (genre) => {
    setSelectedGenres((prevGenres) => {
      // If the genre is already selected, remove it; otherwise, add it
      if (prevGenres.includes(genre)) {
        return prevGenres.filter((g) => g !== genre);
      } else {
        return [...prevGenres, genre];
      }
    });
  };

  // Filter the shows based on the selected genres
  const filteredShows =
    selectedGenres.length > 0
      ? shows.filter((show) =>
          show.genreTitles.some((genre) => selectedGenres.includes(genre))
        )
      : shows;

  // Layout component that provides the navigation and genre filter
  const Layout = () => {
    const location = useLocation(); // Get the current location object

    return (
      <div className="container">
        <h1>Women From Venus Talk</h1>
        <nav>
          {location.pathname === "/favorites" && <Link to="/">Home</Link>}
          <Link to="/favorites">Favorites</Link>
        </nav>
        <div className="genre-filter">
          <h3>Filter by Genre</h3>
          {availableGenres.map((genre) => (
            <label key={genre}>
              <input
                type="checkbox"
                value={genre}
                checked={selectedGenres.includes(genre)}
                onChange={() => handleGenreChange(genre)}
              />
              {genre}
            </label>
          ))}
        </div>
        {/* Outlet for rendering child routes */}
        <Outlet
          context={{
            playAudio: playAudio,
            completedEpisodes: completedEpisodes,
          }}
        />
        {/* Global audio player, visible when an audio URL is present */}
        {currentAudioUrl && (
          <GlobalAudioPlayer
            audioUrl={currentAudioUrl}
            onPlayStatusChange={updateIsPlaying}
            onEpisodeEnded={handleEpisodeEnded}
          />
        )}
      </div>
    );
  };

  // Render loading message
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>Loading podcasts...
      </div>
    );
  }

  // Render error message
  if (error) {
    return <div className="error">Error loading podcasts: {error}</div>;
  }

  // Main App component rendering the router and routes
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Home route displaying the list of filtered shows */}
          <Route
            index
            element={
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: "20px",
                  listStyle: "none",
                  padding: 0,
                }}
              >
                {filteredShows.map((show) =>
                  show && show.id ? (
                    <li key={show.id}>
                      <Link
                        to={`/show/${show.id}`}
                        style={{ display: "block", width: "100%" }}
                      >
                        <ShowPreview show={show} />
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            }
          />
          {/* Route for displaying details of a specific show */}
          <Route path="/show/:id" element={<ShowDetails />} />
          {/* Route for the favorites page */}
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
