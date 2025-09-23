# Claude Configuration for Lottie Text Editor Project

## Commands

### Development
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production (required before deployment)
- `npm run lint` - Run ESLint
- `npm run start` - Start production server

### Project Management
- `cp lottie-text-test.json public/` - Copy updated Lottie file to public directory (required when JSON changes)
- `rm -rf .next` - Clear Next.js cache (useful when build issues occur)

## Project Structure

```
├── public/
│   └── lottie-text-test.json       # Lottie animation file (served by Next.js)
├── src/
│   ├── app/
│   │   ├── page.tsx                # Main page component
│   │   ├── layout.tsx              # Root layout
│   │   └── globals.css             # Global styles
│   └── components/
│       └── DualTextLottieEditor.tsx # Main working component
├── lottie-text-test.json           # Source Lottie file (copy to public/ when updated)
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── next.config.js                  # Next.js configuration
```

## Key Files

### Primary Component
- **`src/components/DualTextLottieEditor.tsx`** - The main working component that handles:
  - Loading Lottie animation
  - Dual text layer editing (Title & Subtitle)
  - Font selection and updates
  - Real-time text changes
  - Animation speed control

### Lottie Data File
- **`public/lottie-text-test.json`** - The animation file containing:
  - 2 text layers: "Title" and "Subtitle" 
  - Text animation with sliding motion
  - No character restrictions (chars array removed)
  - Black text color settings

## Important Notes

### File Synchronization
When the root `lottie-text-test.json` is updated, you MUST copy it to `public/`:
```bash
cp lottie-text-test.json public/lottie-text-test.json
```
This is required because Next.js serves files from the `public/` directory.

### Build Requirements
- Always run `npm run build` to test production build before deployment
- Clean `.next` cache if build issues occur
- All TypeScript errors must be resolved for successful deployment

### Dependencies
```json
{
  "lottie-web": "^5.13.0",    # Core Lottie animation library
  "next": "15.5.2",           # Next.js framework
  "react": "^18",             # React
  "typescript": "^5"          # TypeScript
}
```

## Technical Implementation Details

### Text Update Pattern (Critical)
The working implementation follows this exact pattern:

1. **Load original JSON** from `/lottie-text-test.json`
2. **Find layers by name** using `layer.nm === 'Title'` or `layer.nm === 'Subtitle'`
3. **Update text data BEFORE animation creation**:
   ```javascript
   layer.t.d.k[0].s.t = newText        // Text content
   layer.t.d.k[0].s.f = newFont        // Font name
   layer.t.d.k[0].s.fc = [0, 0, 0]     // Black color
   ```
4. **Remove character restrictions**: `delete data.chars`
5. **Create animation** with modified data
6. **Set slower speed**: `animation.setSpeed(0.2)`

### Font Management
```javascript
// Update font in both locations:
// 1. Text layer font
layer.t.d.k[0].s.f = fontName

// 2. Animation fonts list  
animationData.fonts.list = [{
  fName: fontName,
  fFamily: fontName.split(',')[0].trim(),
  fStyle: 'Regular',
  ascent: 73.0987548828125
}]
```

## Troubleshooting

### Common Issues

1. **"ChangeMe" shows instead of Title/Subtitle**
   - Issue: Using old cached Lottie file
   - Fix: Copy updated JSON to public directory, hard refresh browser

2. **Text changes don't apply**
   - Issue: Modifying animation after creation
   - Fix: Update JSON data BEFORE creating lottie animation

3. **Character not displaying (missing character error)**
   - Issue: Lottie character validation
   - Fix: Remove `chars` array from animation data

4. **Font changes don't work** 
   - Issue: Only updating text layer, not fonts list
   - Fix: Update both layer font AND animation fonts list

5. **Build fails on Vercel**
   - Issue: TypeScript errors in unused components
   - Fix: Remove unused components, ensure clean build with `npm run build`

### Performance Notes
- Animation speed set to 20% (0.2) for readability
- Text color forced to black [0, 0, 0] for visibility
- SVG renderer used for better text quality
- Component re-renders only when text/font state changes

## Working State
- ✅ Dual text editing (Title & Subtitle)
- ✅ Font selection working
- ✅ Unlimited character input  
- ✅ Real-time preview
- ✅ Production build successful
- ✅ Vercel deployment ready