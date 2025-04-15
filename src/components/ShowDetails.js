import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "../components/Modal.js";

function ShowDetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isEpisodesModalOpen, setIsEpisodesModalOpen] = useState(false);
  const [selectedSeasonEpisodes, setSelectedSeasonEpisodes] = useState([]);

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
    setSelectedSeasonEpisodes(season.episodes);
    setIsEpisodesModalOpen(true);
  };

  const closeEpisodesModal = () => {
    setIsEpisodesModalOpen(false);
    setSelectedSeason(null);
    setSelectedSeasonEpisodes([]);
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

      {show?.seasons?.length > 0 ? (
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
                {season.title}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No seasons available for this show.</p>
      )}

      <Modal isOpen={isEpisodesModalOpen} onClose={closeEpisodesModal}>
        {show && show.seasons && show.seasons.length > 0 && (
          <div>
            <h4>Select Season:</h4>
            <select
              value={selectedSeason?.id?.toString() || ""}
              onChange={(event) => {
                const seasonId = parseInt(event.target.value, 10);
                const selected = show.seasons.find((s) => s.id === seasonId);

                setSelectedSeason(selected);
                setSelectedSeasonEpisodes(selected?.episodes || []);
              }}
            >
              <option value="" disabled>
                Select a season
              </option>
              {show.seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.title}
                </option>
              ))}
            </select>

            {selectedSeason && (
              <div>
                <h5>Episodes - {selectedSeason.title}</h5>
                {selectedSeasonEpisodes && selectedSeasonEpisodes.length > 0 ? (
                  <ul>
                    {selectedSeasonEpisodes.map((episode) => (
                      <li key={episode.id}>{episode.title}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No episodes in this season.</p>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
export default ShowDetails;
