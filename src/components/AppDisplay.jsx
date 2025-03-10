import React from "react";
import AlbumsDisplay from "./AlbumsDisplay";
import { Outlet } from "react-router-dom";
import albums from "./albums";

export default function AppDisplay() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AlbumsDisplay albums={albums} />
      <div className="relative flex items-center justify-center h-full z-10">
        <Outlet />
      </div>
    </div>
  );
}
