import React from "react";
import { motion } from "framer-motion";

export default function AlbumRow({ albums, direction }) {
    const animateX = direction === "left" ? ["5%", "-40%"] : ["-40%", "5%"];

  return (
    <motion.div
      animate={{ x: animateX }}
      transition={{
        duration: 100,
        ease: "linear",
        repeat: Infinity,
        repeatType: "reverse",
      }}
    >
      <div className="album-row flex gap-10">
        {albums.map((album, index) => (
          <div key={index} className="album">
            <img src={album} alt="album-cover" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
