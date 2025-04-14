import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ShowPreview from "./components/ShowPreview"; // Import the new component
import ShowDetails from "./components/ShowDetails";

function App() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true); // Add a loading state
  const [error, setError] = useState(null); // Add an error state

  useEffect(() => {
    const fetchShows = async () => {
      setLoading(true); // Set loading to true before fetching
      setError(null); // Reset any previous errors
      try {
        const response = await fetch("https://podcast-api.netlify.app");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const sortedShows = data.sort((a, b) => {
          return a.title.localeCompare(b.title);
        });
        setShows(sortedShows);
      } catch (error) {
        console.error("Error fetching shows:", error);
        setError(error.message);
      } finally {
        setLoading(false); // Set loading to false after fetching (success or failure)
      }
    };

    fetchShows();
  }, []);

  if (loading) {
    return <div>Loading podcasts...</div>;
  }

  if (error) {
    return <div>Error loading podcasts: {error}</div>;
  }

  return (
    <Router>
      <div>
        <h1>Available Podcasts</h1>
        <ul>
          {shows.map((show) => (
            <li key={show.id}>
              <Link to={`/show/${show.id}`}>
                <ShowPreview show={show} />
              </Link>
            </li>
          ))}
        </ul>
        <Routes>
          <Route path="/show/:id" element={<ShowDetails />} />
          <Route path="/" element={null} />{" "}
          {/* This is a placeholder for the main list view */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
