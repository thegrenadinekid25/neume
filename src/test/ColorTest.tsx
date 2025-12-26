import React from 'react'
import {
  getScaleDegreeColor,
  getKeyBackground,
  SCALE_DEGREE_COLORS_MAJOR,
  SCALE_DEGREE_COLORS_MINOR,
  UI_COLORS,
} from '@/styles/colors'

export const ColorTest: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Color System Test</h2>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Scale Degrees - Major</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {Object.entries(SCALE_DEGREE_COLORS_MAJOR).map(([degree, color]) => (
            <div
              key={degree}
              style={{
                backgroundColor: color,
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {degree}
              <br />
              <small style={{ fontSize: '0.7em' }}>{color}</small>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Scale Degrees - Minor</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1rem' }}>
          {Object.entries(SCALE_DEGREE_COLORS_MINOR).map(([degree, color]) => (
            <div
              key={degree}
              style={{
                backgroundColor: color,
                padding: '2rem',
                borderRadius: '8px',
                textAlign: 'center',
                color: '#fff',
                fontWeight: 'bold',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              }}
            >
              {degree}
              <br />
              <small style={{ fontSize: '0.7em' }}>{color}</small>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>UI Colors</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {Object.entries(UI_COLORS).map(([name, color]) => (
            <div
              key={name}
              style={{
                backgroundColor: color,
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center',
                color: name.includes('background') || name.includes('border') ? '#333' : '#fff',
                fontWeight: 'bold',
                fontSize: '0.8em',
              }}
            >
              {name}
              <br />
              <small style={{ fontSize: '0.8em' }}>{color}</small>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '1.5rem' }}>
        <h3>Function Tests</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div>
            <strong>getScaleDegreeColor(1, 'major'):</strong>
            <div
              style={{
                backgroundColor: getScaleDegreeColor(1, 'major'),
                padding: '1rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                color: '#fff',
              }}
            >
              {getScaleDegreeColor(1, 'major')}
            </div>
          </div>

          <div>
            <strong>getScaleDegreeColor(5, 'minor'):</strong>
            <div
              style={{
                backgroundColor: getScaleDegreeColor(5, 'minor'),
                padding: '1rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                color: '#fff',
              }}
            >
              {getScaleDegreeColor(5, 'minor')}
            </div>
          </div>

          <div>
            <strong>getKeyBackground('C', 'major'):</strong>
            <div
              style={{
                backgroundColor: getKeyBackground('C', 'major'),
                padding: '1rem',
                marginTop: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
              }}
            >
              {getKeyBackground('C', 'major')}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
