import { Check, Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/ThemeProvider"
import { cn } from "@/lib/utils" // Make sure you have this utility

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const renderItem = (itemTheme) => (
    <DropdownMenuItem
      onClick={() => setTheme(itemTheme)}
      className="cursor-pointer"
    >
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          theme === itemTheme ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Capitalize the first letter */}
      {itemTheme.charAt(0).toUpperCase() + itemTheme.slice(1)}
    </DropdownMenuItem>
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {renderItem("light")}
        {renderItem("dark")}
        {renderItem("system")}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}