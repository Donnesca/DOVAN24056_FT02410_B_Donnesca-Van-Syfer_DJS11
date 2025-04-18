import React from "react";
import "./Modal.css"; // Import the CSS styles for the Modal component

// Functional component for rendering a modal
function Modal({ isOpen, onClose, children }) {
  // If the 'isOpen' prop is false, the modal should not be displayed, so return null
  if (!isOpen) {
    return null;
  }

  // If 'isOpen' is true, render the modal structure
  return (
    // The overlay that covers the background
    <div className="modal-overlay">
      {/* The main content container of the modal */}
      <div className="modal-content">
        {/* Button to close the modal. Calls the 'onClose' function passed as a prop */}
        <button onClick={onClose} className="modal-close-button">
          Close
        </button>
        {/* Render any child components or content passed to the Modal */}
        {children}
      </div>
    </div>
  );
}

export default Modal;
