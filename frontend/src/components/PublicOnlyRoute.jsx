// components/PublicOnlyRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

const PublicOnlyRoute = ({ children }) => {
  const user = auth.currentUser;

  if (user) {
    // User is already logged in, redirect to home
    return <Navigate to="/" replace />;
  }

  return children; // Not logged in, show the page
};

export default PublicOnlyRoute;
