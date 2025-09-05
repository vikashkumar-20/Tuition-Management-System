// components/PublicOnlyRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfig";

const PublicOnlyRoute = ({ children }) => {
  const user = auth.currentUser;

  if (user) {
    // Redirect to home or dashboard if logged in
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
