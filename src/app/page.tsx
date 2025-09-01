import DualTextLottieEditor from '@/components/DualTextLottieEditor'

export default function Home() {
  return (
    <main>
      <div className="container">
        <header className="header">
          <h1 className="title">
            Lottie Text Editor
          </h1>
          <p className="subtitle">
            Edit both Title and Subtitle layers!!!
          </p>
        </header>
        
        <DualTextLottieEditor />
      </div>
    </main>
  )
}