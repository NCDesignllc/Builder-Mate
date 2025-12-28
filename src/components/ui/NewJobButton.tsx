import React from 'react';
import { Plus } from 'lucide-react';

type Props = {
  onClick: () => void;
};

export function NewJobButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-xs uppercase flex items-center hover:bg-orange-700"
      title="New Job"
    >
      <Plus size={16} className="mr-2" /> New Job
    </button>
  );
}
