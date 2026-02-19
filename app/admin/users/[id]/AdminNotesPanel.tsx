'use client'

import { useState, useTransition } from 'react'
import { addNote, deleteNote } from './actions'

interface Note {
  id: string
  note: string
  created_at: string
  created_by: string
  author_name?: string | null
}

interface Props {
  userId: string
  notes: Note[]
}

export function AdminNotesPanel({ userId, notes: initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    startTransition(async () => {
      try {
        await addNote(userId, text)
        setText('')
        setError(null)
      } catch (err: any) {
        setError(err.message ?? 'Failed to add note.')
      }
    })
  }

  function handleDelete(noteId: string) {
    startTransition(async () => {
      try {
        await deleteNote(noteId, userId)
        setNotes((prev) => prev.filter((n) => n.id !== noteId))
        setError(null)
      } catch (err: any) {
        setError(err.message ?? 'Failed to delete note.')
      }
    })
  }

  return (
    <div className="bg-dark-700 border border-primary/20 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">Admin Notes</h2>

      {error && (
        <p className="text-sm px-3 py-2 rounded-lg bg-red-900/40 text-red-400">{error}</p>
      )}

      {/* Add note */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a note…"
          className="flex-1 bg-dark border border-primary/20 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-gray-500 text-sm">No notes yet.</p>
      ) : (
        <ul className="space-y-3">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3 items-start group">
              <div className="flex-1 bg-dark border border-primary/10 rounded-lg px-3 py-2">
                <p className="text-white text-sm">{n.note}</p>
                <p className="text-gray-500 text-xs mt-1">
                  {n.author_name ?? 'Admin'} · {new Date(n.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(n.id)}
                disabled={pending}
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs mt-1 disabled:opacity-50"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
