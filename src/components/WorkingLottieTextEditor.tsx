'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface WorkingLottieTextEditorProps {
  className?: string
}

export default function WorkingLottieTextEditor({ className }: WorkingLottieTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const animationDataRef = useRef<any>(null)
  const [text, setText] = useState('ChangeMe')
  const [font, setFont] = useState('Season-SansRegular')
  
  const availableFonts = [
    'Season-SansRegular',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Roboto',
    'Open Sans',
    'Impact',
    'Comic Sans MS'
  ]

  // Load the animation data once
  useEffect(() => {
    fetch('/lottie-text-test.json')
      .then(response => response.json())
      .then(data => {
        animationDataRef.current = data
        initAnimation()
      })
      .catch(error => console.error('Error loading animation data:', error))
  }, [])

  // Initialize animation
  const initAnimation = () => {
    if (!containerRef.current || !animationDataRef.current) return

    // Update initial text properties
    updateTextData()

    // Create animation
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'canvas', // Using canvas like CodePen
      animationData: animationDataRef.current,
      autoplay: true,
      loop: true
    })

    // Set animation speed to 20% (slower)
    if (animationRef.current) {
      animationRef.current.setSpeed(0.2)
    }
  }

  // Update text data directly (CodePen pattern)
  const updateTextData = () => {
    if (!animationDataRef.current) return

    // Direct targeting like CodePen: layers[0].t.d.k[0].s
    const textData = animationDataRef.current.layers[0].t.d.k[0].s
    
    // Update text
    textData.t = text
    
    // Update font
    textData.f = font
    
    // Make text black
    textData.fc = [0, 0, 0]
    
    console.log('Updated text data:', { text, font, color: textData.fc })
  }

  // Reload animation (CodePen pattern)
  const reloadAnimation = () => {
    if (!containerRef.current || !animationDataRef.current) return

    // Update the data first
    updateTextData()

    // Destroy existing animation
    if (animationRef.current) {
      animationRef.current.destroy()
    }

    // Recreate animation
    animationRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'canvas',
      animationData: animationDataRef.current,
      autoplay: true,
      loop: true
    })

    // Set speed
    if (animationRef.current) {
      animationRef.current.setSpeed(0.2)
    }
  }

  // Handle text changes
  useEffect(() => {
    if (animationDataRef.current) {
      reloadAnimation()
    }
  }, [text, font])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [])

  return (
    <div className={`editor-container ${className || ''}`}>
      <div className="controls">
        <div className="input-group">
          <label htmlFor="text-input" className="label">
            Text (unlimited characters!)
          </label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input"
            placeholder="Type anything you want!"
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
            {availableFonts.map((fontName) => (
              <option key={fontName} value={fontName}>
                {fontName}
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
      </div>
    </div>
  )
}