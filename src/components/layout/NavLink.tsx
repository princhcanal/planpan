import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { type UrlObject } from "url";
import classNames from "classnames";

interface NavLinkProps {
  href: UrlObject | string;
}

export const NavLink: React.FC<React.PropsWithChildren<NavLinkProps>> = ({
  children,
  href,
}) => {
  const router = useRouter();

  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={classNames(
        "mb-2 w-full cursor-pointer rounded-md py-1 px-2 text-xl font-semibold text-gray-100 transition hover:bg-indigo-400",
        { "bg-indigo-400": isActive }
      )}
    >
      {children}
    </Link>
  );
};
