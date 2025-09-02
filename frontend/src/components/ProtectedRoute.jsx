import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { auth } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";

const ProtectedRoute = ({ children }) => {
  const [user, setUser] = useState(null); // Initial state is null (no user)
  const [loading, setLoading] = useState(true); // Track loading state
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Once we know the auth state, stop loading
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>; // Display loading message while checking auth
  }

  if (!user) {
    // If user is not logged in, redirect them to the login page
    console.log(`No user detected. Redirecting to login from ${location.pathname}`);
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // If user is logged in, render the children (protected route content)
  return children;
};

export default ProtectedRoute;
