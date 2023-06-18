import { type AppProps, type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { type NextPage } from "next";
import {
  type PropsWithChildren,
  type ReactElement,
  type ReactNode,
} from "react";
import { Layout } from "../components/layout/Layout";
import { Toaster } from "../components/ui/Toaster";

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export type NextPageWithLayout<P = AppPropsWithLayout, IP = P> = NextPage<
  P,
  IP
> & {
  getLayout?: (page: ReactElement) => ReactNode;
  public?: boolean;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: AppPropsWithLayout) => {
  const getLayout = Component.getLayout ?? Layout;
  const component = getLayout(<Component {...pageProps} />);

  return (
    <SessionProvider session={session}>
      {Component.public ? component : <Auth>{component}</Auth>}
      <Toaster />
    </SessionProvider>
  );
};

const Auth = ({ children }: PropsWithChildren) => {
  const { status } = useSession({
    required: true,
  });

  if (status === "loading") {
    return <></>;
  }

  return <>{children}</>;
};

export default trpc.withTRPC(MyApp);
