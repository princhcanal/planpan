import { type UrlObject } from "url";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { cn } from "../../lib/utils";

interface BottomNavLinkProps {
  href: UrlObject | string;
  icon?: LucideIcon;
}
export const BottomNavLink: React.FC<
  React.PropsWithChildren<BottomNavLinkProps>
> = ({ children, href, ...props }) => {
  const router = useRouter();
  const isActive = router.pathname.includes(href as string);

  return (
    <Link href={href} className="flex-1">
      <p
        className={cn(
          {
            "!text-highlight": isActive,
          },
          "flex flex-col items-center text-background dark:text-foreground"
        )}
      >
        {props.icon && <props.icon className="mb-2" size="20" />}
        {children}
      </p>
    </Link>
  );
};
