const PATHS = {
  inbox:        <><path d="M3 12l3-7h12l3 7"/><path d="M3 12v7h18v-7"/><path d="M3 12h5l1 2h6l1-2h5"/></>,
  grid:         <><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></>,
  analytics:    <><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>,
  users:        <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14.5a5.5 5.5 0 016.5 5.5"/></>,
  bell:         <><path d="M6 9a6 6 0 1112 0c0 7 3 8 3 8H3s3-1 3-8z"/><path d="M10 21a2 2 0 004 0"/></>,
  cog:          <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1 1.55V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1H3a2 2 0 110-4h.09a1.7 1.7 0 001.56-1.11 1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001-1.56V3a2 2 0 114 0v.09a1.7 1.7 0 001 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06A1.7 1.7 0 0019.4 9V9a1.7 1.7 0 001.56 1H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.56 1z"/></>,
  plus:         <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  search:       <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
  sparkles:     <><path d="M12 3l1.8 4.6L18 9.5l-4.2 1.9L12 16l-1.8-4.6L6 9.5l4.2-1.9z"/><path d="M19 14l.7 1.8 1.8.7-1.8.7L19 19l-.7-1.8-1.8-.7 1.8-.7z"/><path d="M5 17l.5 1.3 1.3.5-1.3.5L5 20.6l-.5-1.3L3.2 18.8l1.3-.5z"/></>,
  chevronRight: <path d="M9 6l6 6-6 6"/>,
  chevronDown:  <path d="M6 9l6 6 6-6"/>,
  chevronUp:    <path d="M18 15l-6-6-6 6"/>,
  check:        <path d="M5 12.5l4.5 4.5L19 7.5"/>,
  clock:        <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  flag:         <><path d="M5 3v18"/><path d="M5 4h12l-2 4 2 4H5"/></>,
  dots:         <><circle cx="6" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="18" cy="12" r="1.5"/></>,
  arrow:        <><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></>,
  filter:       <><path d="M3 5h18"/><path d="M6 12h12"/><path d="M10 19h4"/></>,
  list:         <><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></>,
  cards:        <><rect x="3" y="4" width="18" height="6" rx="1.5"/><rect x="3" y="14" width="18" height="6" rx="1.5"/></>,
  calendar:     <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
  x:            <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>,
  trash:        <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></>,
  edit:         <><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  restore:      <><path d="M3 12a9 9 0 109-9 9 9 0 00-9 9"/><path d="M3 3v5h5"/></>,
  star:         <path d="M12 3l2.7 6 6.3.6-4.8 4.3 1.4 6.3L12 17l-5.6 3.2L7.8 14 3 9.6 9.3 9z"/>,
  link:         <><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></>,
  notes:        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
  download:     <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>,
  upload:       <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
  message:      <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></>,
  eye:          <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:       <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  at:           <><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 006 0v-1a10 10 0 10-3.92 7.94"/></>,
  google: (
    <>
      <path d="M21.5 12.3c0-.7-.06-1.4-.2-2H12v3.8h5.3c-.23 1.2-.93 2.2-1.97 2.9l3.2 2.4c1.87-1.7 2.97-4.3 2.97-7.1z" fill="#4285F4" stroke="none"/>
      <path d="M12 22c2.7 0 4.9-.9 6.5-2.4l-3.2-2.4c-.9.6-2 .95-3.3.95-2.5 0-4.7-1.7-5.5-4H3.3v2.5C4.93 19.6 8.2 22 12 22z" fill="#34A853" stroke="none"/>
      <path d="M6.5 14.15c-.2-.6-.3-1.2-.3-1.85s.1-1.25.3-1.85V7.95H3.3C2.6 9.3 2.2 10.6 2.2 12s.4 2.7 1.1 4.05L6.5 14.15z" fill="#FBBC05" stroke="none"/>
      <path d="M12 6.45c1.4 0 2.7.5 3.7 1.45l2.77-2.77C16.95 3.55 14.73 2.5 12 2.5 8.2 2.5 4.93 4.9 3.3 7.95l3.2 2.5c.8-2.3 3-4 5.5-4z" fill="#EA4335" stroke="none"/>
    </>
  ),
};

export default function Icon({ name, size = 16, stroke = 1.6, className, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
