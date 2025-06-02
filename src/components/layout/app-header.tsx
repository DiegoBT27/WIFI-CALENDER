
import { ThemeToggle } from "./theme-toggle";
import { Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  onOpenSavedInvoicesDialog: () => void;
}

export function AppHeader({ onOpenSavedInvoicesDialog }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 md:flex-1">
          <Button variant="outline" size="sm" onClick={onOpenSavedInvoicesDialog} className="font-normal">
            VER FACTURAS
          </Button>
        </div>
        <div className="flex flex-grow items-center justify-center gap-2">
          <Wifi className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-primary">WIFI CALENDER</h1>
        </div>
        <div className="flex items-center md:flex-1 justify-end">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
