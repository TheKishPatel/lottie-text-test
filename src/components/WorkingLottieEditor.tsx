'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface WorkingLottieEditorProps {
  className?: string
}

export default function WorkingLottieEditor({ className }: WorkingLottieEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lottieDataRef = useRef<AnimationItem | null>(null)
  const originalDataRef = useRef<any>(null)
  const [text, setText] = useState('ChangeMe')
  const [font, setFont] = useState('Season-SansRegular')
  const [isLoaded, setIsLoaded] = useState(false)
  
  // Font mapping - lottie name vs CSS name
  const availableFonts = [
    { name: 'Season-SansRegular', display: 'Season Sans (Original)' },
    { name: 'Arial', display: 'Arial' },
    { name: 'Arial, sans-serif', display: 'Arial (Fallback)' },
    { name: 'Helvetica', display: 'Helvetica' },
    { name: 'Times', display: 'Times' },
    { name: 'Times New Roman', display: 'Times New Roman' },
    { name: 'Georgia', display: 'Georgia' },
    { name: 'Impact', display: 'Impact' },
    { name: 'serif', display: 'Serif' },
    { name: 'sans-serif', display: 'Sans Serif' },
    { name: 'monospace', display: 'Monospace' }
  ]

  // Load original data once
  useEffect(() => {
    fetch('/lottie-text-test.json')
      .then(response => response.json())
      .then(data => {
        console.log('✅ Original data loaded')
        originalDataRef.current = data
        
        // Remove character checking to allow any characters
        if (data.chars) {
          delete data.chars
        }
        
        setIsLoaded(true)
        updateAndReload()
      })
      .catch(error => console.error('❌ Error loading animation:', error))
  }, [])

  // Update and reload animation
  const updateAndReload = () => {
    if (!originalDataRef.current || !containerRef.current) return

    console.log('🔄 Updating animation with:', { text, font })

    // Create a fresh copy of the original data
    const animationData = JSON.parse(JSON.stringify(originalDataRef.current))
    
    // Update the text data BEFORE creating animation
    if (animationData.layers?.[0]?.t?.d?.k?.[0]?.s) {
      animationData.layers[0].t.d.k[0].s.t = text
      animationData.layers[0].t.d.k[0].s.f = font
      animationData.layers[0].t.d.k[0].s.fc = [0, 0, 0] // Black
      
      console.log('✅ Text data updated:', {
        text: animationData.layers[0].t.d.k[0].s.t,
        font: animationData.layers[0].t.d.k[0].s.f,
        color: animationData.layers[0].t.d.k[0].s.fc
      })
    }

    // Also update font in the fonts list if it exists
    if (animationData.fonts && animationData.fonts.list) {
      // Clear existing fonts and add the new one
      animationData.fonts.list = [{
        fName: font,
        fFamily: font.split(',')[0].trim(), // Use first part of font name
        fStyle: 'Regular',
        ascent: 73.0987548828125
      }]
      
      console.log('✅ Font list updated:', animationData.fonts.list)
    }

    // Destroy existing animation
    if (lottieDataRef.current) {
      lottieDataRef.current.destroy()
    }

    // Create new animation with updated data
    lottieDataRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      animationData: animationData, // Fresh data with our changes
      autoplay: true,
      loop: true
    })

    // Set slower speed
    if (lottieDataRef.current) {
      lottieDataRef.current.setSpeed(0.2)
    }

    console.log('🎉 Animation reloaded with new text!')
  }

  // Update when text or font changes
  useEffect(() => {
    if (isLoaded) {
      updateAndReload()
    }
  }, [text, font, isLoaded])

  // Cleanup
  useEffect(() => {
    return () => {
      if (lottieDataRef.current) {
        lottieDataRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className={`editor-container ${className || ''}`}>
      <div className="controls">
        <div className="input-group">
          <label htmlFor="text-input" className="label">
            Text (Any characters now work!)
          </label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input"
            placeholder="Try: Hello World XYZ 123 🎉"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="font-select" className="label">
            Font
          </label>
          <select
            id="font-select"
            value={font}
            onChange={(e) => setFont(e.target.value)}
            className="select"
          >
            {availableFonts.map((fontObj) => (
              <option key={fontObj.name} value={fontObj.name}>
                {fontObj.display}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="animation-container">
        <div 
          ref={containerRef}
          style={{ width: '100%', height: '100%' }}
        />
        {!isLoaded && (
          <div style={{ 
            position: 'absolute', 
            top: '50%', 
            left: '50%', 
            transform: 'translate(-50%, -50%)',
            color: '#666'
          }}>
            Loading animation...
          </div>
        )}
      </div>
    </div>
  )
}