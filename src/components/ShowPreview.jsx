import React from "react";

function ShowPreview({ show }) {
  return (
    <div className="show-preview">
      {show.image && (
        <img
          src={show.image}
          alt={show.title}
          width="200"
          height="150"
          style={{ objectFit: "cover" }}
        />
      )}
      <h3>{show.title}</h3>
      {Array.isArray(show.seasons) && (
        <p className="seasons">Seasons: {show.seasons.length}</p>
      )}
      {show.updated && <p className="updated">Last updated: {show.updated}</p>}
      {show.genreTitles && show.genreTitles.length > 0 && (
        <p className="genres">Genres: {show.genreTitles.join(", ")}</p>
      )}
    </div>
  );
}

export default ShowPreview;
