import React, { useState, useEffect } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Outlet,
} from "react-router-dom";
import ShowPreview from "./components/ShowPreview";
import ShowDetails from "./components/ShowDetails";
import Favorites from "./components/Favorites";
import GlobalAudioPlayer from "./components/GlobalAudioPlayer";
import {
  getCompletedEpisodes,
  markEpisodeAsComplete,
} from "./utils/localStorageUtils"; // Import utils

function App() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [availableGenres, setAvailableGenres] = useState([]);
  const [completedEpisodes, setCompletedEpisodes] = useState(() =>
    getCompletedEpisodes()
  ); // Load from localStorage

  const playAudio = (url, episodeId) => {
    setCurrentAudioUrl(url);
    setIsPlaying(true);
  };

  const updateIsPlaying = (playing) => {
    setIsPlaying(playing);
  };

  const handleEpisodeEnded = (episodeId) => {
    if (episodeId && !completedEpisodes.includes(episodeId)) {
      const updatedCompletedEpisodes = markEpisodeAsComplete(episodeId);
      setCompletedEpisodes(updatedCompletedEpisodes);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isPlaying) {
        event.preventDefault();
        event.returnValue = "";
        return "Are you sure you want to close? Audio is currently playing.";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isPlaying]);

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
                      return `Genre ID: ${genreId}`;
                    }
                    const genreData = await genreResponse.json();
                    return genreData.title;
                  } catch (genreError) {
                    console.error(
                      `Error fetching genre ${genreId}:`,
                      genreError
                    );
                    return `Genre ID: ${genreId}`;
                  }
                })
              );
              return { ...show, genreTitles };
            }
            return { ...show, genreTitles: [] };
          })
        );
        const sortedShows = showsWithGenres.sort((a, b) =>
          a.title.localeCompare(b.title)
        );
        setShows(sortedShows);

        const allGenres = sortedShows.reduce((acc, show) => {
          show.genreTitles.forEach((genre) => {
            if (!acc.includes(genre)) {
              acc.push(genre);
            }
          });
          return acc;
        }, []);
        setAvailableGenres(allGenres.sort());
      } catch (error) {
        console.error("Error fetching shows and genres:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsWithGenres();
  }, []);

  const handleGenreChange = (genre) => {
    setSelectedGenres((prevGenres) => {
      if (prevGenres.includes(genre)) {
        return prevGenres.filter((g) => g !== genre);
      } else {
        return [...prevGenres, genre];
      }
    });
  };

  const filteredShows =
    selectedGenres.length > 0
      ? shows.filter((show) =>
          show.genreTitles.some((genre) => selectedGenres.includes(genre))
        )
      : shows;

  const Layout = () => (
    <div className="container">
      <h1>Available Podcasts</h1>
      <nav>
        <Link to="/">Home</Link>
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
      <Outlet context={{ playAudio: playAudio }} />
      {currentAudioUrl && (
        <GlobalAudioPlayer
          audioUrl={currentAudioUrl}
          onPlayStatusChange={updateIsPlaying}
          onEpisodeEnded={handleEpisodeEnded}
        />
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>Loading podcasts...
      </div>
    );
  }

  if (error) {
    return <div className="error">Error loading podcasts: {error}</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={
              <ul>
                {filteredShows.map((show) =>
                  show && show.id ? (
                    <li key={show.id}>
                      <Link to={`/show/${show.id}`}>
                        <ShowPreview show={show} />
                      </Link>
                    </li>
                  ) : null
                )}
              </ul>
            }
          />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
