import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'

type Props = {
  onResult: (text: string) => void
  className?: string
}

export function VoiceMicButton({ onResult, className = '' }: Props) {
  const [listening, setListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.continuous = false

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript
      onResult(transcript)
      setListening(false)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recognitionRef.current = recognition
  }, [onResult])

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!recognitionRef.current) {
      alert('Speech recognition not supported in this browser.')
      return
    }

    if (listening) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
    }
    setListening(!listening)
  }

  return (
    <button
      onClick={toggle}
      className={`p-1.5 rounded-full transition ${
        listening
          ? 'bg-orange-600 text-white animate-pulse'
          : 'text-slate-400 hover:text-orange-600'
      } ${className}`}
      title="Voice input"
    >
      {listening ? <MicOff size={14} /> : <Mic size={14} />}
    </button>
  )
}
