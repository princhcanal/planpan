import { NavLink } from "./NavLink";

export const Navbar = () => {
  return (
    <div className="flex h-screen w-72 flex-col bg-gray-800 px-10 pt-8 text-gray-100">
      <h2 className="mb-8 text-4xl font-bold text-indigo-400">PlanPan</h2>

      <div className="flex flex-col">
        <NavLink href="/dashboard">Dashboard</NavLink>
        <NavLink href="/guaps">Guaps</NavLink>
        <NavLink href="/peers">Peers</NavLink>
        <NavLink href="/billers">Billers</NavLink>
      </div>
    </div>
  );
};
