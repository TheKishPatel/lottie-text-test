'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface FixedLottieTextEditorProps {
  className?: string
}

export default function FixedLottieTextEditor({ className }: FixedLottieTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lottieDataRef = useRef<AnimationItem | null>(null)
  const [text, setText] = useState('ChangeMe')
  const [font, setFont] = useState('Season-SansRegular')
  const [isLoaded, setIsLoaded] = useState(false)
  
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

  // Initialize animation - CodePen pattern
  const initAnimation = async () => {
    if (!containerRef.current) return

    try {
      // Fetch the JSON data
      const response = await fetch('/lottie-text-test.json')
      const animationData = await response.json()

      // Load animation FIRST (CodePen pattern)
      lottieDataRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg', // Fixed: SVG not canvas!
        animationData: animationData,
        autoplay: true,
        loop: true
      })

      // Set slower speed
      lottieDataRef.current.setSpeed(0.2)

      setIsLoaded(true)
      console.log('Animation loaded, ready for text updates')
    } catch (error) {
      console.error('Error loading animation:', error)
    }
  }

  // Update text using EXACT CodePen pattern
  const updateText = () => {
    if (!lottieDataRef.current || !isLoaded) {
      console.log('Animation not ready')
      return
    }

    console.log('Updating text to:', text, 'font to:', font)

    // EXACT CodePen pattern: modify lottieData.animationData.layers[X]
    // Our JSON has layer at index 0 (not 1 like CodePen)
    lottieDataRef.current.animationData.layers[0].t.d.k[0].s.t = text
    lottieDataRef.current.animationData.layers[0].t.d.k[0].s.f = font
    lottieDataRef.current.animationData.layers[0].t.d.k[0].s.fc = [0, 0, 0] // Black

    console.log('Data updated, reloading animation')

    // Reload animation (CodePen pattern)
    reloadAnimation()
  }

  // Reload function - EXACT CodePen pattern
  const reloadAnimation = () => {
    if (!lottieDataRef.current || !containerRef.current) return

    // Store the animation data
    const animData = lottieDataRef.current.animationData

    // Destroy existing
    lottieDataRef.current.destroy()

    // Recreate with SAME data object (CodePen pattern)
    lottieDataRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg', // SVG like CodePen
      animationData: animData, // Same object reference!
      autoplay: true,
      loop: true
    })

    // Set speed again
    lottieDataRef.current.setSpeed(0.2)

    console.log('Animation reloaded successfully')
  }

  // Initialize on mount
  useEffect(() => {
    initAnimation()

    return () => {
      if (lottieDataRef.current) {
        lottieDataRef.current.destroy()
      }
    }
  }, [])

  // Update text when state changes (like CodePen input handler)
  useEffect(() => {
    if (isLoaded) {
      updateText()
    }
  }, [text, font, isLoaded])

  return (
    <div className={`editor-container ${className || ''}`}>
      <div className="controls">
        <div className="input-group">
          <label htmlFor="text-input" className="label">
            Text (CodePen pattern - any characters!)
          </label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input"
            placeholder="Type anything: ABC xyz 123 !@#"
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
        {!isLoaded && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            Loading animation...
          </div>
        )}
      </div>
    </div>
  )
}