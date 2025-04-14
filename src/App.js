import React, { useState, useEffect } from "react";
import ShowPreview from "./components/ShowPreview"; // Import the new component

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
        setShows(data);
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
    <div>
      <h1>Available Podcasts</h1>
      <ul>
        {shows.map((show) => (
          <ShowPreview key={show.id} show={show} />
        ))}
      </ul>
    </div>
  );
}

export default App;
