import React, { useState, useRef, useEffect } from "react";

const GlobalAudioPlayer = ({
  audioUrl,
  onPlayStatusChange,
  onEpisodeEnded,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState(null); // To track the currently playing episode

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      // Extract episode ID from the audioUrl (you might need a more robust way to do this)
      const parts = audioUrl.split("-");
      const episodeIdPart = parts[parts.length - 1]?.split(".")[0];
      setCurrentEpisodeId(episodeIdPart);

      if (isPlaying) {
        audioRef.current
          .play()
          .catch((error) => console.error("Play error:", error));
      } else {
        audioRef.current.pause();
      }
    } else {
      setCurrentEpisodeId(null);
    }
  }, [audioUrl, isPlaying]);

  useEffect(() => {
    const audioElement = audioRef.current;

    if (audioElement) {
      const handlePlay = () => {
        setIsPlaying(true);
        onPlayStatusChange(true);
      };
      const handlePause = () => {
        setIsPlaying(false);
        onPlayStatusChange(false);
      };
      const handleEnded = () => {
        setIsPlaying(false);
        onPlayStatusChange(false);
        if (currentEpisodeId) {
          onEpisodeEnded(currentEpisodeId); // Notify parent about the completed episode
        }
      };

      audioElement.addEventListener("play", handlePlay);
      audioElement.addEventListener("pause", handlePause);
      audioElement.addEventListener("ended", handleEnded);

      return () => {
        audioElement.removeEventListener("play", handlePlay);
        audioElement.removeEventListener("pause", handlePause);
        audioElement.removeEventListener("ended", handleEnded);
      };
    }

    return () => {};
  }, [onPlayStatusChange, onEpisodeEnded, currentEpisodeId]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      isPlaying
        ? audioRef.current.pause()
        : audioRef.current
            .play()
            .catch((error) => console.error("Play error:", error));
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
      <audio ref={audioRef} />
      <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>
      {/* Add other controls like progress bar, volume here */}
      {currentEpisodeId && <p>Playing Episode ID: {currentEpisodeId}</p>}{" "}
      {/* For debugging */}
    </div>
  );
};

export default GlobalAudioPlayer;
