import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Modal from "../components/Modal";
//import "./ShowDetails.css"; // Import CSS for ShowDetails component

function ShowDetails() {
  const { id } = useParams(); // Extract the show ID from the URL parameters
  const [show, setShow] = useState(null); // State to store the fetched show details
  const [loading, setLoading] = useState(true); // State to indicate if data is being loaded
  const [error, setError] = useState(null); // State to store any error during fetching
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0); // State to track the index of the currently viewed season in the modal
  const [selectedSeason, setSelectedSeason] = useState(null); // State to store the details of the currently selected season for the modal
  const [isEpisodesModalOpen, setIsEpisodesModalOpen] = useState(false); // State to control the visibility of the episodes modal
  const [currentAudioUrl, setCurrentAudioUrl] = useState(null); // State to store the URL of the currently playing audio
  const [playingEpisodeTitle, setPlayingEpisodeTitle] = useState(null); // State to store the title of the currently playing episode
  const audioRef = useRef(null); // Ref to the audio HTML element
  const [, forceUpdate] = useState({}); // State to force a re-render when favorites are updated

  // Function to handle playing an audio episode
  const handlePlayAudio = (audioUrl, episodeTitle) => {
    setCurrentAudioUrl(audioUrl); // Set the URL of the audio to be played
    setPlayingEpisodeTitle(episodeTitle); // Set the title of the playing episode
    if (audioRef.current) {
      audioRef.current.load(); // Load the new audio source
      audioRef.current.play(); // Start playing the audio
    }
  };

  // Function to toggle the favorite status of an episode in local storage
  const handleFavoriteToggle = (episode) => {
    if (!show || !selectedSeason) return; // Ensure show and season data are available
    const key = `favorite-show-${show.id}-season-${selectedSeason.id}-episode-${episode.id}`;
    const isCurrentlyFavorite = localStorage.getItem(key) === "true"; // Check if the episode is currently favorited
    const newFavoriteStatus = !isCurrentlyFavorite; // Toggle the favorite status
    localStorage.setItem(key, newFavoriteStatus); // Update the favorite status in local storage

    // If the episode is newly favorited, store a timestamp
    if (newFavoriteStatus) {
      const timestamp = new Date().toLocaleString();
      localStorage.setItem(`${key}-timestamp`, timestamp);
    } else {
      localStorage.removeItem(`${key}-timestamp`); // Remove the timestamp if unfavorited
    }
    forceUpdate(); // Force a re-render to update the UI (e.g., favorite button)
  };

  // useEffect hook to fetch the details of the show based on the ID from the URL
  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true); // Set loading to true before fetching
      setError(null); // Reset any previous errors
      try {
        const response = await fetch(
          `https://podcast-api.netlify.app/id/${id}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setShow(data); // Update the show state with the fetched data
      } catch (error) {
        console.error("Error fetching show details:", error);
        setError(error.message); // Set the error state if fetching fails
      } finally {
        setLoading(false); // Set loading to false after fetching is complete (success or failure)
      }
    };

    fetchShowDetails(); // Call the fetch function when the component mounts or the ID changes
  }, [id]); // Dependency array ensures this effect runs when the 'id' parameter changes

  // Function to handle clicking on a season, opening the episodes modal
  const handleSeasonClick = (season) => {
    const index = show.seasons.findIndex((s) => s.id === season.id);
    if (index !== -1) {
      setCurrentSeasonIndex(index); // Set the index of the clicked season
      setSelectedSeason(season); // Set the selected season data
      setIsEpisodesModalOpen(true); // Open the episodes modal
    }
  };

  // Function to close the episodes modal
  const closeEpisodesModal = () => {
    setIsEpisodesModalOpen(false); // Set the modal visibility to false
    setSelectedSeason(null); // Clear the selected season data
  };

  // Render loading state
  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>Loading show details...
      </div>
    );
  }

  // Render error state
  if (error) {
    return <div className="error">Error loading show details: {error}</div>;
  }

  // Render if show data is not found
  if (!show) {
    return <div>Show not found</div>;
  }

  // Render the show details
  return (
    <div className="show-details">
      <Link to="/">← Back to Shows</Link>
      <h2>{show.title}</h2>
      <p>{show.description}</p>

      {/* Display seasons if available */}
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
                      ? "#e050e0"
                      : "transparent",
                }}
              >
                {season.image && (
                  <img
                    src={season.image}
                    alt={season.title}
                    width="100"
                    height="75"
                    style={{
                      objectFit: "cover",
                      marginRight: "10px",
                      verticalAlign: "middle",
                    }}
                  />
                )}
                {season.title}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>No seasons available for this show.</p>
      )}

      {/* Modal to display episodes of a selected season */}
      <Modal isOpen={isEpisodesModalOpen} onClose={closeEpisodesModal}>
        {selectedSeason && (
          <div>
            <h4>
              {show.seasons[currentSeasonIndex]?.title} - Episodes (
              {selectedSeason.episodes ? selectedSeason.episodes.length : 0})
            </h4>
            {/* Navigation buttons for previous and next seasons */}
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
            {/* List of episodes in the selected season */}
            {selectedSeason.episodes?.length > 0 ? (
              <ul>
                {selectedSeason.episodes.map((episode, i) => {
                  const isFavorite =
                    localStorage.getItem(
                      `favorite-show-${show.id}-season-${selectedSeason.id}-episode-${episode.id}`
                    ) === "true";

                  return (
                    <li
                      key={episode.id || `ep-${i}`}
                      style={{ color: "black" }}
                    >
                      {episode.title}
                      <button
                        onClick={() =>
                          handlePlayAudio(episode.file, episode.title)
                        }
                      >
                        Play
                      </button>
                      <button
                        onClick={() => handleFavoriteToggle(episode)}
                        style={{
                          marginLeft: "10px",
                          color: isFavorite ? "gold" : "grey",
                        }}
                      >
                        {isFavorite ? "★ Favorite" : "☆ Favorite"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p>No episodes in this season.</p>
            )}
          </div>
        )}
      </Modal>
      {/* Audio player component */}
      {currentAudioUrl && (
        <div className="audio-player-container">
          {playingEpisodeTitle && (
            <p className="playing-title">Playing: {playingEpisodeTitle}</p>
          )}
          <audio controls src={currentAudioUrl} autoPlay ref={audioRef} />
        </div>
      )}
    </div>
  );
}
export default ShowDetails;
