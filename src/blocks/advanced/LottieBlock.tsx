import React from 'react'
import Lottie from 'lottie-react'

export function LottieBlock({ props }: { props: Record<string, any> }) {
  const { animationUrl, height = '300px', loop = true, autoplay = true } = props

  // Fallback animation if none provided (a simple bouncing ball or loader would go here, 
  // but since we fetch from URL, we need a valid lottie json).
  // For safety, we just show a placeholder if no URL is provided.
  if (!animationUrl) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center bg-secondary/50 rounded-xl border border-dashed border-border text-muted-foreground"
      >
        <p className="text-sm">Lottie Animation (No URL provided)</p>
      </div>
    )
  }

  // Real implementation would fetch the JSON. 
  // lottie-react can take animationData (object) or path (string).
  // Note: Some versions of lottie-react prefer 'path' over 'animationUrl'.
  // We'll use a dynamic import/fetch approach, or just pass 'path' to Lottie.
  
  return (
    <div style={{ height }} className="w-full flex justify-center items-center">
      <Lottie
        path={animationUrl}
        loop={loop}
        autoplay={autoplay}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}
