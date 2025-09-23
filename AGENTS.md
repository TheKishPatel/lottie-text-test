# Agent Instructions for Flutter Port

## Project Overview

This is a **Lottie Text Editor** that allows real-time editing of text content and fonts within Lottie animations. The current implementation is a Next.js web app, and we need a Flutter mobile app version.

## What the App Does

### Core Functionality
1. **Loads Lottie Animation**: Displays a Lottie animation with text layers
2. **Real-time Text Editing**: Users can edit text content on-the-fly 
3. **Font Selection**: Users can change fonts from a dropdown
4. **Multiple Text Layers**: Supports editing multiple text layers independently (currently Title and Subtitle)
5. **Live Preview**: Changes are applied immediately to the animation

### Current Features
- ✅ **Dual Text Layer Support**: Edit both "Title" and "Subtitle" layers
- ✅ **Unlimited Characters**: Any text input works (solved character limitation issue)
- ✅ **Font Changes**: Multiple font options with real-time switching
- ✅ **Black Text**: All text displays in black color
- ✅ **Slower Animation**: Runs at 20% speed for better readability
- ✅ **Responsive UI**: Clean, organized interface with separate controls

## Technical Requirements for Flutter Version

### Essential Dependencies
```yaml
dependencies:
  flutter:
    sdk: flutter
  lottie: ^3.1.2  # Flutter Lottie player
  http: ^1.1.0    # For loading JSON files
```

### Core Implementation Requirements

#### 1. Lottie Animation Data Structure
The app works with Lottie JSON files that have this structure:
```json
{
  "layers": [
    {
      "nm": "Title",      // Layer name
      "t": {
        "d": {
          "k": [
            {
              "s": {
                "t": "Title",                    // Text content
                "f": "Season-SansRegular",       // Font name  
                "fc": [0, 0, 0]                 // Text color (black)
              }
            }
          ]
        }
      }
    },
    {
      "nm": "Subtitle",   // Second layer
      "t": { /* same structure */ }
    }
  ]
}
```

#### 2. Critical Implementation Details

**Text Update Method** (This is crucial - the web version struggled with this):
1. **Load original Lottie JSON** from assets or network
2. **Find layers by name** (`layer.nm == "Title"` or `layer.nm == "Subtitle"`)  
3. **Update text data BEFORE creating animation**: 
   - `layer.t.d.k[0].s.t = newText`
   - `layer.t.d.k[0].s.f = newFont` 
   - `layer.t.d.k[0].s.fc = [0, 0, 0]` (black color)
4. **Remove character validation**: Delete `chars` array if it exists
5. **Recreate animation** with modified data

**Font Management**:
- Update both the text layer font AND the fonts list
- Use standard font names: 'Arial', 'Helvetica', 'Times New Roman', etc.
- Ensure fonts are available on mobile platforms

#### 3. UI Requirements

**Layout Structure**:
```
AppBar: "Lottie Text Editor"

Title Section (Blue border):
- Text input for Title
- Font dropdown for Title

Subtitle Section (Green border):  
- Text input for Subtitle
- Font dropdown for Subtitle

Animation Preview:
- Lottie animation display
- Aspect ratio maintained
- Slower playback speed (0.2x)
```

**Design Specifications**:
- Use Card widgets for text control sections
- Color-coded sections (Blue for Title, Green for Subtitle)
- Responsive design for different screen sizes
- Loading indicator while animation loads

## Key Technical Challenges & Solutions

### Challenge 1: Character Limitations
**Problem**: Original Lottie files only support predefined characters
**Solution**: Remove/delete the `chars` array from animation data to bypass validation

### Challenge 2: Text Updates Not Applying  
**Problem**: Changes to text don't show in animation
**Solution**: Update animation data BEFORE creating the Lottie widget, not after

### Challenge 3: Font Changes Not Working
**Problem**: Font dropdown doesn't affect animation
**Solution**: Update both `layer.t.d.k[0].s.f` AND `fonts.list` array

### Challenge 4: Animation Speed
**Problem**: Animation too fast to read text
**Solution**: Use animation controller with slower speed (0.2x)

## Assets Required

### Lottie JSON File
- File: `lottie-text-test.json` (included in project)
- Contains 2 text layers: "Title" and "Subtitle"  
- Text animates with sliding motion
- No character shape restrictions (chars array removed)

### Font List
Provide these font options:
```dart
const availableFonts = [
  {'name': 'Season-SansRegular', 'display': 'Season Sans (Original)'},
  {'name': 'Arial', 'display': 'Arial'},
  {'name': 'Helvetica', 'display': 'Helvetica'},
  {'name': 'Times New Roman', 'display': 'Times New Roman'},
  {'name': 'Georgia', 'display': 'Georgia'},
  {'name': 'Impact', 'display': 'Impact'},
  {'name': 'serif', 'display': 'Serif'},
  {'name': 'sans-serif', 'display': 'Sans Serif'},
];
```

## Success Criteria

The Flutter app should:
1. ✅ Load and display the Lottie animation
2. ✅ Allow editing Title text in real-time
3. ✅ Allow editing Subtitle text independently  
4. ✅ Support font changes for both layers
5. ✅ Display all text in black color
6. ✅ Run animation at slower speed (20% of original)
7. ✅ Work with any text input (no character restrictions)
8. ✅ Have clean, intuitive UI similar to web version

## Existing Working Code Reference

The working web implementation is in:
- `src/components/DualTextLottieEditor.tsx` - Main component
- Shows exact data manipulation patterns that work
- Demonstrates proper layer finding and text updating
- Includes error handling and debugging

## Common Pitfalls to Avoid

1. **Don't modify animation after creation** - Update JSON data first
2. **Don't assume layer indices** - Find layers by name (`nm` property)
3. **Don't forget to remove chars array** - Causes character validation errors
4. **Don't skip font list updates** - Update both places fonts are referenced
5. **Don't use default animation speed** - Text scrolls too fast to read

The web version works perfectly - the Flutter version should achieve the same functionality with Flutter/Dart equivalents of the working patterns.