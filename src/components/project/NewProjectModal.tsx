import React, { useState } from 'react';
import { Modal } from '../ui/Modal';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onCreate: (data: { name: string; client: string }) => void;
};

export function NewProjectModal({ isOpen, onClose, isDarkMode, onCreate }: Props) {
  const [name, setName] = useState('');
  const [client, setClient] = useState('');

  const submit = () => {
    const n = name.trim();
    const c = client.trim();
    if (!n) return;
    onCreate({ name: n, client: c });
    setName('');
    setClient('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Job" isDarkMode={isDarkMode}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase opacity-70">Project Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`w-full border p-2 rounded outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}
            placeholder="Kitchen Remodel"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase opacity-70">Client</label>
          <input
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className={`w-full border p-2 rounded outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-100' : 'bg-white border-slate-200'}`}
            placeholder="John Smith"
          />
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          className="w-full bg-orange-600 text-white py-2 rounded font-bold disabled:opacity-60"
        >
          Create Job
        </button>
      </div>
    </Modal>
  );
}
