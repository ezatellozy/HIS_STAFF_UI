import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Edit,
  Activity,
  History
} from 'lucide-react';
import { Patient } from '../../../types/his';
import { ClinicalNoteRecord, NoteAddendum } from '../../../types/clinicalNotesDocumentation';
import { INITIAL_PATIENT_NOTES } from '../../../data/mockDocumentationData';
import { DocumentationFeed } from '../documentation/DocumentationFeed';
import { NoteDetailDrawer } from '../documentation/NoteDetailDrawer';
import { NoteComposerWorkspace } from '../documentation/NoteComposerWorkspace';
import { AddendumModal, AmendNoteModal, MarkErrorModal } from '../documentation/NoteActionModals';
import { DocumentationFormsModal } from '../documentation/DocumentationFormsModal';
import { useHis } from '../../../context/HisContext';

interface NotesActivityProps {
  patient: Patient;
}

export const NotesActivity: React.FC<NotesActivityProps> = ({ patient }) => {
  const { playChime, switchWorkspaceActivity } = useHis();

  // Notes state initialized with mock clinical notes
  const [notes, setNotes] = useState<ClinicalNoteRecord[]>(INITIAL_PATIENT_NOTES);

  // Active views / drawer / composer
  const [selectedNote, setSelectedNote] = useState<ClinicalNoteRecord | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isFormsModalOpen, setIsFormsModalOpen] = useState(false);

  // Modal states for actions
  const [addendumTargetNote, setAddendumTargetNote] = useState<ClinicalNoteRecord | null>(null);
  const [amendTargetNote, setAmendTargetNote] = useState<ClinicalNoteRecord | null>(null);
  const [markErrorTargetNote, setMarkErrorTargetNote] = useState<ClinicalNoteRecord | null>(null);

  // Handle save new note
  const handleSaveNewNote = (newNote: ClinicalNoteRecord) => {
    setNotes([newNote, ...notes]);
  };

  // Handle add addendum
  const handleAddAddendum = (noteId: string, addendum: NoteAddendum) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          const updatedAddenda = [addendum, ...note.addenda];
          const updatedNote = {
            ...note,
            addenda: updatedAddenda,
            state: note.state === 'draft' ? note.state : ('addendum_appended' as const)
          };
          if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(updatedNote);
          }
          return updatedNote;
        }
        return note;
      })
    );
  };

  // Handle amend note
  const handleAmendNote = (noteId: string, updatedContent: string, reason: string) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          const newVersionNumber = note.version + 1;
          const newVersionSnapshot = {
            versionNumber: note.version,
            savedAt: note.signedAt || note.documentedAt,
            savedBy: note.author.name,
            title: note.titleAr,
            content: note.content,
            state: note.state,
            changeReason: reason
          };

          const updatedNote: ClinicalNoteRecord = {
            ...note,
            version: newVersionNumber,
            content: updatedContent,
            state: 'amended',
            amendedBy: 'د. طارق المنشاوي',
            amendedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            amendmentReason: reason,
            versionHistory: [newVersionSnapshot, ...note.versionHistory]
          };

          if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(updatedNote);
          }
          return updatedNote;
        }
        return note;
      })
    );
  };

  // Handle mark in error
  const handleMarkInError = (noteId: string, errorReason: string) => {
    setNotes(prev =>
      prev.map(note => {
        if (note.id === noteId) {
          const updatedNote: ClinicalNoteRecord = {
            ...note,
            state: 'entered_in_error',
            errorReason,
            enteredInErrorAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            enteredInErrorBy: 'د. طارق المنشاوي'
          };
          if (selectedNote && selectedNote.id === noteId) {
            setSelectedNote(updatedNote);
          }
          return updatedNote;
        }
        return note;
      })
    );
  };

  const totalSigned = notes.filter(n => n.state === 'final_signed' || n.state === 'amended').length;
  const pendingCoSign = notes.filter(n => n.coSignRequirement === 'required_pending').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-900">
                منظومة التوثيق والملاحظات السريرية (Clinical Documentation Workspace)
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                Axis 5 Baseline
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
              <span>إجمالي السجلات: <strong className="text-slate-800">{notes.length}</strong></span>
              <span>•</span>
              <span>معتمد وموقع: <strong className="text-emerald-700">{totalSigned}</strong></span>
              {pendingCoSign > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{pendingCoSign} يتطلب اعتماد استشاري</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFormsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            title="فتح نماذج التوثيق السريري المعتمدة (إقرار، دخول، خروج)"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>النماذج السريرية المعتمدة (Forms)</span>
          </button>

          <button
            onClick={() => setIsComposerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تدوين ملاحظة سريرية جديدة (New Note)</span>
          </button>
        </div>
      </div>

      {/* Large Workspace Composer when triggered */}
      {isComposerOpen && (
        <div className="animate-in slide-in-from-top-4 duration-200">
          <NoteComposerWorkspace
            patient={patient}
            existingNotes={notes}
            onClose={() => setIsComposerOpen(false)}
            onSaveNote={handleSaveNewNote}
            onOpenForms={() => setIsFormsModalOpen(true)}
          />
        </div>
      )}

      {/* Interdisciplinary Feed & Filterable Stream */}
      <DocumentationFeed
        notes={notes}
        onSelectNote={note => setSelectedNote(note)}
        onAddAddendum={note => setAddendumTargetNote(note)}
        onAmendNote={note => setAmendTargetNote(note)}
        onMarkError={note => setMarkErrorTargetNote(note)}
      />

      {/* Full Note Detail Drawer (Review & Readability Surface) */}
      {selectedNote && (
        <NoteDetailDrawer
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onAddAddendum={note => setAddendumTargetNote(note)}
          onAmend={note => setAmendTargetNote(note)}
          onMarkError={note => setMarkErrorTargetNote(note)}
        />
      )}

      {/* Modals for Focused Actions */}
      {addendumTargetNote && (
        <AddendumModal
          note={addendumTargetNote}
          onClose={() => setAddendumTargetNote(null)}
          onSave={handleAddAddendum}
        />
      )}

      {amendTargetNote && (
        <AmendNoteModal
          note={amendTargetNote}
          onClose={() => setAmendTargetNote(null)}
          onSave={handleAmendNote}
        />
      )}

      {markErrorTargetNote && (
        <MarkErrorModal
          note={markErrorTargetNote}
          onClose={() => setMarkErrorTargetNote(null)}
          onConfirm={handleMarkInError}
        />
      )}

      {/* Structured Documentation Forms Modal */}
      {isFormsModalOpen && (
        <DocumentationFormsModal
          isOpen={isFormsModalOpen}
          onClose={() => setIsFormsModalOpen(false)}
          patient={patient}
          onSaveNote={handleSaveNewNote}
        />
      )}
    </div>
  );
};
