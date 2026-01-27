'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DangerZoneProps {
  onDelete: () => void;
  isDeleting: boolean;
}

export function DangerZone({ onDelete, isDeleting }: DangerZoneProps) {
  const [confirm, setConfirm] = useState(false);

  return (
    <div className="glass rounded-xl p-5 border-destructive/30">
      <div className="flex items-center gap-2 mb-3 text-destructive">
        <AlertTriangle className="w-5 h-5" />
        <span className="font-medium">Danger Zone</span>
      </div>
      {confirm ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Are you sure? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" onClick={onDelete} disabled={isDeleting}>
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}{' '}
              Delete
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => setConfirm(true)}
        >
          <Trash2 className="w-4 h-4" /> Delete Agent
        </Button>
      )}
    </div>
  );
}

