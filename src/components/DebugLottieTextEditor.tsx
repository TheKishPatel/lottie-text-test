'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface DebugLottieTextEditorProps {
  className?: string
}

export default function DebugLottieTextEditor({ className }: DebugLottieTextEditorProps) {
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
    'Open Sans'
  ]

  // Initialize animation
  const initAnimation = async () => {
    if (!containerRef.current) return

    try {
      console.log('=== LOADING ANIMATION ===')
      const response = await fetch('/lottie-text-test.json')
      const animationData = await response.json()
      
      console.log('Animation data structure:', {
        hasLayers: !!animationData.layers,
        layersCount: animationData.layers?.length,
        layer0: animationData.layers?.[0]?.t?.d?.k?.[0]?.s
      })

      // Load animation
      lottieDataRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: 'svg',
        animationData: animationData,
        autoplay: true,
        loop: true
      })

      lottieDataRef.current.setSpeed(0.2)
      setIsLoaded(true)
      
      console.log('=== ANIMATION LOADED ===')
      console.log('lottieData.animationData exists:', !!lottieDataRef.current.animationData)
      console.log('Layer structure:', lottieDataRef.current.animationData?.layers?.[0]?.t?.d?.k?.[0]?.s)
      
    } catch (error) {
      console.error('Error loading animation:', error)
    }
  }

  // Debug text update
  const updateTextDebug = () => {
    if (!lottieDataRef.current || !isLoaded) {
      console.log('❌ Animation not ready')
      return
    }

    console.log('=== UPDATING TEXT ===')
    console.log('Target text:', text)
    console.log('Target font:', font)

    // Check if the path exists
    const animData = lottieDataRef.current.animationData
    console.log('animationData exists:', !!animData)
    console.log('layers exists:', !!animData?.layers)
    console.log('layers[0] exists:', !!animData?.layers?.[0])
    console.log('layers[0].t exists:', !!animData?.layers?.[0]?.t)
    console.log('layers[0].t.d exists:', !!animData?.layers?.[0]?.t?.d)
    console.log('layers[0].t.d.k exists:', !!animData?.layers?.[0]?.t?.d?.k)
    console.log('layers[0].t.d.k[0] exists:', !!animData?.layers?.[0]?.t?.d?.k?.[0])
    console.log('layers[0].t.d.k[0].s exists:', !!animData?.layers?.[0]?.t?.d?.k?.[0]?.s)

    if (animData?.layers?.[0]?.t?.d?.k?.[0]?.s) {
      const textData = animData.layers[0].t.d.k[0].s
      console.log('Current text data:', textData)
      console.log('Current text:', textData.t)
      console.log('Current font:', textData.f)
      console.log('Current color:', textData.fc)

      // Update values
      console.log('=== SETTING NEW VALUES ===')
      textData.t = text
      textData.f = font
      textData.fc = [0, 0, 0]

      console.log('After update - text:', textData.t)
      console.log('After update - font:', textData.f)
      console.log('After update - color:', textData.fc)

      // Try to reload
      reloadAnimation()
    } else {
      console.log('❌ Cannot find text data path')
    }
  }

  // Reload animation
  const reloadAnimation = () => {
    if (!lottieDataRef.current || !containerRef.current) {
      console.log('❌ Missing refs for reload')
      return
    }

    console.log('=== RELOADING ANIMATION ===')
    const animData = lottieDataRef.current.animationData

    lottieDataRef.current.destroy()

    lottieDataRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      animationData: animData,
      autoplay: true,
      loop: true
    })

    lottieDataRef.current.setSpeed(0.2)
    console.log('✅ Animation reloaded')
  }

  // Handle text input changes
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value
    console.log('=== TEXT INPUT CHANGED ===')
    console.log('New text:', newText)
    setText(newText)
  }

  const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = e.target.value
    console.log('=== FONT CHANGED ===')
    console.log('New font:', newFont)
    setFont(newFont)
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

  // Update text when state changes
  useEffect(() => {
    if (isLoaded) {
      console.log('=== STATE CHANGED, UPDATING TEXT ===')
      updateTextDebug()
    }
  }, [text, font, isLoaded])

  return (
    <div className={`editor-container ${className || ''}`}>
      <div className="controls">
        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
          Debug: Check browser console for detailed logs
        </div>
        
        <div className="input-group">
          <label htmlFor="text-input" className="label">
            Text (Debug Mode)
          </label>
          <input
            id="text-input"
            type="text"
            value={text}
            onChange={handleTextChange}
            className="input"
            placeholder="Type to see debug logs"
          />
        </div>
        
        <div className="input-group">
          <label htmlFor="font-select" className="label">
            Font
          </label>
          <select
            id="font-select"
            value={font}
            onChange={handleFontChange}
            className="select"
          >
            {availableFonts.map((fontName) => (
              <option key={fontName} value={fontName}>
                {fontName}
              </option>
            ))}
          </select>
        </div>

        <button 
          onClick={updateTextDebug}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Manual Update (Debug)
        </button>
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