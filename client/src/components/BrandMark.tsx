import type { SVGProps } from "react";

export function BrandMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label="Prime Frango Assado"
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id="prime-mark-bg" x1="18" y1="12" x2="104" y2="108" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9f2f1d" />
          <stop offset="1" stopColor="#3b0706" />
        </linearGradient>
        <linearGradient id="prime-mark-gold" x1="32" y1="26" x2="86" y2="98" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffe5a2" />
          <stop offset="1" stopColor="#d39224" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="54" fill="url(#prime-mark-bg)" stroke="#d5a343" strokeWidth="2" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="#f1c66c" strokeOpacity=".42" strokeWidth="1" />
      <path
        d="M37 76c3-13 11-21 24-24 2-7 7-12 15-14-1 6-1 10 2 14 7 2 11 7 13 14-4-2-8-3-13-2 2 4 2 9 0 14H45c-4 0-7-1-8-2Zm30-24c5 1 9 3 12 7 3-1 5-3 6-5-4-5-10-7-18-6Zm-12 6c-4 2-7 5-9 9 7-2 14-2 21 0-3-4-7-7-12-9Z"
        fill="url(#prime-mark-gold)"
      />
      <circle cx="78" cy="43" r="2.2" fill="#3b0706" />
      <path d="M74 34c2-4 5-6 8-5-1 3-1 6 1 8-4 0-7-1-9-3Z" fill="#f3a42d" />
      <path d="M52 87h16" stroke="#f3c66b" strokeWidth="2" strokeLinecap="round" />
      <path d="M43 28h5M72 23h4M91 60h5" stroke="#ffe5a2" strokeWidth="2" strokeLinecap="round" opacity=".78" />
    </svg>
  );
}
