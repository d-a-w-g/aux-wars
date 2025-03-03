// Helper function to check if the access token is still valid
export function isTokenValid() {
  const accessToken = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");
  if (!accessToken || !expiry) return false;
  return Date.now() < parseInt(expiry, 10);
}

// Function to refresh the Spotify access token using the refresh token
export async function refreshSpotifyToken() {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error_description || "Error refreshing token");
    }

    // Update access token and expiry time in localStorage
    const expiryTime = Date.now() + data.expires_in * 1000;
    localStorage.setItem("spotify_access_token", data.access_token);
    localStorage.setItem("spotify_token_expiry", expiryTime);
    return data.access_token;
  } catch (err) {
    console.error("Failed to refresh token:", err);
    throw err;
  }
}

// Function to get Spotify data, ensuring the access token is valid (refreshing it if necessary)
export async function getSpotifyData() {
  let accessToken = localStorage.getItem("spotify_access_token");

  // Refresh the token if it's expired
  if (!isTokenValid()) {
    try {
      accessToken = await refreshSpotifyToken();
    } catch (error) {
      console.error("Token refresh failed:", error);
      // Optionally, handle the error and redirect the user to the login page
      return;
    }
  }

  // With valid token, proceed with the API call
  const response = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}
