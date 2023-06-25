import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/DropdownMenu";

export const ThemePicker = () => {
  const { theme, setTheme, systemTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-background dark:text-foreground"
        >
          {isLight ? <Sun /> : <Moon />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Choose Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <div className="flex items-center">
            <Sun className="mr-2" />
            <span>Light</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <div className="flex items-center">
            <Moon className="mr-2" />
            <span>Dark</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme(systemTheme ?? "light")}>
          <div className="flex items-center">
            <Laptop className="mr-2" />
            <span>System</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
