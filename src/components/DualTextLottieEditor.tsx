'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface DualTextLottieEditorProps {
  className?: string
}

export default function DualTextLottieEditor({ className }: DualTextLottieEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lottieDataRef = useRef<AnimationItem | null>(null)
  const originalDataRef = useRef<any>(null)
  
  // Separate states for both text layers
  const [titleText, setTitleText] = useState('Title')
  const [titleFont, setTitleFont] = useState('Season-SansRegular')
  const [subtitleText, setSubtitleText] = useState('Subtitle')
  const [subtitleFont, setSubtitleFont] = useState('Season-SansRegular')
  
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
        console.log('Layers found:', data.layers?.map((layer: any, index: number) => ({
          index,
          name: layer.nm,
          type: layer.ty,
          hasText: !!layer.t
        })))
        
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

  // Find layer by name
  const findLayerByName = (animationData: any, layerName: string) => {
    return animationData.layers?.find((layer: any) => layer.nm === layerName)
  }

  // Update and reload animation
  const updateAndReload = () => {
    if (!originalDataRef.current || !containerRef.current) return

    console.log('🔄 Updating animation with:', { 
      title: { text: titleText, font: titleFont },
      subtitle: { text: subtitleText, font: subtitleFont }
    })

    // Create a fresh copy of the original data
    const animationData = JSON.parse(JSON.stringify(originalDataRef.current))
    
    // Update Title layer (find by name)
    const titleLayer = findLayerByName(animationData, 'Title')
    if (titleLayer && titleLayer.t?.d?.k?.[0]?.s) {
      titleLayer.t.d.k[0].s.t = titleText
      titleLayer.t.d.k[0].s.f = titleFont
      titleLayer.t.d.k[0].s.fc = [0, 0, 0] // Black
      
      console.log('✅ Title updated:', {
        text: titleLayer.t.d.k[0].s.t,
        font: titleLayer.t.d.k[0].s.f
      })
    } else {
      console.log('❌ Title layer not found or invalid structure')
    }

    // Update Subtitle layer (find by name)
    const subtitleLayer = findLayerByName(animationData, 'Subtitle')
    if (subtitleLayer && subtitleLayer.t?.d?.k?.[0]?.s) {
      subtitleLayer.t.d.k[0].s.t = subtitleText
      subtitleLayer.t.d.k[0].s.f = subtitleFont
      subtitleLayer.t.d.k[0].s.fc = [0, 0, 0] // Black
      
      console.log('✅ Subtitle updated:', {
        text: subtitleLayer.t.d.k[0].s.t,
        font: subtitleLayer.t.d.k[0].s.f
      })
    } else {
      console.log('❌ Subtitle layer not found or invalid structure')
    }

    // Update font list with all used fonts
    if (animationData.fonts && animationData.fonts.list) {
      const usedFonts = [...new Set([titleFont, subtitleFont])] // Remove duplicates
      animationData.fonts.list = usedFonts.map(font => ({
        fName: font,
        fFamily: font.split(',')[0].trim(),
        fStyle: 'Regular',
        ascent: 73.0987548828125
      }))
      
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
      animationData: animationData,
      autoplay: true,
      loop: true
    })

    // Set slower speed (20% of original)
    if (lottieDataRef.current) {
      lottieDataRef.current.setSpeed(0.2)
    }

    console.log('🎉 Animation reloaded with both text layers!')
  }

  // Update when any text or font changes
  useEffect(() => {
    if (isLoaded) {
      updateAndReload()
    }
  }, [titleText, titleFont, subtitleText, subtitleFont, isLoaded])

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
        {/* Title Controls */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          border: '2px solid #007bff', 
          borderRadius: '8px',
          backgroundColor: '#f8f9fa'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#007bff', fontSize: '18px' }}>
            📝 Title Layer
          </h3>
          
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="title-input" className="label">
              Title Text
            </label>
            <input
              id="title-input"
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              className="input"
              placeholder="Enter title text..."
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="title-font" className="label">
              Title Font
            </label>
            <select
              id="title-font"
              value={titleFont}
              onChange={(e) => setTitleFont(e.target.value)}
              className="select"
            >
              {availableFonts.map((fontObj) => (
                <option key={`title-${fontObj.name}`} value={fontObj.name}>
                  {fontObj.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Subtitle Controls */}
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          border: '2px solid #28a745', 
          borderRadius: '8px',
          backgroundColor: '#f8fff9'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#28a745', fontSize: '18px' }}>
            💬 Subtitle Layer
          </h3>
          
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="subtitle-input" className="label">
              Subtitle Text
            </label>
            <input
              id="subtitle-input"
              type="text"
              value={subtitleText}
              onChange={(e) => setSubtitleText(e.target.value)}
              className="input"
              placeholder="Enter subtitle text..."
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="subtitle-font" className="label">
              Subtitle Font
            </label>
            <select
              id="subtitle-font"
              value={subtitleFont}
              onChange={(e) => setSubtitleFont(e.target.value)}
              className="select"
            >
              {availableFonts.map((fontObj) => (
                <option key={`subtitle-${fontObj.name}`} value={fontObj.name}>
                  {fontObj.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status */}
        <div style={{ 
          textAlign: 'center', 
          padding: '10px', 
          backgroundColor: isLoaded ? '#d4edda' : '#fff3cd',
          border: `1px solid ${isLoaded ? '#c3e6cb' : '#ffeaa7'}`,
          borderRadius: '4px',
          fontSize: '14px',
          color: isLoaded ? '#155724' : '#856404'
        }}>
          {isLoaded ? '✅ Both text layers ready for editing!' : '⏳ Loading animation...'}
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