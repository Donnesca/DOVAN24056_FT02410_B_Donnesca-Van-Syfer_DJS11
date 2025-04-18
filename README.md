# Women From Venus Talk - Podcast App

## Project Introduction

Welcome to Women From Venus Talk, a podcast application dedicated to showcasing engaging and insightful conversations. This app allows you to browse a curated list of podcasts, view detailed information about each show and its seasons, listen to episodes directly within the app, manage your favorite episodes, and even track your listening progress. Whether you're looking for thought-provoking discussions or entertaining stories, Women From Venus Talk provides a seamless and user-friendly podcast experience.

## Setup Instructions

To run this application locally, please follow these steps:

1.  **Clone the Repository:**

    ```bash
    git clone <YOUR_REPOSITORY_URL>
    cd women-from-venus-talk
    ```

    _(Replace `<YOUR_REPOSITORY_URL>` with the actual URL of your project's Git repository.)_

2.  **Install Dependencies:**
    This project uses Node.js and npm (or yarn) for managing dependencies. Ensure you have Node.js installed on your system.
    Using npm:

    ```bash
    npm install
    ```

    Or, if you prefer yarn:

    ```bash
    yarn install
    ```

3.  **Start the Development Server:**
    Once the dependencies are installed, you can start the development server to run the application in your browser.
    Using npm:

    ```bash
    npm start
    ```

    Or, using yarn:

    ```bash
    yarn start
    ```

4.  **Open in Your Browser:**
    The application should automatically open in your default web browser. If not, navigate to `http://localhost:3000` (or the port specified in your terminal output).

## Usage Examples

Here are some examples of how to use the Women From Venus Talk app:

- **Browsing Podcasts:**

  - Upon opening the app, you will see a list of available podcasts displayed as previews.
  - You can filter the podcasts by genre using the "Filter by Genre" section on the home page. Check the boxes next to the genres you are interested in.

- **Viewing Show Details:**

  - Click on a podcast preview to navigate to the "Show Details" page.
  - On this page, you can find a description of the show and a list of its seasons.
  - Click on a season to open a modal displaying the episodes within that season.
  - Within the episode modal, you can see the title of each episode and options to play the audio and mark it as a favorite.

- **Playing Episodes:**

  - Click the "Play" button next to an episode title in the season modal to start playing the audio.
  - A global audio player will appear at the bottom of the screen, allowing you to control playback (play/pause).

- **Managing Favorites:**

  - Click the "☆ Favorite" button next to an episode to add it to your favorites. The button will change to "★ Favorite" to indicate it's favorited.
  - Navigate to the "Favorites" page using the link in the navigation bar to see a list of all your favorited episodes.
  - On the "Favorites" page, you can remove episodes from your favorites by clicking the "Remove" button next to them.
  - You can also sort your favorite episodes by title (A-Z, Z-A) and reset the sorting.

- **Tracking Completed Episodes:**

  - When an episode finishes playing, it is automatically marked as completed and stored locally. _(Note: This feature might not have a visible UI element in the current version but is functional.)_

- **Navigation:**
  - Use the "Home" link in the navigation bar (which appears only on the Favorites page) to return to the main list of podcasts.
  - Use the "Favorites" link to access your list of favorited episodes.
  - On the "Show Details" page, a "← Back to Shows" link allows you to return to the main podcast list.

## Contact Information

For any questions, feedback, or bug reports, please feel free to reach out via:

- **Email:** [georgelinevansyfer@gmail.com]
- **GitHub:** [https://github.com/Donnesca]

Thank you for using Women From Venus Talk! We hope you enjoy discovering and listening to great podcasts.
