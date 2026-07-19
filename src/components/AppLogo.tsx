/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface AppLogoProps {
  className?: string;
  showText?: boolean;
}

export default function AppLogo({ className = "w-16 h-16", showText = false }: AppLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${showText ? "space-y-3" : ""}`}>
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${className} filter drop-shadow-[0_4px_12px_rgba(212,175,55,0.25)]`}
      >
        {/* Outer Pentagon Border with Solid Bright Yellow Background */}
        <polygon
          points="250,15 485,185 395,465 105,465 15,185"
          fill="#FDE718"
          stroke="#000000"
          strokeWidth="12"
          strokeLinejoin="round"
        />

        {/* Central Wavy Keris Blade */}
        <path
          d="M 250,65
             Q 262,90 244,115
             T 256,165
             T 244,215
             T 256,265
             T 246,305
             L 254,305
             Z"
          fill="#000000"
        />

        {/* Ganja (Crossguard) */}
        <path
          d="M 220,305 L 280,305 L 275,315 L 225,315 Z"
          fill="#000000"
        />

        {/* Curved Hilt (Handle) */}
        <path
          d="M 245,315
             C 240,325 242,335 238,345
             C 234,355 245,360 250,360
             C 256,360 260,352 258,342
             C 256,332 260,325 255,315
             Z"
          fill="#000000"
        />

        {/* 5 Interlocking Rings in a horizontal row below the hilt */}
        <g stroke="#000000" strokeWidth="3.5" fill="none">
          <circle cx="190" cy="355" r="16" />
          <circle cx="220" cy="355" r="16" />
          <circle cx="250" cy="355" r="16" />
          <circle cx="280" cy="355" r="16" />
          <circle cx="310" cy="355" r="16" />
        </g>

        {/* Padi (Rice Stalk) - Left Side */}
        {/* Stem curve */}
        <path
          d="M 120,330 C 110,230 150,130 215,95"
          stroke="#8A731D"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Rice Grains */}
        <g fill="#AA7C11">
          <path d="M 215 95 C 210 100, 200 100, 205 110 C 208 105, 212 100, 215 95 Z" />
          <path d="M 205 110 C 198 115, 190 113, 195 123 C 199 118, 203 115, 205 110 Z" />
          <path d="M 195 123 C 188 128, 180 125, 185 137 C 189 131, 193 128, 195 123 Z" />
          <path d="M 185 137 C 177 143, 170 140, 175 153 C 179 146, 183 143, 185 137 Z" />
          <path d="M 175 153 C 167 160, 160 157, 165 170 C 169 163, 173 160, 175 153 Z" />
          <path d="M 165 170 C 157 177, 150 174, 155 187 C 159 180, 163 177, 165 170 Z" />
          <path d="M 155 187 C 147 195, 140 192, 145 205 C 149 198, 153 195, 155 187 Z" />
          <path d="M 145 205 C 137 213, 130 210, 135 223 C 139 216, 143 213, 145 205 Z" />
          <path d="M 135 223 C 127 232, 120 229, 125 243 C 129 235, 133 232, 135 223 Z" />
          <path d="M 125 243 C 117 252, 110 249, 115 263 C 119 255, 123 252, 125 243 Z" />
          <path d="M 115 263 C 107 272, 100 269, 105 283 C 109 275, 113 272, 115 263 Z" />
          <path d="M 105 283 C 97 292, 90 289, 95 303 C 99 295, 103 292, 105 283 Z" />
          <path d="M 95 303 C 87 312, 80 309, 85 323 C 89 315, 93 312, 95 303 Z" />
        </g>

        {/* Kapas (Cotton Stalk) - Right Side */}
        {/* Stem curve */}
        <path
          d="M 380,330 C 390,230 350,130 285,95"
          stroke="#006633"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
        />
        {/* Cotton green sepals/leaves backing */}
        <path d="M 285 95 L 290 105 L 280 100 Z" fill="#006633" />
        <path d="M 300 108 L 305 120 L 295 115 Z" fill="#006633" />
        <path d="M 315 125 L 320 137 L 310 133 Z" fill="#006633" />
        <path d="M 328 145 L 333 157 L 323 153 Z" fill="#006633" />
        <path d="M 340 167 L 345 180 L 335 175 Z" fill="#006633" />
        <path d="M 350 190 L 355 203 L 345 197 Z" fill="#006633" />
        <path d="M 358 215 L 363 228 L 353 223 Z" fill="#006633" />
        <path d="M 364 243 L 369 256 L 359 250 Z" fill="#006633" />
        <path d="M 368 273 L 373 286 L 363 280 Z" fill="#006633" />

        {/* Cotton bulbs (green base and white fluffy top) */}
        <circle cx="295" cy="100" r="10" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="310" cy="115" r="11" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="325" cy="133" r="11" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="340" cy="153" r="11" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="352" cy="175" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="362" cy="199" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="370" cy="225" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="376" cy="253" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />
        <circle cx="380" cy="283" r="12" fill="#FFFFFF" stroke="#000000" strokeWidth="2" />

        {/* Ribbon Left Tail (Back shadow and swallow tail) */}
        <path
          d="M 120,410 L 80,395 L 95,380 L 80,365 L 120,380 Z"
          fill="#E0E0E0"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 120,380 L 120,410 L 105,392 Z"
          fill="#9E9E9E"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ribbon Right Tail (Back shadow and swallow tail) */}
        <path
          d="M 380,410 L 420,395 L 405,380 L 420,365 L 380,380 Z"
          fill="#E0E0E0"
          stroke="#000000"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M 380,380 L 380,410 L 395,392 Z"
          fill="#9E9E9E"
          stroke="#000000"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* White Ribbon Main Band */}
        <path
          d="M 120,380
             Q 250,405 380,380
             L 380,410
             Q 250,435 120,410
             Z"
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        {/* Curved Path for Text inside Ribbon */}
        <path
          id="ribbonTextPath"
          d="M 122,398 Q 250,423 378,398"
          fill="none"
        />

        {/* Text inside the Ribbon: PUTRA SETTU BHAKTI JAYA */}
        <text
          fontFamily="var(--font-sans), sans-serif"
          fontSize="11.5"
          fontWeight="900"
          fill="#000000"
          letterSpacing="0.3"
        >
          <textPath href="#ribbonTextPath" startOffset="50%" textAnchor="middle">
            PUTRA SETTU BHAKTI JAYA
          </textPath>
        </text>

        {/* BANJAR CAMPUAN text below ribbon */}
        <text
          x="250"
          y="448"
          fontFamily="var(--font-display), var(--font-sans), sans-serif"
          fontSize="22"
          fontWeight="900"
          fill="#000000"
          textAnchor="middle"
          letterSpacing="0.5"
        >
          BANJAR CAMPUAN
        </text>
      </svg>

      {showText && (
        <div className="text-center">
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-amber-400">
            PUSBAYA <span className="text-white">HUB</span>
          </h2>
          <p className="text-amber-200/60 text-xs font-semibold tracking-wider uppercase mt-1">
            Sistem Pendataan Banjar Campuan
          </p>
        </div>
      )}
    </div>
  );
}
