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
  const clickListenersRef = useRef<Array<{ element: Element; listener: EventListener; type: string }>>([])  
  
  // Dynamic text layers state
  const [textLayers, setTextLayers] = useState<TextLayer[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  
  // Player controls state
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1) // Changed default from 0.2 to 1
  const [loop, setLoop] = useState(true)
  const [showBackground, setShowBackground] = useState(false)
  
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
      autoplay: isPlaying,
      loop: loop
    })

    // Set speed and get duration
    if (lottieDataRef.current) {
      lottieDataRef.current.setSpeed(speed)
      setDuration(lottieDataRef.current.getDuration(true))
      
      // Add event listeners for animation events
      lottieDataRef.current.addEventListener('enterFrame', () => {
        if (lottieDataRef.current) {
          setCurrentTime(lottieDataRef.current.currentFrame)
        }
      })
      
      lottieDataRef.current.addEventListener('complete', () => {
        if (!loop) {
          setIsPlaying(false)
        }
      })
    }

    console.log(`🎉 Animation reloaded with ${textLayers.length} text layers!`)
    
    // Make text layers clickable after animation loads
    makeTextLayersClickable()
  }

  // Player control functions
  const togglePlayPause = () => {
    if (!lottieDataRef.current) return
    
    if (isPlaying) {
      lottieDataRef.current.pause()
    } else {
      lottieDataRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimelineChange = (newTime: number) => {
    if (!lottieDataRef.current) return
    
    lottieDataRef.current.goToAndStop(newTime, true)
    // Don't set currentTime here as it's already set in the onChange handler
  }

  const handleSpeedChange = (newSpeed: number) => {
    if (!lottieDataRef.current) return
    
    lottieDataRef.current.setSpeed(newSpeed)
    setSpeed(newSpeed)
  }

  const toggleLoop = () => {
    const newLoop = !loop
    setLoop(newLoop)
    
    if (lottieDataRef.current) {
      // Recreate animation with new loop setting
      updateAndReload()
    }
  }

  const toggleBackground = () => {
    setShowBackground(!showBackground)
  }

  // Update when text layers or player settings change
  useEffect(() => {
    if (isLoaded && textLayers.length > 0) {
      updateAndReload()
    }
  }, [textLayers, isLoaded, speed, loop, isPlaying])

  // Cleanup
  useEffect(() => {
    return () => {
      cleanupClickListeners()
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

  // Clean up existing click listeners
  const cleanupClickListeners = () => {
    clickListenersRef.current.forEach(({ element, listener, type }) => {
      element.removeEventListener(type, listener)
    })
    clickListenersRef.current = []
  }

  // Make text layers clickable to focus corresponding inputs
  const makeTextLayersClickable = () => {
    if (!containerRef.current || !lottieDataRef.current || textLayers.length === 0) return

    // Clean up existing listeners first
    cleanupClickListeners()

    console.log('🖱️ Making text layers clickable...')

    // Wait for SVG to be fully rendered
    setTimeout(() => {
      const svgElement = containerRef.current?.querySelector('svg')
      if (!svgElement) {
        console.log('❌ SVG element not found')
        return
      }

      console.log('🔍 Analyzing SVG structure for text groups...')
      
      // Find text groups by looking for g elements that contain meaningful text
      const groups = svgElement.querySelectorAll('g')
      const textGroups: { group: Element; texts: Element[]; fullText: string; layer?: any }[] = []

      groups.forEach((group, groupIndex) => {
        const textElements = group.querySelectorAll('text, tspan')
        if (textElements.length === 0) return

        // Combine all text content from this group
        const fullText = Array.from(textElements)
          .map(el => el.textContent?.trim() || '')
          .filter(text => text.length > 0)
          .join('')

        // Skip groups with no meaningful text content or very short text (likely decorative)
        if (fullText.length === 0 || fullText.length < 2) return
        
        // Skip groups that only contain single characters or symbols (likely not user text)
        if (fullText.length === 1 && !/[a-zA-Z0-9]/.test(fullText)) return

        // Check aria-label first, then group attributes, then text content
        const ariaLabel = group.getAttribute('aria-label')
        const groupName = group.getAttribute('data-name') || group.getAttribute('id')
        
        console.log(`📝 Group ${groupIndex}:`, {
          ariaLabel,
          groupName,
          fullText,
          textElementCount: textElements.length
        })

        // Smart matching with exact priority and conflict resolution
        const matchingLayer = (() => {
          const ariaLower = ariaLabel?.toLowerCase()
          const groupNameLower = groupName?.toLowerCase()
          const fullTextLower = fullText.toLowerCase()
          
          console.log(`🔍 Matching group with:`, {
            ariaLabel,
            groupName,
            fullText,
            availableLayers: textLayers.map(l => ({ name: l.name, text: l.text }))
          })
          
          // Create scoring system for matches
          const layerScores = textLayers.map(layer => {
            const layerNameLower = layer.name.toLowerCase()
            const layerTextLower = layer.text.toLowerCase()
            let score = 0
            let matchType = ''
            
            // Exact matches get highest scores
            if (ariaLower === layerNameLower) {
              score += 1000
              matchType = 'aria-name-exact'
            } else if (ariaLower === layerTextLower) {
              score += 900
              matchType = 'aria-text-exact'
            } else if (groupNameLower === layerNameLower) {
              score += 800
              matchType = 'group-name-exact'
            } else if (fullTextLower === layerTextLower) {
              score += 700
              matchType = 'content-exact'
            }
            
            // Partial matches get lower scores, with length-based penalties for conflicts
            else if (ariaLower && ariaLower.includes(layerNameLower) && layerNameLower.length >= 3) {
              // Penalize if this could be a substring conflict (like "title" in "subtitle")
              const penalty = layerNameLower === 'title' && ariaLower.includes('subtitle') ? -500 : 0
              score += 100 + layerNameLower.length * 10 + penalty
              matchType = 'aria-name-partial'
            } else if (ariaLower && ariaLower.includes(layerTextLower) && layerTextLower.length >= 3) {
              const penalty = layerTextLower === 'title' && ariaLower.includes('subtitle') ? -500 : 0
              score += 90 + layerTextLower.length * 10 + penalty
              matchType = 'aria-text-partial'
            } else if (fullTextLower && fullTextLower.includes(layerTextLower) && layerTextLower.length >= 3) {
              const penalty = layerTextLower === 'title' && fullTextLower.includes('subtitle') ? -500 : 0
              score += 50 + layerTextLower.length * 5 + penalty
              matchType = 'content-partial'
            }
            
            return { layer, score, matchType }
          })
          
          // Sort by score and return the best match
          const bestMatch = layerScores
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)[0]
          
          if (bestMatch) {
            console.log(`✅ Best match: ${bestMatch.layer.name} (score: ${bestMatch.score}, type: ${bestMatch.matchType})`)
            return bestMatch.layer
          }
          
          console.log(`❌ No match found`)
          return null
        })()

        if (matchingLayer) {
          textGroups.push({
            group,
            texts: Array.from(textElements),
            fullText,
            layer: matchingLayer
          })
          console.log(`✅ Matched group to layer: ${matchingLayer.name}`)
        } else {
          console.log(`⚠️ No matching layer found for group with text: "${fullText}"`)
        }
      })

      // If no groups found with text, fall back to individual text elements
      if (textGroups.length === 0) {
        console.log('🔄 No text groups found, falling back to individual text elements...')
        
        const allTextElements = svgElement.querySelectorAll('text')
        allTextElements.forEach((textEl) => {
          const textContent = textEl.textContent?.trim()
          if (!textContent) return

          const matchingLayer = textLayers.find(layer => {
            return layer.text === textContent || 
                   textContent.includes(layer.text) ||
                   layer.text.includes(textContent)
          })

          if (matchingLayer) {
            textGroups.push({
              group: textEl.parentElement || textEl,
              texts: [textEl],
              fullText: textContent,
              layer: matchingLayer
            })
          }
        })
      }

      console.log(`🎯 Found ${textGroups.length} interactive text groups`)

      // Add interactivity to each text group with proper isolation
      textGroups.forEach(({ group, texts, fullText, layer }, groupIndex) => {
        if (!layer) return

        console.log(`🖱️ Making group clickable: "${fullText}" -> ${layer.name}`)

        // Store original styles for this specific group with unique identifiers
        const groupId = `group-${groupIndex}-${layer.id}`
        const originalStyles = new Map()
        
        texts.forEach((textEl, textIndex) => {
          const elementId = `${groupId}-text-${textIndex}`
          originalStyles.set(elementId, {
            element: textEl,
            fill: textEl.getAttribute('fill') || '#000000',
            style: textEl.getAttribute('style') || ''
          })
          // Store the element ID on the element for later reference
          textEl.setAttribute('data-group-id', groupId)
          textEl.setAttribute('data-element-id', elementId)
        })

        // Add event listeners to individual text elements with element-specific handlers
        texts.forEach((textEl, textIndex) => {
          const elementId = `${groupId}-text-${textIndex}`
          
          const mouseEnterListener = (e: Event) => {
            e.stopPropagation()
            const target = e.target as Element
            const targetGroupId = target.getAttribute('data-group-id')
            
            console.log(`🖱️ Hovering on group: ${layer.name} (${targetGroupId})`)
            
            // Only highlight elements from the same group
            texts.forEach((groupTextEl) => {
              if (groupTextEl.getAttribute('data-group-id') === targetGroupId) {
                groupTextEl.setAttribute('fill', '#0066cc')
                groupTextEl.setAttribute('style', `${groupTextEl.getAttribute('style') || ''} cursor: pointer; opacity: 0.8;`)
              }
            })
          }
          
          const mouseLeaveListener = (e: Event) => {
            e.stopPropagation()
            const target = e.target as Element
            const targetGroupId = target.getAttribute('data-group-id')
            
            console.log(`🖱️ Leaving group: ${layer.name} (${targetGroupId})`)
            
            // Only restore elements from the same group
            texts.forEach((groupTextEl) => {
              if (groupTextEl.getAttribute('data-group-id') === targetGroupId) {
                const elId = groupTextEl.getAttribute('data-element-id')
                const originalStyle = originalStyles.get(elId)
                if (originalStyle) {
                  groupTextEl.setAttribute('fill', originalStyle.fill)
                  groupTextEl.setAttribute('style', `${originalStyle.style} cursor: pointer; opacity: 1;`)
                }
              }
            })
          }

          const clickListener = (e: Event) => {
            e.preventDefault()
            e.stopPropagation()
            
            console.log(`🎯 Clicked on text group "${fullText}", focusing input for: ${layer.name}`)
            
            // Focus the corresponding input
            const inputElement = document.getElementById(`text-${layer.id}`) as HTMLInputElement
            if (inputElement) {
              inputElement.focus()
              inputElement.select()
              
              // Smooth scroll to the input with custom easing
              inputElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              })
              
              // Add CSS-based smooth scroll animation with custom easing
              const scrollContainer = (inputElement.closest('.controls-column') as HTMLElement) || document.documentElement
              if (scrollContainer) {
                // Apply custom easing using CSS transition
                const originalTransition = (scrollContainer as HTMLElement).style.scrollBehavior
                ;(scrollContainer as HTMLElement).style.scrollBehavior = 'smooth'
                
                // Use requestAnimationFrame for smoother custom easing
                const startTime = performance.now()
                const startScrollTop = scrollContainer.scrollTop
                const inputRect = inputElement.getBoundingClientRect()
                const containerRect = scrollContainer.getBoundingClientRect()
                const targetScrollTop = startScrollTop + inputRect.top - containerRect.top - (containerRect.height / 2) + (inputRect.height / 2)
                const scrollDistance = targetScrollTop - startScrollTop
                
                const easeInOutCustom = (t: number): number => {
                  // Custom easing: cubic-bezier(0.2, 0.8, 0, 1)
                  // Approximation of the bezier curve
                  return t < 0.5 
                    ? 4 * t * t * t 
                    : 1 - Math.pow(-2 * t + 2, 3) / 2
                }
                
                const animateScroll = (currentTime: number) => {
                  const elapsed = currentTime - startTime
                  const progress = Math.min(elapsed / 300, 1) // 300ms duration
                  const easedProgress = easeInOutCustom(progress)
                  
                  scrollContainer.scrollTop = startScrollTop + (scrollDistance * easedProgress)
                  
                  if (progress < 1) {
                    requestAnimationFrame(animateScroll)
                  } else {
                    ;(scrollContainer as HTMLElement).style.scrollBehavior = originalTransition
                  }
                }
                
                requestAnimationFrame(animateScroll)
              }
              
              // Add highlight effect to input
              const originalBorder = inputElement.style.border
              inputElement.style.border = '2px solid #0066cc'
              inputElement.style.boxShadow = '0 0 5px rgba(0, 102, 204, 0.5)'
              
              setTimeout(() => {
                inputElement.style.border = originalBorder
                inputElement.style.boxShadow = ''
              }, 1000)
            } else {
              console.log(`❌ Input element not found for: ${layer.id}`)
            }
          }

          // Add event listeners
          textEl.addEventListener('click', clickListener)
          textEl.addEventListener('mouseenter', mouseEnterListener)
          textEl.addEventListener('mouseleave', mouseLeaveListener)
          
          // Make sure text elements have pointer cursor
          textEl.setAttribute('style', `${textEl.getAttribute('style') || ''} cursor: pointer;`)

          // Store listeners for cleanup
          clickListenersRef.current.push(
            { element: textEl, listener: clickListener, type: 'click' },
            { element: textEl, listener: mouseEnterListener, type: 'mouseenter' },
            { element: textEl, listener: mouseLeaveListener, type: 'mouseleave' }
          )
        })
      })

      console.log(`🎉 Made ${textGroups.length} text groups interactive`)
    }, 800)
  }

  return (
    <div className={`editor-container ${className || ''}`}>
      {/* Left Column - Sticky Animation Preview */}
      <div className="animation-column">
        <div className="animation-container" style={{
          backgroundColor: showBackground ? '#f0f0f0' : 'transparent',
          transition: 'background-color 0.3s ease'
        }}>
          <div 
            ref={containerRef}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        
        {/* Player Controls */}
        {isLoaded && (
          <div style={{
            marginTop: '16px',
            width: '100%'
          }}>
            {/* Play/Pause and Loop Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={togglePlayPause}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#22c55e'
                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5'
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="6" y="4" width="4" height="16" fill="currentColor"/>
                      <rect x="14" y="4" width="4" height="16" fill="currentColor"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                    </svg>
                  )}
                </button>
                
                <button
                  onClick={toggleBackground}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'white',
                    border: '2px solid #e5e5e5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#22c55e'
                    e.currentTarget.style.backgroundColor = '#f0fdf4'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e5e5'
                    e.currentTarget.style.backgroundColor = 'white'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor"/>
                  </svg>
                </button>
              </div>
              
              {/* Loop Toggle Switch */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Loop</span>
                <div
                  onClick={toggleLoop}
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: loop ? '#22c55e' : '#e5e5e5',
                    borderRadius: '12px',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: loop ? '26px' : '2px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Timeline Scrubber */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                position: 'relative',
                height: '6px',
                backgroundColor: '#e5e5e5',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                    transition: duration ? 'none' : 'width 0.1s ease'
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => {
                    const newTime = Number(e.target.value)
                    handleTimelineChange(newTime)
                    setCurrentTime(newTime) // Update immediately for smooth scrubbing
                  }}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: 0,
                    width: '100%',
                    height: '22px',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${duration ? (currentTime / duration) * 100 : 0}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
            
            {/* Speed Control */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>Speed:</span>
                <span style={{ fontSize: '14px', color: '#333', fontWeight: '600' }}>{speed}x</span>
              </div>
              <div style={{
                position: 'relative',
                height: '6px',
                backgroundColor: '#e5e5e5',
                borderRadius: '3px',
                cursor: 'pointer'
              }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    height: '100%',
                    width: `${((speed - 0.1) / (3 - 0.1)) * 100}%`,
                    backgroundColor: '#22c55e',
                    borderRadius: '3px',
                    transition: 'width 0.1s ease'
                  }}
                />
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={speed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  style={{
                    position: 'absolute',
                    top: '-8px',
                    left: 0,
                    width: '100%',
                    height: '22px',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    left: `${((speed - 0.1) / (3 - 0.1)) * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    pointerEvents: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        )}
        
        {isLoaded && textLayers.length > 0 && (
            <div style={{
              color: 'black',
              fontSize: '12px',
              zIndex: 10,
              marginTop: '16px',
              pointerEvents: 'none'
            }}>
              💡 Click on text in the animation to focus inputs
            </div>
          )}
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