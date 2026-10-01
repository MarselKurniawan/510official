import { useCallback, useRef, useState } from "react";
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

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

let handler: ((o: ConfirmOptions) => Promise<boolean>) | null = null;

/** Global promise-based confirm — resolves false if no dialog is mounted. */
export function confirmAction(options: ConfirmOptions = {}) {
  return handler ? handler(options) : Promise.resolve(false);
}

/**
 * Promise-based confirm dialog (replaces window.confirm).
 * const { confirm, dialog } = useConfirm();
 * if (!(await confirm({ title: "Delete?" }))) return;
 */
export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions>({});
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions = {}) => {
    setOpts(options);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    setOpen(false);
    resolver.current?.(value);
    resolver.current = null;
  };

  const dialog = (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) settle(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{opts.title ?? "Are you sure?"}</AlertDialogTitle>
          <AlertDialogDescription>
            {opts.description ?? "This action cannot be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => settle(false)}>
            {opts.cancelLabel ?? "Cancel"}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => settle(true)}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {opts.confirmLabel ?? "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  handler = confirm;

  return { confirm, dialog };
}
