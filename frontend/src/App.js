import React from "react";
import Chatbot from "./components/Chatbot";
import "./app.css";

export default function App() {
  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <Chatbot />
    </div>
  );
}
