import React from "react";
import { motion } from "framer-motion";

export default function HomeBtn({
  className = "",
  text,
  icon,
  onClick,
  padding = "py-4",
}) {
  return (
    <motion.button
      initial={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      onClick={onClick}
      className={`${className} rounded-full ${padding} flex items-center gap-2 justify-center`}
    >
      {icon && <img src={icon} alt="Button Icon" className="w-5 md:w-8" />}
      <span className="text-sm md:text-base font-semibold">{text}</span>
    </motion.button>
  );
}
