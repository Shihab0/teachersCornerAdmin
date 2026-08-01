import React from "react";

interface AvatarPlaceholderProps {
  className?: string;
}

export const FemaleAvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Female Avatar Placeholder"
    >
      <circle cx="50" cy="50" r="50" fill="#fbcfe8" />
      {/* Head */}
      <circle cx="50" cy="40" r="18" fill="#f472b6" />
      {/* Hair loop / shape */}
      <path
        d="M32 38C32 25 40 20 50 20C60 20 68 25 68 38C68 45 62 48 62 48C62 48 58 40 50 40C42 40 38 48 38 48C38 48 32 45 32 38Z"
        fill="#db2777"
      />
      {/* Shoulders / Body */}
      <path
        d="M20 88C20 72 32 62 50 62C68 62 80 72 80 88V100H20V88Z"
        fill="#ec4899"
      />
    </svg>
  );
};

export const MaleAvatarPlaceholder: React.FC<AvatarPlaceholderProps> = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Male Avatar Placeholder"
    >
      <circle cx="50" cy="50" r="50" fill="#bfdbfe" />
      {/* Head */}
      <circle cx="50" cy="40" r="18" fill="#60a5fa" />
      {/* Hair */}
      <path
        d="M32 36C32 26 40 22 50 22C60 22 68 26 68 36C68 37 62 30 50 30C38 30 32 37 32 36Z"
        fill="#2563eb"
      />
      {/* Shoulders / Body */}
      <path
        d="M20 88C20 72 32 62 50 62C68 62 80 72 80 88V100H20V88Z"
        fill="#3b82f6"
      />
    </svg>
  );
};
