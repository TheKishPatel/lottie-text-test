'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface SimpleLottieTextEditorProps {
  className?: string
}

export default function SimpleLottieTextEditor({ className }: SimpleLottieTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<AnimationItem | null>(null)
  const [text, setText] = useState('ChangeMe')
  const [font, setFont] = useState('Season-SansRegular')
  const [animationData, setAnimationData] = useState<any>(null)
  
  const availableFonts = [
    'Season-SansRegular',
    'Season-SerifHeavy',
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Roboto',
    'Open Sans'
  ]

  // Load the animation data
  useEffect(() => {
    fetch('/lottie-text-test.json')
      .then(response => response.json())
      .then(data => setAnimationData(data))
      .catch(error => console.error('Error loading animation data:', error))
  }, [])

  // Simple function to update only text and color, not characters
  const updateAnimationText = (data: any, newText: string, newFont: string) => {
    if (!data) return null
    
    try {
      const updatedData = JSON.parse(JSON.stringify(data)) // Deep clone
      
      // Update text in layers
      if (updatedData.layers) {
        updatedData.layers.forEach((layer: any) => {
          if (layer.t && layer.t.d && layer.t.d.k) {
            layer.t.d.k.forEach((textData: any) => {
              if (textData.s) {
                textData.s.t = newText
                textData.s.f = newFont
                // Make text black (RGB: 0, 0, 0)
                textData.s.fc = [0, 0, 0]
              }
            })
          }
          // Update layer name
          if (layer.nm === 'ChangeMe') {
            layer.nm = newText
          }
        })
      }
      
      return updatedData
    } catch (error) {
      console.error('Error in updateAnimationText:', error)
      return data
    }
  }

  // Initialize or update animation
  useEffect(() => {
    if (!containerRef.current || !animationData) return

    try {
      const updatedData = updateAnimationText(animationData, text, font)
      if (!updatedData) return

      // Destroy existing animation
      if (animationRef.current) {
        animationRef.current.destroy()
      }

      // Create new animation
      animationRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: updatedData
      })

      // Set animation speed to 20% of original
      if (animationRef.current) {
        animationRef.current.setSpeed(0.2)
      }
    } catch (error) {
      console.error('Error updating animation:', error)
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy()
      }
    }
  }, [animationData, text, font])

  return (
    <div className={`editor-container ${className || ''}`}>
      <div className="controls">
        <div className="input-group">
          <label htmlFor="text-input" className="label">
            Text (only characters from "ChangeMe" will display)
          </label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="input"
            placeholder="Enter your text"
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