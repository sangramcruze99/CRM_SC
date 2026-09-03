'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DeleteActionButtonProps {
  onDeleteAction: () => Promise<void>;
  label?: string;
  className?: string;
  size?: number;
  confirmTitle?: string;
}

export function DeleteActionButton({
  onDeleteAction,
  label,
  className = '',
  size = 14,
  confirmTitle = 'Are you sure you want to delete this item?'
}: DeleteActionButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm(confirmTitle)) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteAction();
      router.refresh();
    } catch (err) {
      console.error('Failed to execute delete:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isDeleting}
      title="Delete"
      className={`group/del inline-flex items-center gap-1.5 p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer disabled:opacity-50 ${className}`}
    >
      {isDeleting ? (
        <Loader2 size={size} className="animate-spin text-rose-400" />
      ) : (
        <Trash2 size={size} className="transition-transform group-hover/del:scale-110" />
      )}
      {label && <span className="text-xs font-semibold">{isDeleting ? 'Deleting...' : label}</span>}
    </button>
  );
}
