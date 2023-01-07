import { type NextPage } from "next";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Dashboard: NextPage = () => {
  const { data: sessionData } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!sessionData) {
      router.replace("/");
    }
  }, [router, sessionData]);

  return (
    <div>
      <h2 className="mb-2 text-3xl font-bold">Dashboard</h2>
      <button
        onClick={() => signOut()}
        className="w-full rounded-md bg-indigo-400 p-2 text-white transition hover:bg-indigo-500"
      >
        Sign out
      </button>
    </div>
  );
};

export default Dashboard;
