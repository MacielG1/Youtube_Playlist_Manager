import Link from "next/link";

type Params = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

export default function LinkWrapper({ href, children, className, ...props }: Params) {
  if (href === "#") {
    return (
      <div className={className} {...props}>
        {children}
      </div>
    );
  } else {
    return (
      <Link href={href} className={className} {...props}>
        {children}
      </Link>
    );
  }
}
