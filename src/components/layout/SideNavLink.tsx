import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { type UrlObject } from "url";
import { cn } from "../../lib/utils";
import type { LucideIcon } from "lucide-react";

interface SideNavLinkProps {
  href: UrlObject | string;
  icon?: LucideIcon;
}

export const SideNavLink: React.FC<
  React.PropsWithChildren<SideNavLinkProps>
> = ({ children, href, ...props }) => {
  const router = useRouter();
  const isActive = router.pathname.includes(href as string);

  return (
    <Link
      href={href}
      className={cn(
        "w-full cursor-pointer rounded-md px-2 py-2 hover:bg-highlight hover:text-foreground dark:hover:text-background",
        {
          "bg-highlight": isActive,
          "text-foreground": isActive,
          "dark:text-background": isActive,
        }
      )}
    >
      <p className="flex items-center">
        {props.icon && <props.icon className="mr-4" size="20" />}
        {children}
      </p>
    </Link>
  );
};
