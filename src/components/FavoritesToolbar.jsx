import React from "react";

// Functional component for the favorites toolbar, providing sorting options
const FavoritesToolbar = ({ sortOrder, onSortAsc, onSortDesc, onReset }) => (
  <div style={{ marginBottom: "1rem" }}>
    {/* Button to sort the list of favorites by title in ascending order (A-Z) */}
    <button onClick={onSortAsc} disabled={sortOrder === "a-z"}>
      Sort by Title (A-Z)
    </button>

    {/* Button to sort the list of favorites by title in descending order (Z-A) */}
    <button
      onClick={onSortDesc}
      disabled={sortOrder === "z-a"}
      style={{ marginLeft: "10px" }}
    >
      Sort by Title (Z-A)
    </button>

    {/* Conditional rendering of the reset button. It only appears if the sort order is not the default */}
    {sortOrder !== "default" && (
      <button onClick={onReset} style={{ marginLeft: "10px" }}>
        Reset Sort
      </button>
    )}
  </div>
);

export default FavoritesToolbar;
