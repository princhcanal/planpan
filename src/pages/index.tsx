import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { CenterLayout } from "../components/layout/CenterLayout";
import { type NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  if (sessionData?.user) {
    router.replace("/dashboard");
  }

  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">Landing</h1>
      <button
        onClick={() => signIn()}
        className="w-full rounded-md bg-indigo-400 p-2 text-white transition hover:bg-indigo-500"
      >
        Sign in
      </button>
    </div>
  );
};

Home.getLayout = CenterLayout;

export default Home;
