import { signIn } from "next-auth/react";
import { CenterLayout } from "../components/layout/CenterLayout";
import { type NextPageWithLayout } from "./_app";

const Home: NextPageWithLayout = () => {
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">Landing</h1>
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
        className="w-full rounded-md bg-indigo-400 p-2 text-white transition hover:bg-indigo-500"
      >
        Sign in
      </button>
    </div>
  );
};

Home.getLayout = CenterLayout;
Home.public = true;

export default Home;
