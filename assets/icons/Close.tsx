import { SVGProps } from "react";

export default function Close(props: SVGProps<SVGSVGElement>) {
  return (
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
  );
}
