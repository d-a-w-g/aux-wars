import React from "react";
import AlbumsDisplay from "./AlbumsDisplay";
import { Outlet } from "react-router-dom";
import albums from "./albums";

export default function AppDisplay() {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      <AlbumsDisplay albums={albums} />
      <div className="relative flex items-center justify-center h-full z-10">
      <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
        <AlbumsDisplay albums={albums} />
      </div>
      <div className="relative flex items-center justify-center h-full">
        <Outlet />
      </div>
    </div>
  );
}
