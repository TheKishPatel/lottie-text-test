'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface LottieTextEditorProps {
  className?: string
}

export default function LottieTextEditor({ className }: LottieTextEditorProps) {
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

  // Function to update text in animation data
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
          // Update layer name if it matches the old text
          if (layer.nm === 'ChangeMe') {
            layer.nm = newText
          }
        })
      }
      
      // Ensure fonts structure exists
      if (!updatedData.fonts) {
        updatedData.fonts = { list: [] }
      }
      if (!Array.isArray(updatedData.fonts.list)) {
        updatedData.fonts.list = []
      }
      
      // Add font if it doesn't exist
      const fontExists = updatedData.fonts.list.some((f: any) => f && f.fName === newFont)
      if (!fontExists) {
        updatedData.fonts.list.push({
          fName: newFont,
          fFamily: newFont.split('-')[0] || newFont,
          fStyle: 'Regular',
          ascent: 73.0987548828125
        })
      }
      
      // Keep original character data but add missing ones
      if (!Array.isArray(updatedData.chars)) {
        updatedData.chars = []
      }
      
      // Get unique characters from the new text
      const uniqueChars = [...new Set(newText.split(''))]
      const existingChars = new Set(updatedData.chars.map((char: any) => char.ch))
      
      // Add missing characters with basic definitions
      uniqueChars.forEach(char => {
        if (!existingChars.has(char)) {
          updatedData.chars.push({
            ch: char,
            size: 166,
            style: 'Regular',
            w: char === ' ' ? 25 : 50,
            data: {
              shapes: []
            },
            fFamily: newFont.split('-')[0] || newFont
          })
        }
      })
      
      return updatedData
    } catch (error) {
      console.error('Error in updateAnimationText:', error)
      return data // Return original data if update fails
    }
  }

  // Initialize or update animation
  useEffect(() => {
    if (!containerRef.current || !animationData) {
      console.log('Missing container or animation data')
      return
    }

    try {
      console.log('Updating animation with text:', text, 'font:', font)
      const updatedData = updateAnimationText(animationData, text, font)
      if (!updatedData) {
        console.log('No updated data received')
        return
      }

      // Destroy existing animation
      if (animationRef.current) {
        animationRef.current.destroy()
      }

      console.log('Creating new animation with data:', updatedData)
      
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
      
      console.log('Animation created successfully')
    } catch (error) {
      console.error('Error updating animation:', error)
      console.error('Error stack:', error.stack)
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
            Text
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