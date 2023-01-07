import { signOut } from "next-auth/react";

export const Dashboard: React.FC = () => {
  return (
    <div>
      <h1 className="mb-2 text-4xl font-bold">Dashboard</h1>
      <button
        onClick={() => signOut()}
        className="w-full rounded-md bg-indigo-400 p-2 text-white transition hover:bg-indigo-500"
      >
        Sign out
      </button>
    </div>
  );
};
