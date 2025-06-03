
"use client";

import * as React from 'react';
import { ThemeToggle } from "./theme-toggle";
import { Settings, Users, FileText, Download, Upload, Wifi } from "lucide-react"; // Added Wifi icon
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppHeaderProps {
  onOpenSavedInvoicesDialog: () => void;
  onOpenManageProfilesDialog: () => void;
  onExportCustomers: () => void;
  onTriggerImportCustomers: () => void;
  availableProfiles: string[];
  selectedProfile: string;
  onProfileChange: (profile: string) => void;
}

export function AppHeader({
  onOpenSavedInvoicesDialog,
  onOpenManageProfilesDialog,
  onExportCustomers,
  onTriggerImportCustomers,
  availableProfiles,
  selectedProfile,
  onProfileChange
}: AppHeaderProps) {
  const [isOptionsMenuOpen, setIsOptionsMenuOpen] = React.useState(false);
  const showProfileSelector = availableProfiles && availableProfiles.length > 1 && availableProfiles.some(p => p !== "Todos los Perfiles");

  const handleProfileSelection = (profile: string) => {
    onProfileChange(profile);
    setIsOptionsMenuOpen(false); 
  };

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mb-[100px]">
      <div className="container mx-auto flex flex-row items-center justify-between pt-[100px] pb-5">

        {/* Left Group: Options Menu */}
        <div className="flex items-center gap-3">
          <DropdownMenu open={isOptionsMenuOpen} onOpenChange={setIsOptionsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 border bg-card hover:bg-accent hover:text-accent-foreground"
                aria-label="Opciones"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => { onOpenManageProfilesDialog(); setIsOptionsMenuOpen(false); }}>
                <Users className="mr-2 h-4 w-4" />
                <span>Gestionar Perfiles</span>
              </DropdownMenuItem>

              {showProfileSelector && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => e.preventDefault()} // Prevent closing on item click if select is interacted with
                    className="p-0 focus:bg-transparent hover:bg-transparent cursor-default"
                  >
                    <div className="flex items-center justify-between w-full px-2 py-1.5 gap-2 text-popover-foreground">
                      <span className="text-sm shrink-0 text-popover-foreground">Perfil:</span>
                      <Select
                        value={selectedProfile}
                        onValueChange={handleProfileSelection} // This will close the menu
                      >
                        <SelectTrigger
                          className="w-full min-w-[130px] max-w-[180px] h-8 text-xs data-[placeholder]:text-muted-foreground focus:bg-transparent hover:bg-transparent"
                          aria-label="Seleccionar perfil"
                          onClick={(e) => e.stopPropagation()} // Prevent menu item click when opening select
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProfiles.map(profile => (
                            <SelectItem key={profile} value={profile} className="text-xs">
                              {profile}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { onOpenSavedInvoicesDialog(); setIsOptionsMenuOpen(false); }}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Ver Facturas Guardadas</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onExportCustomers(); setIsOptionsMenuOpen(false); }}>
                <Download className="mr-2 h-4 w-4" />
                <span>Exportar Clientes</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => { onTriggerImportCustomers(); setIsOptionsMenuOpen(false); }}>
                <Upload className="mr-2 h-4 w-4" />
                <span>Importar Clientes</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center Group: Title/Logo */}
        <div className="text-center px-2 whitespace-nowrap">
          <h1 className="group inline-flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-primary whitespace-nowrap">
            <span>WIFI</span>
            <Wifi className="h-[0.8em] w-[0.8em] text-primary group-hover:text-accent transition-colors duration-200" />
            <span>CALENDER</span>
          </h1>
        </div>

        {/* Right Group: Theme Toggle */}
        <div className="flex items-center">
          <ThemeToggle />
        </div>

      </div>
    </header>
  );
}
