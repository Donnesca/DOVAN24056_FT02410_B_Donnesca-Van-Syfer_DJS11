import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

function ShowDetails() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShowDetails = async () => {
      setLoading(true);
      setError(null);
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

  if (loading) {
    return <div>Loading show details...</div>;
  }

  if (error) {
    return <div>Error loading show details: {error}</div>;
  }

  if (!show) {
    return <div>Show not found</div>;
  }

  return (
    <div>
      <h2>{show.title}</h2>
      <p>{show.description}</p>
      {/* We'll add seasons and episodes here later */}
    </div>
  );
}

export default ShowDetails;
