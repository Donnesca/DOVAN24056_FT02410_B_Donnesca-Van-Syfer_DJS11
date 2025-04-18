export const getCompletedEpisodes = () => {
  const completed = localStorage.getItem("completedEpisodes");
  return completed ? JSON.parse(completed) : [];
};

export const markEpisodeAsComplete = (episodeId) => {
  const completed = getCompletedEpisodes();
  if (!completed.includes(episodeId)) {
    completed.push(episodeId);
    localStorage.setItem("completedEpisodes", JSON.stringify(completed));
  }
  return completed;
};
