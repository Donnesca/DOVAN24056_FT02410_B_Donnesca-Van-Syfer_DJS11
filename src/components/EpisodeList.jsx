import React from "react";

import { Link, useOutletContext } from "react-router-dom";

// Function to format a timestamp into a readable date and time string

const formatDate = (timestamp) => {
  if (!timestamp) return ""; // Return an empty string if the timestamp is not provided

  return new Date(timestamp).toLocaleString(); // Use the toLocaleString method for user-friendly formatting
};

// Functional component to display a list of podcast episodes

const EpisodeList = ({ episodes, onRemove }) => {
  // Access shared context values from the parent layout route

  const { playAudio, completedEpisodes } = useOutletContext();

  return (
    <>
      {/* Iterate over the keys of the 'episodes' object, which represent show titles */}

      {Object.keys(episodes).map((showTitle) => (
        // Outer div for each show group

        <div key={showTitle} className="show-group">
          {/* Display the title of the podcast show */}

          <h3>{showTitle}</h3>

          {Object.keys(episodes[showTitle]?.seasons || {}).map(
            (seasonTitle) => (
              <div key={seasonTitle} className="season-group">
                <h4 className="season-title">Season {seasonTitle}</h4>

                {/* Unordered list to display individual episodes within the season */}

                <ul>
                  {/* Iterate over the array of episode items in the current season */}

                  {episodes[showTitle].seasons[seasonTitle].map((favItem) => (
                    // List item for each episode

                    <li key={favItem.episode.id}>
                      {/* Link to the detailed page for this specific show */}

                      <Link
                        to={`/show/${favItem.showId}`}
                        className="episode-link"
                      >
                        {showTitle} - Season {seasonTitle} - Episode{" "}
                        {favItem.episode.title}
                      </Link>

                      {/* Button to trigger the audio playback for this episode */}

                      <button
                        onClick={() =>
                          playAudio(favItem.episode.file, favItem.episode.id)
                        }
                      >
                        Play
                      </button>

                      {/* Check if the episode ID is present in the 'completedEpisodes' array from context */}

                      {completedEpisodes?.includes(
                        favItem.episode.id.toString()
                      ) && (
                        // Display a checkmark if the episode has been listened to

                        <span style={{ color: "green", marginLeft: "10px" }}>
                          &#10004; Listened
                        </span>
                      )}

                      {/* Button to remove this episode from the displayed list */}

                      <button
                        style={{ marginLeft: "10px", color: "red" }}
                        onClick={() =>
                          onRemove(
                            favItem.showId,

                            favItem.seasonId,

                            favItem.episode.id
                          )
                        }
                      >
                        Remove
                      </button>

                      {/* Check if there's a 'favoritedAt' timestamp for this episode */}

                      {favItem.favoritedAt && (
                        // Display the date and time when the episode was added to favorites

                        <p
                          className="favorite-timestamp"
                          style={{ fontSize: "0.8em", color: "grey" }}
                        >
                          Added to favorites on:{" "}
                          {formatDate(favItem.favoritedAt)}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
        </div>
      ))}
    </>
  );
};

export default EpisodeList;
