import React from "react";

const FavoritesToolbar = ({ sortOrder, onSortAsc, onSortDesc, onReset }) => (
  <div style={{ marginBottom: "1rem" }}>
    <button onClick={onSortAsc} disabled={sortOrder === "a-z"}>
      Sort by Title (A-Z)
    </button>
    <button
      onClick={onSortDesc}
      disabled={sortOrder === "z-a"}
      style={{ marginLeft: "10px" }}
    >
      Sort by Title (Z-A)
    </button>
    {sortOrder !== "default" && (
      <button onClick={onReset} style={{ marginLeft: "10px" }}>
        Reset Sort
      </button>
    )}
  </div>
);

export default FavoritesToolbar;
