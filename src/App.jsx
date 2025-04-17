import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShowPreview from "./components/ShowPreview";
import ShowDetails from "./components/ShowDetails";
import Favorites from "./components/Favorites";

function App() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (error) {
        console.error("Error fetching shows and genres:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowsWithGenres();
  }, []);

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
      <div className="container">
        <h1>Available Podcasts</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/favorites">Favorites</Link>
        </nav>
        <Routes>
          <Route
            path="/"
            element={
              <ul>
                {shows.map((show) => (
                  <li key={show.id}>
                    <Link to={`/show/${show.id}`}>
                      <ShowPreview show={show} />
                    </Link>
                  </li>
                ))}
              </ul>
            }
          />
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/favorites" element={<Favorites />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;
