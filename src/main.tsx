/**
 * ========================================
 * main.tsx - APPLICATION ENTRY POINT
 * ========================================
 * 
 * This is the VERY FIRST file that runs when the app starts.
 * It does two things:
 * 1. Finds the HTML element where the app will be displayed
 * 2. Renders (displays) the App component inside that element
 * 
 * SIMPLE ANALOGY:
 * - The index.html file has an empty container with id="root"
 * - This file fills that container with our React app
 */

// ---- IMPORTS ----

// createRoot: The function that starts a React app
import { createRoot } from "react-dom/client";

// App: Our main application component
import App from "./App.tsx";

// CSS: Global styles for the entire app
import "./index.css";

/**
 * START THE APP
 * 
 * Step 1: Find the HTML element with id="root" (in index.html)
 * Step 2: Create a React "root" in that element
 * Step 3: Render (display) the App component
 * 
 * The "!" after getElementById tells TypeScript "trust me, this exists"
 */
createRoot(document.getElementById("root")!).render(<App />);
