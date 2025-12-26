import React from 'react'
import { motion } from 'framer-motion'
import { Chord, Scale, Note } from 'tonal'
import * as Tone from 'tone'
import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

// Test Zustand store
const useTestStore = create<{ count: number }>(() => ({ count: 0 }))

// Test component using all libraries
export const InstallationTest: React.FC = () => {
  const chord = Chord.get('Cmaj7')
  const scale = Scale.get('C major')
  const midiNote = Note.midi('C4')
  const id = uuidv4()
  const today = format(new Date(), 'PPP')
  const storeValue = useTestStore()

  // Test Tone.js
  const synthTest = () => {
    const synth = new Tone.Synth().toDestination()
    console.log('Tone.js synth created:', synth instanceof Tone.Synth)
    return 'Synth created successfully'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h2>Installation Verification Test</h2>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Music Theory (Tonal.js)</h3>
        <ul>
          <li><strong>Chord:</strong> {chord.name}</li>
          <li><strong>Notes:</strong> {chord.notes.join(', ')}</li>
          <li><strong>Scale:</strong> {scale.name}</li>
          <li><strong>Scale Notes:</strong> {scale.notes.join(', ')}</li>
          <li><strong>C4 MIDI:</strong> {midiNote}</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Audio (Tone.js)</h3>
        <ul>
          <li><strong>Version:</strong> {Tone.version}</li>
          <li><strong>Synth Test:</strong> {synthTest()}</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Animation (Framer Motion)</h3>
        <p>This component is animated! (fade in + slide)</p>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>State Management (Zustand)</h3>
        <ul>
          <li><strong>Store Value:</strong> {storeValue.count}</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Utilities</h3>
        <ul>
          <li><strong>UUID:</strong> {id}</li>
          <li><strong>Date (date-fns):</strong> {today}</li>
        </ul>
      </section>

      <section style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h3 style={{ color: '#2e7d32' }}>✓ All Dependencies Verified!</h3>
        <p>All core libraries are installed and working correctly.</p>
      </section>
    </motion.div>
  )
}
