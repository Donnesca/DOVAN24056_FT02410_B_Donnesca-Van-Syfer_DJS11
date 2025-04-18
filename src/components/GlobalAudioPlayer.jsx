import React, { useState, useRef, useEffect } from "react";

// Global audio player component that plays a provided audio URL
const GlobalAudioPlayer = ({
  audioUrl, // URL of the audio to play
  onPlayStatusChange, // Callback function to notify the parent about play/pause status changes
  onEpisodeEnded, // Callback function to notify the parent when the audio playback ends
}) => {
  const audioRef = useRef(null); // Ref to the audio HTML element
  const [isPlaying, setIsPlaying] = useState(false); // State to track if the audio is currently playing
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null); // State to store the ID of the currently playing episode

  // useEffect hook to handle changes in the audio URL and play/pause state
  useEffect(() => {
    // Check if the audio ref is available and an audio URL is provided
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl; // Set the source of the audio element to the provided URL

      // Attempt to extract the episode ID from the audio URL.
      // This is a basic example and might need a more robust implementation
      // depending on your audio URL structure.
      const parts = audioUrl.split("-");
      const episodeIdPart = parts[parts.length - 1]?.split(".")[0];
      setCurrentEpisodeId(episodeIdPart); // Update the current episode ID

      // Control audio playback based on the 'isPlaying' state
      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Play error:", error)); // Attempt to play, catch any errors
      } else {
        audioRef.current.pause(); // Pause the audio if not playing
      }
    } else {
      setCurrentEpisodeId(null); // Reset the current episode ID if no audio URL
    }
  }, [audioUrl, isPlaying]); // Re-run this effect when audioUrl or isPlaying changes

  // useEffect hook to attach event listeners to the audio element
  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      // Event handler for when the audio starts playing
      const handlePlay = () => {
        setIsPlaying(true);
        onPlayStatusChange(true); // Notify the parent that playback has started
      };

      // Event handler for when the audio is paused
      const handlePause = () => {
        setIsPlaying(false);
        onPlayStatusChange(false); // Notify the parent that playback has been paused
      };

      // Event handler for when the audio playback reaches the end
      const handleEnded = () => {
        setIsPlaying(false);
        onPlayStatusChange(false); // Notify the parent that playback has ended
        if (currentEpisodeId) {
          onEpisodeEnded(currentEpisodeId); // Notify the parent about the completed episode, passing the ID
        }
      };

      // Add event listeners to the audio element
      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);
      audioElement.addEventListener("ended", handleEnded);

      // Cleanup function to remove event listeners when the component unmounts or the dependencies change
      return () => {
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
        audioElement.removeEventListener("ended", handleEnded);
      };
    }

    return () => {}; // Return an empty function if audioElement is not available
  }, [onPlayStatusChange, onEpisodeEnded, currentEpisodeId]); // Re-run this effect when these dependencies change

  // Function to toggle the play/pause state
  const togglePlay = () => {
    setIsPlaying(!isPlaying); // Update the playing state
    if (audioRef.current) {
      // Control audio playback based on the updated 'isPlaying' state
      isPlaying
        ? audioRef.current.pause()
        : audioRef.current
            .play()
            .catch((error) => console.error("Play error:", error)); // Attempt to play, catch any errors
    }
  };

  return (
    <div
      className="global-audio-player"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        background: "#f0f0f0",
        padding: "10px",
        zIndex: 1000,
      }}
    >
      {/* HTML audio element, controlled via the audioRef */}
      <audio ref={audioRef} />
      {/* Button to toggle the play/pause state */}
      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
      {/* Placeholder for other audio controls */}
      {/* Display the current episode ID for debugging purposes */}
      {currentEpisodeId && <p>Playing Episode ID: {currentEpisodeId}</p>}
    </div>
  );
};

export default GlobalAudioPlayer;
