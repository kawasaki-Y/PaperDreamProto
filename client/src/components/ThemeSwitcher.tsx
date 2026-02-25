import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 p-1 rounded-md bg-card/80 backdrop-blur-md border border-border/50 pointer-events-none">
      <Button
        data-testid="button-theme-white"
        variant="ghost"
        size="sm"
        onClick={() => setTheme("white")}
        className={`toggle-elevate ${theme === "white" ? "toggle-elevated" : ""} pointer-events-auto`}
      >
        白
      </Button>
      <Button
        data-testid="button-theme-black"
        variant="ghost"
        size="sm"
        onClick={() => setTheme("black")}
        className={`toggle-elevate ${theme === "black" ? "toggle-elevated" : ""} pointer-events-auto`}
      >
        黒
      </Button>
      <Button
        data-testid="button-theme-hybrid"
        variant="ghost"
        size="sm"
        onClick={() => setTheme("hybrid")}
        className={`toggle-elevate ${theme === "hybrid" ? "toggle-elevated" : ""} pointer-events-auto`}
      >
        HB
      </Button>
    </div>
  );
}
