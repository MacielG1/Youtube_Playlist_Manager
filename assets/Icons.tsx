import { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg viewBox="-1.486 36.86 258.081 182.28" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fill="#7101f9"
        d="M255.5 78.5v98c-5.613 20.449-18.613 33.949-39 40.5a2026.574 2026.574 0 0 1-89 1.5c-29.713.151-59.38-.349-89-1.5-20.387-6.551-33.387-20.051-39-40.5v-98c5.613-20.45 18.613-33.95 39-40.5a2026.263 2026.263 0 0 1 89-1.5c29.713-.151 59.38.349 89 1.5 20.387 6.55 33.387 20.05 39 40.5Z"
      />
      <path
        fill="#000001"
        d="M93.5 90.5a1234.883 1234.883 0 0 1 73 36c1.114 1.223 1.281 2.556.5 4a5889.417 5889.417 0 0 0-65.5 31.5c-2.59 1.314-5.256 1.981-8 2-1.329-24.5-1.329-49 0-73.5Z"
      />
    </svg>
  ),
  pointerLeft: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <g transform="translate(24) scale(-1,1)">
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M4 6l8.5 6L4 18z" fill="currentColor" />
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M14 6h2v12h-2z" fill="currentColor" />
      </g>
    </svg>
  ),
  pointerRight: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M4 6l8.5 6L4 18z" fill="currentColor" />
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M14 6h2v12h-2z" fill="currentColor" />
    </svg>
  ),
  closeIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 44 44" fill="none  " {...props}>
      <path
        fillRule="evenodd"
        stroke="currentColor"
        clipRule="evenodd"
        d="M16 31C24.2843 31 31 24.2843 31 16C31 7.71573 24.2843 1 16 1C7.71573 1 1 7.71573 1 16C1 24.2843 7.71573 31 16 31Z"
        strokeWidth="2"
      />
      <path d="M9 9L24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
      <path d="M8.49512 23.4586L24.5049 9.54144" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
    </svg>
  ),
  deleteIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  emptyBox: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000">
      <path
        d="m860.3 374.7 124.4-124.4c4-3.9 5.8-9.4 5.2-14.8-.8-5.6-4-10.4-8.7-13.2L645.7 28.5c-6.9-4-15.7-2.8-21.3 2.9L500 155.8 375.6 31.5c-5.7-5.7-14.4-6.9-21.4-2.9L18.8 222.4c-4.9 2.8-8 7.6-8.7 13.2-.7 5.3 1 10.9 4.9 14.8l124.4 124.4L15.1 499.3c-3.9 3.9-5.7 9.4-4.9 14.8.6 5.4 3.8 10.3 8.7 13l128 74v161.2c0 6.4 3.4 12.2 8.8 15.4l335.5 193.9c2.7 1.7 5.8 2.3 8.8 2.3 3 0 6.1-.7 8.8-2.3l335.4-193.9c5.4-3.2 8.8-9 8.8-15.4V601.1l128.1-74c4.7-2.8 7.9-7.6 8.7-13 .7-5.5-1.2-10.9-5.2-14.8L860.3 374.7zm-60.4-2.2L500 545.8 200 372.5l224.9-130 75.1-43.3 271.3 156.6 28.6 16.7zM639.8 63.8l303.6 175.6-111 111-18.2-10.5-285.5-165L639.8 63.8zm-279.6 0 111.1 111.1-303.8 175.4-111.1-111L360.2 63.8zM167.5 394.6l303.6 175.6-111 111-186.8-108h-.1L56.4 505.7l111.1-111.1zm14.7 224.7 172 99.3c2.8 1.7 5.8 2.4 8.8 2.4.4 0 .6-.4 1-.4 4.1-.1 8.3-1.5 11.5-4.7l106.8-106.8v314.2L182.2 749.8V619.3zm635.4 130.5-300 173.4V609.1l106.6 106.8c3.1 3.1 7.2 4.4 11.4 4.7.4 0 .7.4 1 .4 3.1 0 6.1-.7 8.8-2.4l172-99.3v130.5h.2zm-177.9-68.7-111-111 303.7-175.6 111 111.1-303.7 175.5z"
        fill="currentColor"
      />
    </svg>
  ),
  moon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 20">
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8.509 5.75c0-1.493.394-2.96 1.144-4.25h-.081a8.5 8.5 0 1 0 7.356 12.746A8.5 8.5 0 0 1 8.509 5.75Z"
      />
    </svg>
  ),
  sun: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
      <path d="M10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-11a1 1 0 0 0 1-1V1a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1Zm0 12a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0v-2a1 1 0 0 0-1-1ZM4.343 5.757a1 1 0 0 0 1.414-1.414L4.343 2.929a1 1 0 0 0-1.414 1.414l1.414 1.414Zm11.314 8.486a1 1 0 0 0-1.414 1.414l1.414 1.414a1 1 0 0 0 1.414-1.414l-1.414-1.414ZM4 10a1 1 0 0 0-1-1H1a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1Zm15-1h-2a1 1 0 1 0 0 2h2a1 1 0 0 0 0-2ZM4.343 14.243l-1.414 1.414a1 1 0 1 0 1.414 1.414l1.414-1.414a1 1 0 0 0-1.414-1.414ZM14.95 6.05a1 1 0 0 0 .707-.293l1.414-1.414a1 1 0 1 0-1.414-1.414l-1.414 1.414a1 1 0 0 0 .707 1.707Z" />
    </svg>
  ),
  rewind10: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" strokeWidth="3" stroke="currentColor" fill="none">
      <polyline points="9.57 15.41 12.17 24.05 20.81 21.44" strokeLinecap="round" />
      <path d="M26.93,41.41V23a.09.09,0,0,0-.16-.07s-2.58,3.69-4.17,4.78" strokeLinecap="round" />
      <rect x="32.19" y="22.52" width="11.41" height="18.89" rx="5.7" />
      <path d="M12.14,23.94a21.91,21.91,0,1,1-.91,13.25" strokeLinecap="round" />
    </svg>
  ),
  skip10: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" strokeWidth="3" stroke="currentColor" fill="none">
      <path d="M23.93,41.41V23a.09.09,0,0,0-.16-.07s-2.58,3.69-4.17,4.78" strokeLinecap="round" />
      <rect x="29.19" y="22.52" width="11.41" height="18.89" rx="5.7" />
      <polyline points="54.43 15.41 51.83 24.05 43.19 21.44" strokeLinecap="round" />
      <path d="M51.86,23.94a21.91,21.91,0,1,0,.91,13.25" strokeLinecap="round" />
    </svg>
  ),
  resetIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" strokeWidth="3" stroke="currentColor" fill="none">
      <path d="M34.46,53.91A21.91,21.91,0,1,0,12.55,31.78" />
      <polyline points="4.65 22.33 12.52 32.62 22.81 24.75" />
    </svg>
  ),
  searchIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  settingIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} width="30" height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z" />
    </svg>
  ),
  spinIcon: (props: SVGProps<SVGSVGElement>) => (
    <svg {...props} aria-hidden="true" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="#595757"
      />
    </svg>
  ),
  checkMark: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="45" fill="#2ecc71" />

      <polyline points="25,50 40,65 75,30" fill="none" stroke="#ffffff" strokeWidth="10" />
    </svg>
  ),
  arrowUp: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="colorCurrent"
      viewBox="0 0 330 330"
      transform="matrix(1,-1.2246467991473532e-16,-1.2246467991473532e-16,-1,0,0)"
      {...props}
    >
      <circle id="XMLID_24_" cx="165" cy="165" r="160" stroke="currentColor" stroke-width="10" fill="fillCurrent"></circle>
      <path
        id="XMLID_25_"
        d="M255.606,135.606l-79.998,80c-2.813,2.813-6.628,4.394-10.606,4.394c-3.979,0-7.793-1.58-10.607-4.394  l-80.002-80c-5.858-5.857-5.858-15.355,0-21.213c5.857-5.858,15.355-5.858,21.213,0l69.396,69.393l69.392-69.393  c5.857-5.858,15.355-5.858,21.213,0C261.465,120.251,261.465,129.749,255.606,135.606z"
        fill="currentColor"
      ></path>
    </svg>
  ),
  arrowDown: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="colorCurrent" viewBox="0 0 330 330" {...props}>
      <circle id="XMLID_24_" cx="165" cy="165" r="160" stroke="currentColor" strokeWidth="10" fill="fillCurrent"></circle>
      <path
        id="XMLID_25_"
        d="M255.606,135.606l-79.998,80c-2.813,2.813-6.628,4.394-10.606,4.394c-3.979,0-7.793-1.58-10.607-4.394  l-80.002-80c-5.858-5.857-5.858-15.355,0-21.213c5.857-5.858,15.355-5.858,21.213,0l69.396,69.393l69.392-69.393  c5.857-5.858,15.355-5.858,21.213,0C261.465,120.251,261.465,129.749,255.606,135.606z"
        fill="currentColor"
      ></path>
    </svg>
  ),
  arrowRight: (props: SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <polygon points="30,20 30,80 80,50" fill="currentColor" />
    </svg>
  ),
};
