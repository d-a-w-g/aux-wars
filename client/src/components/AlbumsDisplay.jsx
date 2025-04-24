import React from "react";
import AlbumRow from "./AlbumsRow";

export default function AlbumsDisplay({ albums }) {
  const chunkSize = 9;
  const chunkedAlbums = [];
  for (let i = 0; i < albums.length; i += chunkSize) {
    chunkedAlbums.push(albums.slice(i, i + chunkSize));
  }

  return (
    <div className="album-display h-screen absolute z-10 flex flex-col justify-center gap-16 md:gap-20">
      {chunkedAlbums.map((albumRow, rowIndex) => (
        <AlbumRow
          key={rowIndex}
          albums={albumRow}
          direction={rowIndex % 2 === 0 ? "left" : "right"}
        />
      ))}
    </div>
  );
}
