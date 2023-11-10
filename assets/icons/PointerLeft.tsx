import { SVGProps } from "react";

export default function PointerLeft(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
      <g transform="translate(24) scale(-1,1)">
        <path fill="none" d="M0 0h24v24H0z" />
        <path d="M4 6l8.5 6L4 18z" fill="currentColor" />
        <path d="M0 0h24v24H0z" fill="none" />
        <path d="M14 6h2v12h-2z" fill="currentColor" />
      </g>
    </svg>
  );
}
