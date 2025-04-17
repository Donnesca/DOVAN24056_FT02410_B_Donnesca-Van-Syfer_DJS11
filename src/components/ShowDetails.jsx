import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "../components/Modal";

function ShowDetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [isEpisodesModalOpen, setIsEpisodesModalOpen] = useState(false);
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null);
  const audioRef = useRef(null);

  const handlePlayAudio = (audioUrl) => {
    setCurrentAudioUrl(audioUrl);
    if (audioRef.current) {
      audioRef.current.load();
      audioRef.current.play();
    }
  };

  useEffect(() => {
    const fetchShowDetails = async () => {
      // setLoading(true);
      //  setError(null);
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
    const index = show.seasons.findIndex((s) => s.id === season.id);
    if (index !== -1) {
      setCurrentSeasonIndex(index);
      setSelectedSeason(season);
      setIsEpisodesModalOpen(true);
    }
  };

  const closeEpisodesModal = () => {
    setIsEpisodesModalOpen(false);
    setSelectedSeason(null);
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
      <Link to="/">← Back to Shows</Link>
      <h2>{show.title}</h2>
      <p>{show.description}</p>

      {show?.seasons?.length > 0 ? (
        <>
          <h3>Seasons</h3>
          <ul>
            {show.seasons.map((season, index) => (
              <li
                key={season.id || `season-${index}`}
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
        </>
      ) : (
        <p>No seasons available for this show.</p>
      )}

      <Modal isOpen={isEpisodesModalOpen} onClose={closeEpisodesModal}>
        {selectedSeason && (
          <div>
            <h4>{selectedSeason.title} - Episodes</h4>
            <div style={{ marginBottom: "1rem" }}>
              <button
                onClick={() => {
                  if (currentSeasonIndex > 0) {
                    const newIndex = currentSeasonIndex - 1;
                    setCurrentSeasonIndex(newIndex);
                    setSelectedSeason(show.seasons[newIndex]);
                  }
                }}
                disabled={currentSeasonIndex === 0}
              >
                Previous Season
              </button>
              <button
                onClick={() => {
                  if (currentSeasonIndex < show.seasons.length - 1) {
                    const newIndex = currentSeasonIndex + 1;
                    setCurrentSeasonIndex(newIndex);
                    setSelectedSeason(show.seasons[newIndex]);
                  }
                }}
                disabled={currentSeasonIndex === show.seasons.length - 1}
              >
                Next Season
              </button>
            </div>
            {selectedSeason.episodes?.length > 0 ? (
              <ul>
                {selectedSeason.episodes.map((episode, i) => (
                  <li key={episode.id || `ep-${i}`}>
                    {episode.title}
                    <button onClick={() => handlePlayAudio(episode.file)}>
                      Play
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No episodes in this season.</p>
            )}
          </div>
        )}
      </Modal>
      {currentAudioUrl && (
        <div className="audio-player-container">
          <audio controls src={currentAudioUrl} autoPlay ref={audioRef} />
        </div>
      )}
    </div>
  );
}
export default ShowDetails;
