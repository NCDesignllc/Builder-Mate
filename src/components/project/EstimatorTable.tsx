import React from 'react';
import { Plus, Sparkles, Trash2 } from 'lucide-react';
import type { EstimateItem } from '../../lib/types';
import { VoiceMicButton } from '../ui/VoiceMicButton';

type Props = {
  estimateItems: EstimateItem[];
  setEstimateItems: React.Dispatch<React.SetStateAction<EstimateItem[]>> | ((items: EstimateItem[]) => void);
  isDarkMode: boolean;
  setShowAiSuggestModal: (v: boolean) => void;
};

export function EstimatorTable({ estimateItems, setEstimateItems, isDarkMode, setShowAiSuggestModal }: Props) {
  const theme = {
    header: `px-4 py-3 text-[11px] font-semibold uppercase border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`,
    cell: `px-4 py-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`,
    input: `w-full bg-transparent border-none outline-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`,
  };

  const updateItem = (id: string, f: keyof EstimateItem, v: any) => {
    const next = estimateItems.map((i) => (String(i.id) === String(id) ? { ...i, [f]: v } : i));
    (setEstimateItems as any)(next);
  };

  const addItem = () => {
    const next = [
      ...estimateItems,
      { id: `${Date.now()}-${Math.floor(Math.random() * 1e6)}`, description: '', type: 'Material', quantity: 1, rate: 0 },
    ];
    (setEstimateItems as any)(next);
  };

  const removeItem = (id: string) => {
    const next = estimateItems.filter((i) => String(i.id) !== String(id));
    (setEstimateItems as any)(next);
  };

  return (
    <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className={theme.header}>Description</th>
            <th className={theme.header}>Type</th>
            <th className={theme.header}>Qty</th>
            <th className={theme.header}>Rate</th>
            <th className={theme.header}>Total</th>
            <th className={theme.header}></th>
          </tr>
        </thead>
        <tbody>
          {estimateItems.map((item) => (
            <tr key={String(item.id)}>
              <td className={`${theme.cell} relative`}>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(String(item.id), 'description', e.target.value)}
                  className={theme.input}
                />
                <div className="absolute right-2 top-2">
                  <VoiceMicButton onResult={(t) => updateItem(String(item.id), 'description', t)} />
                </div>
              </td>
              <td className={theme.cell}>
                <select
                  value={item.type}
                  onChange={(e) => updateItem(String(item.id), 'type', e.target.value)}
                  className={theme.input}
                >
                  <option value="Material">Material</option>
                  <option value="Labor">Labor</option>
                </select>
              </td>
              <td className={theme.cell}>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(String(item.id), 'quantity', Number(e.target.value))}
                  className={theme.input}
                />
              </td>
              <td className={theme.cell}>
                <input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(String(item.id), 'rate', Number(e.target.value))}
                  className={theme.input}
                />
              </td>
              <td className={theme.cell}>${Number(item.quantity) * Number(item.rate)}</td>
              <td className={theme.cell}>
                <button onClick={() => removeItem(String(item.id))} title="Delete row">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-3 border-t flex justify-between">
        <button onClick={addItem} className="text-xs font-bold flex items-center text-orange-600">
          <Plus size={14} /> Add
        </button>
        <button onClick={() => setShowAiSuggestModal(true)} className="text-xs flex items-center">
          <Sparkles size={14} className="mr-1" /> AI Fill
        </button>
      </div>
    </div>
  );
}
