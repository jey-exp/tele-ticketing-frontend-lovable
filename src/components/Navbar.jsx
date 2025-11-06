import { Bell, User, LogOut } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "./ThemeToggle"; // Dr. X's Addition: Import the new component

export const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4">
        <SidebarTrigger className="lg:hidden" />

        <div className="flex items-center gap-2">
          <div className="flex h-auto w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">
              NT
            </span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-foreground">
              Network Ticketing
            </h1>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {/* Dr. X's Addition: The ThemeToggle component is now self-contained. */}
          <ThemeToggle />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user ? getInitials(user.username) : "..."}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden flex-col items-start text-left lg:flex">
                  <span className="text-sm font-medium">
                    {user?.username
                      ? user.username.charAt(0).toUpperCase() +
                        user.username.slice(1).toLowerCase()
                      : ""}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.role}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.username
                      ? user.username.charAt(0).toUpperCase() +
                        user.username.slice(1).toLowerCase()
                      : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.role}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
