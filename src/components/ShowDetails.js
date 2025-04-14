import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

function ShowDetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `https://podcast-api.netlify.app/id/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShow(data);
      } catch (error) {
        console.error("Error fetching show details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetails();
  }, [id]); // Re-run effect when the id changes

  const handleSeasonClick = (season) => {
    setSelectedSeason(season);
  };

  if (loading) {
    return <div className="loading">Loading show details...</div>;
  }

  if (error) {
    return <div className="error">Error loading show details: {error}</div>;
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  return (
    <div className="show-details">
      <Link to="/">Back to Shows</Link>
      <h2>{show.title}</h2>
      <p>{show.description}</p>

      {show.seasons && show.seasons.length > 0 ? (
        <div>
          <h3>Seasons</h3>
          <ul>
            {show.seasons.map((season) => (
              <li
                key={season.id}
                onClick={() => handleSeasonClick(season)}
                style={{
                  cursor: "pointer",
                  backgroundColor:
                    selectedSeason?.id === season.id
                      ? "#e0e0e0"
                      : "transparent",
                }}
              >
                {" "}
                {season.title}
              </li>
            ))}
          </ul>

          {selectedSeason &&
            selectedSeason.episodes &&
            selectedSeason.episodes.length > 0 && (
              <div>
                <h4>Episodes - {selectedSeason.title}</h4>
                <ul>
                  {selectedSeason.episodes.map((episode) => (
                    <li key={episode.id}>{episode.title}</li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      ) : (
        <p>No seasons available for this show.</p>
      )}
    </div>
  );
}

export default ShowDetails;
