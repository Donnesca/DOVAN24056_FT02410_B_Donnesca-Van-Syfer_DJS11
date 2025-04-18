import React from "react";
import { Link, useOutletContext } from "react-router-dom";

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  return new Date(timestamp).toLocaleString();
};

const EpisodeList = ({ episodes, onRemove }) => {
  const { playAudio, completedEpisodes } = useOutletContext();

  return (
    <>
      {Object.keys(episodes).map((showTitle) => (
        <div key={showTitle} className="show-group">
          <h3>{showTitle}</h3>
          {Object.keys(episodes[showTitle]?.seasons || {}).map(
            (seasonTitle) => (
              <div key={seasonTitle} className="season-group">
                <h4>Season {seasonTitle}</h4>
                <ul>
                  {episodes[showTitle].seasons[seasonTitle].map((favItem) => (
                    <li key={favItem.episode.id}>
                      <Link to={`/show/${favItem.showId}`}>
                        {showTitle} - Season {seasonTitle} - Episode
                        {favItem.episode.title}
                      </Link>
                      <button
                        onClick={() =>
                          playAudio(favItem.episode.file, favItem.episode.id)
                        }
                      >
                        {/* Pass episode ID */}
                        Play
                      </button>
                      {completedEpisodes &&
                        completedEpisodes.includes(
                          favItem.episode.id.toString()
                        ) && (
                          <span style={{ color: "green", marginLeft: "10px" }}>
                            &#10004; Listened
                          </span>
                        )}

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
                      {favItem.favoritedAt && (
                        <p
                          className="favorite-timestamp"
                          style={{ fontSize: "0.8em", color: "grey" }}
                        >
                          Added to favorites on:{" "}
                          {formatDate(favItem.favoritedAt)}
                        </p>
                      )}
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
                      {favItem.favoritedAt && (
                        <p
                          className="favorite-timestamp"
                          style={{ fontSize: "0.8em", color: "grey" }}
                        >
                          Added to favorites on:{" "}
                          {formatDate(favItem.favoritedAt)}
                        </p>
                      )}
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
                      {favItem.favoritedAt && (
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
