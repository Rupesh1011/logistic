import { ReactNode, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export type CrudTableProps<T> = {
  title: string;
  rows: T[];
  columns: { header: string; render: (row: T) => ReactNode; className?: string }[];
  onAdd: () => void;
  onEdit: (row: T) => void;
  onDelete: (row: T) => void;
  rowDescription: (row: T) => string;
  emptyState: string;
  /** Optional row id for keys; falls back to index. */
  rowKey?: (row: T) => string;
};

export function CrudTable<T>({
  title,
  rows,
  columns,
  onAdd,
  onEdit,
  onDelete,
  rowDescription,
  emptyState,
  rowKey,
}: CrudTableProps<T>) {
  const [pendingDelete, setPendingDelete] = useState<T | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg text-navy">{title}</h3>
        <Button
          size="sm"
          onClick={onAdd}
          className="bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-navy text-navy-foreground text-left text-xs uppercase tracking-wider">
            <tr>
              {columns.map((c) => (
                <th key={c.header} className={`px-3 py-3 ${c.className ?? ""}`}>
                  {c.header}
                </th>
              ))}
              <th className="px-3 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="p-10 text-center text-muted-foreground">
                  {emptyState}
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={rowKey?.(row) ?? i} className="border-t border-border align-top">
                  {columns.map((c) => (
                    <td key={c.header} className={`px-3 py-3 ${c.className ?? ""}`}>
                      {c.render(row)}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="mr-1"
                      onClick={() => onEdit(row)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setPendingDelete(row)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(o) => !o && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this row?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete && rowDescription(pendingDelete)}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDelete) {
                  onDelete(pendingDelete);
                  setPendingDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
