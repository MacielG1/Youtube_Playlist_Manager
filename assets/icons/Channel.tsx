import { SVGProps } from "react";

export default function Channel(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="7.5" r="3.75" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}
