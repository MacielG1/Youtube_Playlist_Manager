import { SVGProps } from "react";

export default function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="30 20 50 60" {...props}>
      <polygon points="30,20 30,80 80,50" fill="currentColor" />
    </svg>
  );
}
