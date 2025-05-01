import type { SVGProps } from 'react';

// Simple Pickaxe Icon
export const PickaxeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1 L10 3 L12 3 L12 5 L14 5 L14 7 L13 7 L13 9 L11 9 L11 11 L8 11 L8 10 L6 10 L6 8 L5 8 L5 6 L4 6 L4 4 L2 4 L2 2 L4 2 L4 1 L10 1 M4 6 L5 6 L5 8 L6 8 L6 9 L7 9 L7 10 L8 10 L8 11 L9 11 L9 12 L10 12 L10 13 L11 13 L11 11 L13 11 L13 9 L14 9 L14 7 L15 7 L15 5 L13 5 L13 3 L11 3 L11 2 L10 2 L10 1 L5 1 L5 2 L3 2 L3 4 L4 4 L4 6 Z" clipRule="evenodd" style={{ fill: '#8B4513' }} /> {/* Brown handle */}
    <path d="M10 1 L5 1 L5 2 L3 2 L3 4 L2 4 L2 5 L4 5 L4 6 L6 6 L6 8 L8 8 L8 9 L10 9 L10 7 L11 7 L11 5 L12 5 L12 3 L10 3 L10 1 Z" style={{ fill: '#A8A8A8' }} /> {/* Stone head */}
     {/* Add highlights or details if needed */}
  </svg>
);

// Simple Gold Ingot Icon
export const GoldIngotIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" {...props}>
    <path d="M2 5 L14 5 L14 11 L2 11 Z" style={{ fill: '#FFD700' }} /> {/* Main gold color */}
    <path d="M3 6 L13 6 L13 10 L3 10 Z" style={{ fill: '#FFAA00' }} /> {/* Inner shadow/highlight */}
     <path d="M2 5 L3 6 L3 10 L2 11 M14 5 L13 6 L13 10 L14 11" style={{ stroke: '#B8860B', fill: 'none', strokeWidth: 0.5 }} /> {/* Edge lines */}
  </svg>
);

// Simple Compass Icon (Placeholder)
export const CompassIcon = (props: SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
 </svg>
);

// Simple User Icon
export const UserIcon = (props: SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
 </svg>
);

// Simple Briefcase/Company Icon
export const BriefcaseIcon = (props: SVGProps<SVGSVGElement>) => (
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
 </svg>
);

 // Simple Task/List Icon
 export const TaskIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
    <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    <path d="M10 9H8"/>
    <path d="M16 13H8"/>
    <path d="M16 17H8"/>
 </svg>
 );
