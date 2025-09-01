# Lottie Text Editor

A Next.js web application that allows you to edit text and font in Lottie animations using Airbnb's lottie-web library.

## Features

- Load and render Lottie animations
- Edit text content in real-time
- Change font family
- Live preview of changes

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. The application loads the `lottie-text-test.json` file automatically
2. Use the text input field to change the displayed text (default: "ChangeMe")
3. Use the font dropdown to select different fonts
4. The animation will update in real-time as you make changes

## Technical Details

- Built with Next.js 15 and TypeScript
- Uses lottie-web for animation rendering
- Styled with custom CSS
- Dynamically modifies Lottie animation data to update text and fonts

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page
│   └── globals.css         # Global styles
└── components/
    └── LottieTextEditor.tsx # Main Lottie component

public/
└── lottie-text-test.json   # Lottie animation file
```