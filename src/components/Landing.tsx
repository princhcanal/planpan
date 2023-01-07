import { signIn } from "next-auth/react";

export const Landing: React.FC = () => {
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
