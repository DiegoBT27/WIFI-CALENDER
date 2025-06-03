
"use client";

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface ManageProfilesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  definedProfiles: string[];
  onAddProfile: (profileName: string) => void;
  onDeleteProfile: (profileName: string) => void;
}

export function ManageProfilesDialog({
  isOpen,
  onClose,
  definedProfiles,
  onAddProfile,
  onDeleteProfile,
}: ManageProfilesDialogProps) {
  const [newProfileName, setNewProfileName] = useState('');
  const { toast } = useToast();
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmedName = newProfileName.trim();
    if (trimmedName === '') {
      toast({
        title: 'Nombre de perfil vacío',
        description: 'Por favor, introduce un nombre para el perfil.',
        variant: 'destructive',
      });
      return;
    }
    if (definedProfiles.includes(trimmedName)) {
      toast({
        title: 'Perfil Duplicado',
        description: `El perfil "${trimmedName}" ya existe.`,
        variant: 'destructive',
      });
      return;
    }
    if (trimmedName.toLowerCase() === "todos los perfiles" || trimmedName.toLowerCase() === "ninguno") {
      toast({
        title: 'Nombre de Perfil Reservado',
        description: `"${trimmedName}" es un nombre reservado y no puede ser usado.`,
        variant: 'destructive',
      });
      return;
    }
    onAddProfile(trimmedName);
    setNewProfileName('');
    toast({
      title: 'Perfil Agregado',
      description: `El perfil "${trimmedName}" ha sido agregado.`,
    });
  };

  const confirmDelete = (profileName: string) => {
    setProfileToDelete(profileName);
  };

  const handleDeleteConfirmed = () => {
    if (profileToDelete) {
      onDeleteProfile(profileToDelete);
      setProfileToDelete(null); // Close confirmation dialog
    }
  };

  const handleDialogClose = () => {
    onClose();
    setNewProfileName('');
    setProfileToDelete(null);
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleDialogClose(); }}>
        <DialogContent className="sm:max-w-md max-h-[80vh] grid grid-rows-[auto_auto_minmax(0,1fr)_auto]">
          <DialogHeader>
            <DialogTitle>Gestionar Perfiles</DialogTitle>
            <DialogDescription>
              Crea nuevos perfiles o elimina los existentes. Los clientes se pueden asignar a estos perfiles.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-[1fr_auto] items-center gap-2">
              <Input
                id="new-profile-name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                placeholder="Nombre del nuevo perfil"
                className="h-10"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
              <Button onClick={handleAdd} size="sm" className="h-10 px-3">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </div>
          </div>

          <ScrollArea className="min-h-0 border-t border-b my-2">
            <div className="p-4 space-y-2">
              {definedProfiles.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No hay perfiles definidos.</p>
              ) : (
                definedProfiles.map((profile) => (
                  <div
                    key={profile}
                    className="flex items-center justify-between p-2 border rounded-md bg-card hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{profile}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => confirmDelete(profile)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      aria-label={`Eliminar perfil ${profile}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cerrar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!profileToDelete} onOpenChange={(open) => { if (!open) setProfileToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro de eliminar el perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Eliminar el perfil "{profileToDelete}" desvinculará
              a todos los clientes asociados (no se eliminarán los clientes).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProfileToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmed}>Eliminar Perfil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
