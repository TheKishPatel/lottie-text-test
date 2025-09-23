'use client'

import { useEffect, useRef, useState } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface TextLayer {
  id: string
  name: string
  text: string
  font: string
  originalText: string
  originalFont: string
}

interface DualTextLottieEditorProps {
  className?: string
}

export default function DualTextLottieEditor({ className }: DualTextLottieEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lottieDataRef = useRef<AnimationItem | null>(null)
  const originalDataRef = useRef<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Dynamic text layers state
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  
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

  // Scan Lottie data for text layers
  const scanTextLayers = (animationData: any): TextLayer[] => {
    const textLayers: TextLayer[] = []
    
    if (!animationData.layers) {
      console.log('❌ No layers found in animation data')
      return textLayers
    }

    console.log('🔍 Scanning for text layers...')
    
    animationData.layers.forEach((layer: any, index: number) => {
      // Check if layer has text data (ty: 5 is text layer type)
      if (layer.ty === 5 && layer.t?.d?.k?.[0]?.s) {
        const textData = layer.t.d.k[0].s
        const layerName = layer.nm || `Text Layer ${index + 1}`
        
        const textLayer: TextLayer = {
          id: `layer-${index}-${layerName.replace(/\s+/g, '-').toLowerCase()}`,
          name: layerName,
          text: textData.t || '',
          font: textData.f || 'Season-SansRegular',
          originalText: textData.t || '',
          originalFont: textData.f || 'Season-SansRegular'
        }
        
        textLayers.push(textLayer)
        
        console.log(`✅ Found text layer: "${layerName}"`, {
          text: textLayer.text,
          font: textLayer.font,
          layerIndex: index
        })
      }
    })
    
    console.log(`🎯 Total text layers found: ${textLayers.length}`)
    return textLayers
  }

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      alert('Please upload a JSON file')
      return
    }

    console.log('📁 Uploading file:', file.name)
    setUploadedFileName(file.name)

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string)
        console.log('✅ File parsed successfully')
        
        // Store original data
        originalDataRef.current = jsonData
        
        // Remove character checking to allow any characters
        if (jsonData.chars) {
          delete jsonData.chars
        }
        
        // Scan for text layers
        const foundTextLayers = scanTextLayers(jsonData)
        setTextLayers(foundTextLayers)
        
        if (foundTextLayers.length === 0) {
          alert('No text layers found in this Lottie file. Make sure the file contains text layers with proper structure.')
          return
        }
        
        setIsLoaded(true)
        console.log('🎉 Ready to edit text layers!')
        
      } catch (error) {
        console.error('❌ Error parsing JSON:', error)
        alert('Invalid JSON file. Please upload a valid Lottie animation file.')
      }
    }
    
    reader.readAsText(file)
  }

  // Load default animation on component mount
  const loadDefaultAnimation = () => {
    fetch('/lottie-text-test.json')
      .then(response => response.json())
      .then(data => {
        console.log('✅ Default animation loaded')
        originalDataRef.current = data
        
        // Remove character checking to allow any characters
        if (data.chars) {
          delete data.chars
        }
        
        // Scan for text layers
        const foundTextLayers = scanTextLayers(data)
        setTextLayers(foundTextLayers)
        setIsLoaded(true)
        setUploadedFileName('lottie-text-test.json (default)')
      })
      .catch(error => console.error('❌ Error loading default animation:', error))
  }

  // Load default animation on component mount
  useEffect(() => {
    loadDefaultAnimation()
  }, [])

  // Find layer by name
  const findLayerByName = (animationData: any, layerName: string) => {
    return animationData.layers?.find((layer: any) => layer.nm === layerName)
  }

  // Update text layer
  const updateTextLayer = (layerId: string, field: 'text' | 'font', value: string) => {
    setTextLayers(prevLayers => 
      prevLayers.map(layer => 
        layer.id === layerId 
          ? { ...layer, [field]: value }
          : layer
      )
    )
  }

  // Update and reload animation
  const updateAndReload = () => {
    if (!originalDataRef.current || !containerRef.current || textLayers.length === 0) return

    console.log('🔄 Updating animation with text layers:', textLayers.map(layer => ({
      name: layer.name,
      text: layer.text,
      font: layer.font
    })))

    // Create a fresh copy of the original data
    const animationData = JSON.parse(JSON.stringify(originalDataRef.current))
    
    // Update each text layer
    textLayers.forEach(textLayer => {
      const layer = findLayerByName(animationData, textLayer.name)
      if (layer && layer.t?.d?.k?.[0]?.s) {
        layer.t.d.k[0].s.t = textLayer.text
        layer.t.d.k[0].s.f = textLayer.font
        layer.t.d.k[0].s.fc = [0, 0, 0] // Black
        
        console.log(`✅ ${textLayer.name} updated:`, {
          text: layer.t.d.k[0].s.t,
          font: layer.t.d.k[0].s.f
        })
      } else {
        console.log(`❌ ${textLayer.name} layer not found or invalid structure`)
      }
    })

    // Update font list with all used fonts
    if (animationData.fonts && animationData.fonts.list) {
      const usedFonts = [...new Set(textLayers.map(layer => layer.font))] // Remove duplicates
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

    console.log(`🎉 Animation reloaded with ${textLayers.length} text layers!`)
  }

  // Update when text layers change
  useEffect(() => {
    if (isLoaded && textLayers.length > 0) {
      updateAndReload()
    }
  }, [textLayers, isLoaded])

  // Cleanup
  useEffect(() => {
    return () => {
      if (lottieDataRef.current) {
        lottieDataRef.current.destroy()
      }
    }
  }, [])

  // Generate colors for text layer cards
  const getLayerColor = (index: number) => {
    const colors = [
      { border: '#007bff', bg: '#f8f9fa', text: '#007bff' }, // Blue
      { border: '#28a745', bg: '#f8fff9', text: '#28a745' }, // Green
      { border: '#dc3545', bg: '#fff5f5', text: '#dc3545' }, // Red
      { border: '#ffc107', bg: '#fffbf0', text: '#856404' }, // Yellow
      { border: '#6f42c1', bg: '#f8f5ff', text: '#6f42c1' }, // Purple
      { border: '#fd7e14', bg: '#fff8f0', text: '#fd7e14' }, // Orange
    ]
    return colors[index % colors.length]
  }

  return (
    <div className={`editor-container ${className || ''}`}>
      {/* Left Column - Sticky Animation Preview */}
      <div className="animation-column">
        <div className="animation-container">
          <div 
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
      
      {/* Right Column - Scrollable Controls */}
      <div className="controls-column">
        <div className="controls">
          {/* File Upload Section */}
          <div style={{ 
            marginBottom: '20px', 
            padding: '15px', 
            border: '2px solid #6c757d', 
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#6c757d', fontSize: '18px' }}>
              📁 Upload Lottie File
            </h3>
            
            <div className="input-group" style={{ marginBottom: '10px' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                style={{
                  padding: '8px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  width: '100%',
                  fontSize: '14px'
                }}
              />
            </div>
            
            {uploadedFileName && (
              <div style={{ 
                fontSize: '12px', 
                color: '#6c757d',
                fontStyle: 'italic'
              }}>
                Current file: {uploadedFileName}
              </div>
            )}
          </div>

          {/* Dynamic Text Layer Controls */}
          {textLayers.map((textLayer, index) => {
            const colors = getLayerColor(index)
            return (
              <div 
                key={textLayer.id}
                style={{ 
                  marginBottom: '20px', 
                  padding: '15px', 
                  border: `2px solid ${colors.border}`, 
                  borderRadius: '8px',
                  backgroundColor: colors.bg
                }}
              >
                <h3 style={{ margin: '0 0 15px 0', color: colors.text, fontSize: '18px' }}>
                  📝 {textLayer.name}
                </h3>
                
                <div className="input-group" style={{ marginBottom: '10px' }}>
                  <label htmlFor={`text-${textLayer.id}`} className="label">
                    Text Content
                  </label>
                  <input
                    id={`text-${textLayer.id}`}
                    type="text"
                    value={textLayer.text}
                    onChange={(e) => updateTextLayer(textLayer.id, 'text', e.target.value)}
                    className="input"
                    placeholder={`Enter ${textLayer.name.toLowerCase()} text...`}
                  />
                  {textLayer.originalText !== textLayer.text && (
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                      Original: "{textLayer.originalText}"
                    </div>
                  )}
                </div>
                
                <div className="input-group">
                  <label htmlFor={`font-${textLayer.id}`} className="label">
                    Font Family
                  </label>
                  <select
                    id={`font-${textLayer.id}`}
                    value={textLayer.font}
                    onChange={(e) => updateTextLayer(textLayer.id, 'font', e.target.value)}
                    className="select"
                  >
                    {availableFonts.map((fontObj) => (
                      <option key={`${textLayer.id}-${fontObj.name}`} value={fontObj.name}>
                        {fontObj.display}
                      </option>
                    ))}
                  </select>
                  {textLayer.originalFont !== textLayer.font && (
                    <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                      Original: {textLayer.originalFont}
                    </div>
                  )}
                </div>
              </div>
            )
          })}

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
            {isLoaded 
              ? `✅ ${textLayers.length} text layer${textLayers.length !== 1 ? 's' : ''} ready for editing!` 
              : '⏳ Loading animation...'
            }
          </div>
        </div>
      </div>
    </div>
  )
}