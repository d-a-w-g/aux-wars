import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../../services/GameContext";
import { useSocket, useSocketConnection, useGameTransition } from "../../services/SocketProvider";
import { searchSpotifyTracks } from "../../services/spotifyApi";
import RoundStart from "./RoundStart";
import SongSelection from "./SongSelection";
import PromptModal from "./PromptModal";
import WaitingScreen from "./WaitingScreen";
import RatingScreen from "./RatingScreen";

export default function Round() {
  const { gameCode } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();
  const isConnected = useSocketConnection();
  const setGameTransition = useGameTransition();
  const { state, dispatch } = useGame();

  // Song selection state
  const [isSongSelectionView, setIsSongSelectionView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  // Submission tracking state
  const [hasSongSubmitted, setHasSongSubmitted] = useState(false);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [totalPlayers, setTotalPlayers] = useState(0);
  
  // Rating state
  const [isRatingPhase, setIsRatingPhase] = useState(false);
  const [songToRate, setSongToRate] = useState(null);
  const [ratingIndex, setRatingIndex] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasRatingSubmitted, setHasRatingSubmitted] = useState(false);
  const [ratingSubmittedCount, setRatingSubmittedCount] = useState(0);
  
  // Track if we're handling a phase transition to prevent multiple redirects
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected && !isTransitioning) {
      // Only redirect to lobby if we're not in a game
      if (!window.location.pathname.includes('/lobby/')) {
        navigate("/lobby", { replace: true });
      }
    }
  }, [isConnected, navigate, isTransitioning]);

  // Listen for prompt updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("prompt-updated", ({ prompt }) => {
      dispatch({ type: "SET_PROMPT", payload: prompt });
    });

    return () => {
      socket.off("prompt-updated");
    };
  }, [socket, isConnected, dispatch]);

  // If we have no prompt, request it from the server
  useEffect(() => {
    if (socket && isConnected && !state.currentPrompt) {
      socket.emit("request-prompt", { gameCode });
    }
  }, [socket, isConnected, state.currentPrompt, gameCode]);

  // Listen for song submission updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for when any player submits a song
    socket.on("song-selected", ({ playerId }) => {
      // If the submission is from the current user, mark as submitted
      if (playerId === socket.id) {
        setHasSongSubmitted(true);
      }
      // Update the count of submitted songs
      setSubmittedCount(prev => prev + 1);
    });

    // Listen for song submission updates (total count)
    socket.on("song-submission-update", ({ submitted, total }) => {
      setSubmittedCount(submitted);
      setTotalPlayers(total);
    });

    // Request current submission status when joining
    socket.emit("get-submission-status", { gameCode });

    return () => {
      socket.off("song-selected");
      socket.off("song-submission-update");
    };
  }, [socket, isConnected, gameCode]);

  // Listen for rating phase events
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for start of rating phase
    socket.on("start-rating", (data) => {
      const { ratingIndex, totalSongs, songToRate } = data;
      
      // Signal we're handling a transition
      setGameTransition(true);
      
      // Update state for rating phase
      setIsRatingPhase(true);
      setRatingIndex(ratingIndex);
      setTotalSongs(totalSongs);
      setSongToRate(songToRate);
      setHasRatingSubmitted(false);
      setRatingSubmittedCount(0);
      
      // Skip rating your own song
      if (songToRate.player.id === socket.id) {
        // Auto-submit a "skip" for your own song
        console.log("Skipping rating own song");
        socket.emit("submit-rating", {
          gameCode,
          songId: songToRate.songId,
          rating: -1, // Special value to indicate "skip"
        });
        setHasRatingSubmitted(true);
      }
    });

    // Listen for rating updates
    socket.on("rating-update", ({ submitted, total, songId }) => {
      setRatingSubmittedCount(submitted);
      setTotalPlayers(total);
    });

    // Listen for round results
    socket.on("round-results", ({ results }) => {
      // Signal we're handling a transition
      setIsTransitioning(true);
      setGameTransition(true);
      
      console.log("Received round results:", JSON.stringify(results, null, 2));
      
      if (!results || !results.songs) {
        console.error("Invalid round results received:", results);
      } else {
        console.log(`Received ${results.songs.length} songs in round results`);
      }
      
      // Store the results in the game context
      dispatch({ type: "SET_ROUND_RESULTS", payload: results });
      
      // Navigate to the results screen
      navigate(`/lobby/${gameCode}/results`, { replace: true });
    });

    return () => {
      socket.off("start-rating");
      socket.off("rating-update");
      socket.off("round-results");
    };
  }, [socket, isConnected, gameCode, navigate, dispatch, setGameTransition]);

  // Skip rating your own song
  useEffect(() => {
    if (isRatingPhase && songToRate && songToRate.player.id === socket.id) {
      console.log("Auto-skipping rating for own song");
      // Auto-submit a skip for your own song
      socket.emit("submit-rating", {
        gameCode,
        songId: songToRate.songId,
        rating: -1 // Special value indicating "skip"
      });
      setHasRatingSubmitted(true);
    }
  }, [isRatingPhase, songToRate, socket, gameCode]);

  // Listen for phase changes
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("game-phase-updated", ({ phase }) => {
      // Signal we're handling a transition
      setIsTransitioning(true);
      setGameTransition(true);
      
      console.log(`Phase changed to: ${phase}`);
      dispatch({ type: "SET_PHASE", payload: phase });
      
      if (phase === "lobby") {
        // Only navigate to lobby if we're not in a game
        if (!window.location.pathname.includes('/lobby/')) {
          navigate(`/lobby/${gameCode}`, { replace: true });
        }
      } else if (phase === "rating") {
        setIsRatingPhase(true);
        setHasSongSubmitted(false);  // Reset for new rating phase
        setIsTransitioning(false);   // Done transitioning
      } else if (phase === "results") {
        navigate(`/lobby/${gameCode}/results`, { replace: true });
      } else if (phase === "songSelection") {
        // Reset for new round
        setIsRatingPhase(false);
        setHasSongSubmitted(false);
        setIsSongSelectionView(false);
        setIsTransitioning(false);   // Done transitioning
      }
    });

    return () => socket.off("game-phase-updated");
  }, [socket, isConnected, gameCode, navigate, dispatch, setGameTransition]);

  // Spotify search logic
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const tracksOrError = await searchSpotifyTracks(searchTerm);
        if (tracksOrError?.error === "refresh_revoked") {
          alert("Your Spotify login has expired. Please log in again.");
          navigate("/", { replace: true });
          return;
        }
        setSearchResults(tracksOrError);
      } catch (error) {
        console.error("Error searching tracks:", error);
        if (!isTransitioning) {
          // Only navigate to lobby if we're not in a game
          if (!window.location.pathname.includes('/lobby/')) {
            navigate("/lobby", { replace: true });
          }
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, navigate, isTransitioning]);

  // Listen for player count updates and check if we have enough players
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Check player count
    if (totalPlayers < 3 && totalPlayers > 0) {
      console.log("Not enough players to continue the game");
      // We'll stay in the current view, server will handle redirecting to lobby
    }
  }, [totalPlayers, socket, isConnected, navigate]);

  // Listen for error events from the server
  useEffect(() => {
    if (!socket || !isConnected) return;

    socket.on("game-error", ({ message }) => {
      console.error("Game error:", message);
      // No need to navigate - the phase update will handle that
    });

    return () => {
      socket.off("game-error");
    };
  }, [socket, isConnected]);

  const handleSelectSong = (track) => {
    if (!socket || !isConnected) {
      if (!isTransitioning) {
        // Only navigate to lobby if we're not in a game
        if (!window.location.pathname.includes('/lobby/')) {
          navigate("/lobby", { replace: true });
        }
      }
      return;
    }
    
    // Extract track details for sending
    const trackDetails = {
      name: track.name,
      artist: track.artists?.[0]?.name || 'Unknown Artist',
      album: track.album?.name || 'Unknown Album',
      albumCover: track.album?.images?.[0]?.url || '',
      previewUrl: track.preview_url || '',
      spotifyUrl: track.external_urls?.spotify || ''
    };
    
    // Send both track ID and details to the server
    socket.emit("song-selected", { 
      trackId: track.id, 
      gameCode,
      trackDetails
    });
    
    setHasSongSubmitted(true);
  };

  const handleSubmitRating = (songId, rating) => {
    if (!socket || !isConnected) {
      if (!isTransitioning) {
        // Only navigate to lobby if we're not in a game
        if (!window.location.pathname.includes('/lobby/')) {
          navigate("/lobby", { replace: true });
        }
      }
      return;
    }
    
    // Submit rating to server
    socket.emit("submit-rating", {
      gameCode,
      songId,
      rating
    });
    
    // Mark as submitted
    setHasRatingSubmitted(true);
    
    // Also update in game context
    dispatch({
      type: "ADD_SONG_RATING",
      payload: {
        songId,
        rating,
        voterId: socket.id
      }
    });
  };

  // If not connected, don't render anything
  if (!isConnected && !isTransitioning) {
    return null;
  }

  // Determine which view to show
  const renderContent = () => {
    // Rating phase
    if (isRatingPhase) {
      if (hasRatingSubmitted) {
        return (
          <WaitingScreen 
            completedCount={ratingSubmittedCount} 
            totalCount={totalPlayers}
            message="Waiting for other players to rate this song..." 
          />
        );
      } else if (songToRate) {
        return (
          <RatingScreen
            currentPrompt={state.currentPrompt}
            songToRate={songToRate}
            onSubmitRating={handleSubmitRating}
            currentIndex={ratingIndex}
            totalSongs={totalSongs}
          />
        );
      }
    }
    // Song selection phase
    else {
      if (hasSongSubmitted) {
        return (
          <WaitingScreen 
            completedCount={submittedCount} 
            totalCount={totalPlayers}
            message="Waiting for other players to submit their songs..." 
          />
        );
      } else if (isSongSelectionView) {
        return (
          <SongSelection
            searchTerm={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            searchResults={searchResults}
            onSelectSong={handleSelectSong}
            onShowPrompt={() => setShowPromptModal(true)}
            showPromptModal={showPromptModal}
          />
        );
      } else {
        return (
          <RoundStart 
            currentPrompt={state.currentPrompt}
            onStartSelection={() => setIsSongSelectionView(true)}
          />
        );
      }
    }
  };

  return (
    <div className="round-start flex flex-col items-center justify-center text-white p-4">
      {renderContent()}

      {showPromptModal && !hasSongSubmitted && !isRatingPhase && (
        <PromptModal
          currentPrompt={state.currentPrompt}
          onClose={() => setShowPromptModal(false)}
        />
      )}
    </div>
  );
}
