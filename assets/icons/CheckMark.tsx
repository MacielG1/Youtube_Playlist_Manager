import { SVGProps } from "react";

export default function CheckMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" {...props}>
      <circle cx="50" cy="50" r="45" fill="#2ecc71" />

      <polyline points="25,50 40,65 75,30" fill="none" stroke="#ffffff" strokeWidth="10" />
    </svg>
  );
}
