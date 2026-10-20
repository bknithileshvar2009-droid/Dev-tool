/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, ListFilter, Edit3, Cloud, Calendar as CalendarIcon, Clock, Flame, Trash2, BookOpen } from 'lucide-react';
import {
  getLocalDateString,
  saveDailyRegister,
  loadDailyRegisters,
} from '../utils/firebase';

interface DailyRegistryHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  uid: string | null;
  userEmail: string | null;
}

export const DailyRegistryHistoryModal: React.FC<DailyRegistryHistoryModalProps> = ({
  isOpen,
  onClose,
  uid,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'history'>('register');
  const [todayStr] = useState(getLocalDateString());
  
  // Register form state
  const [newTopic, setNewTopic] = useState('');
  const [newDuration, setNewDuration] = useState<number>(30);
  const [newNotes, setNewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid) return;
    setIsSubmitting(true);
    try {
      await saveDailyRegister(uid, todayStr, {
        topic: newTopic,
        duration: newDuration,
        notes: newNotes,
      });
      setAlreadyRegistered(true);
      setNewTopic('');
      setNewNotes('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-4xl h-[80vh] rounded-3xl bg-[#090d16] border border-cyan-500/30 shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold">Daily Register</h2>
          <button onClick={onClose} className="p-2 rounded-xl bg-white/5 hover:bg-white/15"><X className="w-4 h-4" /></button>
        </div>

        {/* Tabs */}
        <div className="px-5 py-3 border-b border-white/10 flex gap-2 bg-black/40">
          <button onClick={() => setActiveTab('register')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'register' ? 'bg-cyan-500/30 text-cyan-200' : 'text-white/60'}`}>
            <Plus className="w-3.5 h-3.5 inline mr-1" /> Daily Register
          </button>
          <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'history' ? 'bg-cyan-500/30 text-cyan-200' : 'text-white/60'}`}>
            <ListFilter className="w-3.5 h-3.5 inline mr-1" /> History View
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'register' ? (
            alreadyRegistered ? (
              <div className="p-6 text-center text-amber-300 bg-amber-500/10 rounded-2xl">Already Registered for Today</div>
            ) : (
              <form onSubmit={handleCreateEntry} className="space-y-4">
                 <input type="text" value={newTopic} onChange={e => setNewTopic(e.target.value)} placeholder="Topic" className="w-full p-2 bg-white/5 rounded-xl text-xs" />
                 <input type="number" value={newDuration} onChange={e => setNewDuration(Number(e.target.value))} className="w-full p-2 bg-white/5 rounded-xl text-xs" />
                 <textarea value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Notes..." className="w-full p-2 bg-white/5 rounded-xl text-xs" />
                 <button type="submit" disabled={isSubmitting} className="w-full py-2 bg-cyan-500 text-black font-bold rounded-xl">Submit</button>
              </form>
            )
          ) : (
            <div className="text-white/50 text-sm">History View Implementation Pending...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyRegistryHistoryModal;
