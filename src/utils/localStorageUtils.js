// Function to retrieve the list of completed episode IDs from local storage.
// If no list exists, it returns an empty array.
export const getCompletedEpisodes = () => {
  const completed = localStorage.getItem("completedEpisodes");
  // If 'completed' exists in local storage, parse it from JSON to an array.
  // Otherwise, return an empty array as the default value.
  return completed ? JSON.parse(completed) : [];
};

// Function to mark a given episode ID as complete in local storage.
// It retrieves the current list of completed episodes, adds the new ID if it's not already present,
// and then updates the local storage with the modified list.
export const markEpisodeAsComplete = (episodeId) => {
  // Get the current list of completed episodes.
  const completed = getCompletedEpisodes();
  // Check if the episode ID is already in the completed list.
  if (!completed.includes(episodeId)) {
    // If not, add the episode ID to the list.
    completed.push(episodeId);
    // Update the 'completedEpisodes' item in local storage with the new list (converted back to JSON).
    localStorage.setItem("completedEpisodes", JSON.stringify(completed));
  }
  // Return the updated list of completed episodes.
  return completed;
};
