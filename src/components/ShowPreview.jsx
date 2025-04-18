import React from "react";

// Functional component to display a preview of a podcast show
function ShowPreview({ show }) {
  return (
    <div className="show-preview">
      {/* Display the show's image if available */}
      {show.image && (
        <img
          src={show.image}
          alt={show.title}
          width="200"
          height="150"
          style={{ objectFit: "cover" }} // Maintain aspect ratio and cover the container
        />
      )}
      {/* Display the title of the podcast show */}
      <h3>{show.title}</h3>
      {/* Display the number of seasons if the 'seasons' property is an array */}
      {Array.isArray(show.seasons) && (
        <p className="seasons">Seasons: {show.seasons.length}</p>
      )}
      {/* Display the last updated date if available */}
      {show.updated && <p className="updated">Last updated: {show.updated}</p>}
      {/* Display the genres if 'genreTitles' is an array with at least one genre */}
      {show.genreTitles && show.genreTitles.length > 0 && (
        <p className="genres">Genres: {show.genreTitles.join(", ")}</p>
      )}
    </div>
  );
}

export default ShowPreview;
