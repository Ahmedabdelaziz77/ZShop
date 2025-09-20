"use client";

export default function Loader({
  size = 30,
  color = "text-blue-300",
}: {
  size?: number;
  color: string;
}) {
  return (
    <svg
      className={`animate-spin ${color} inline-block align-middle`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
