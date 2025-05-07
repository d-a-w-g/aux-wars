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

// Search for tracks on Spotify.
export async function searchSpotifyTracks(query) {
  let accessToken = localStorage.getItem("spotify_access_token");
  if (!isTokenValid()) {
    try {
      accessToken = await refreshSpotifyToken();
    } catch (error) {
      // If refresh token is revoked, we can do something like:
      if (error.message.includes("revoked")) {
        // Clear any stale data
        localStorage.removeItem("spotify_access_token");
        localStorage.removeItem("spotify_token_expiry");
        localStorage.removeItem("spotify_refresh_token");

        // Return or throw a special signal so the app can handle it
        console.error("Refresh token revoked – user must re-login");
        return { error: "refresh_revoked" };
      }
      console.error("Failed to refresh token:", error);
      return [];
    }
  }

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );
    const data = await res.json();
    if (data.tracks) {
      return data.tracks.items;
    }
  } catch (err) {
    console.error("Spotify search failed:", err);
  }
  return [];
}

// --- Spotify Web Playback SDK Loader and Player Manager ---
let spotifyPlayer = null;
let playerReadyPromise = null;

export function loadSpotifySDK() {
  // Only load once
  if (window.Spotify) return Promise.resolve();
  if (document.getElementById('spotify-sdk')) return playerReadyPromise;

  // Set the global callback BEFORE loading the script
  if (!window.onSpotifyWebPlaybackSDKReady) {
    window.onSpotifyWebPlaybackSDKReady = () => {};
  }

  playerReadyPromise = new Promise((resolve) => {
    window.onSpotifyWebPlaybackSDKReady = resolve;
    const script = document.createElement('script');
    script.id = 'spotify-sdk';
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    document.body.appendChild(script);
  });
  return playerReadyPromise;
}

export async function initializeSpotifyPlayer(name = 'Aux Wars Player') {
  await loadSpotifySDK();
  if (spotifyPlayer) return spotifyPlayer;
  const token = localStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No Spotify access token');
  return new Promise((resolve, reject) => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      spotifyPlayer = new window.Spotify.Player({
        name,
        getOAuthToken: cb => cb(token),
        volume: 0.7,
      });
      spotifyPlayer.addListener('ready', ({ device_id }) => {
        resolve({ player: spotifyPlayer, deviceId: device_id });
      });
      spotifyPlayer.addListener('not_ready', () => {
        // Optionally handle not ready
      });
      spotifyPlayer.addListener('initialization_error', ({ message }) => {
        reject(new Error(message));
      });
      spotifyPlayer.addListener('authentication_error', ({ message }) => {
        reject(new Error(message));
      });
      spotifyPlayer.addListener('account_error', ({ message }) => {
        reject(new Error(message));
      });
      spotifyPlayer.connect();
    };
  });
}

export function getSpotifyPlayer() {
  return spotifyPlayer;
}

export async function playSpotifyTrack(trackUri, deviceId) {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No Spotify access token');
  const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ uris: [trackUri] }),
  });
  if (!res.ok) throw new Error('Failed to play track');
}

export async function pauseSpotifyPlayback(deviceId) {
  const token = localStorage.getItem('spotify_access_token');
  if (!token) throw new Error('No Spotify access token');
  const res = await fetch(`https://api.spotify.com/v1/me/player/pause?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error('Failed to pause playback');
}

export function getSpotifyPlaybackState() {
  if (!spotifyPlayer) return null;
  return spotifyPlayer.getCurrentState();
}
