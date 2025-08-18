"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QrCode, Camera, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import jsQR from 'jsqr'

interface QRScannerProps {
  onScan: (data: string) => void
  onError: (error: string) => void
  isScanning: boolean
  onToggleScanning: () => void
}

export default function QRScanner({ onScan, onError, isScanning, onToggleScanning }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [error, setError] = useState<string>('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => {
    if (isScanning && !scanning) {
      startScanning()
    } else if (!isScanning && scanning) {
      stopScanning()
    }
  }, [isScanning])

  const startScanning = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setScanning(true)
        
        // Start scanning loop
        scanLoop()
      }
    } catch (err) {
      setError('Failed to access camera. Please ensure camera permissions are granted.')
      onError('Camera access failed')
    }
  }

  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }

  const scanLoop = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context) return

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Get image data for QR code detection
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

    // Use jsQR library for QR code detection
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        // QR code found
        onScan(code.data)
        stopScanning()
        return
      }
    } catch (err) {
      // QR code detection failed, continue scanning
    }

    // Continue scanning
    requestAnimationFrame(scanLoop)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          QR Code Scanner
        </CardTitle>
        <CardDescription>
          Scan the QR code to mark your attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-64 bg-gray-900 rounded-lg ${
              scanning ? 'block' : 'hidden'
            }`}
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{ display: 'none' }}
          />
          
          {!scanning && (
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Camera not active</p>
              </div>
            </div>
          )}
          
          {scanning && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="bg-blue-500 text-white">
                  Scanning...
                </Badge>
              </div>
            </div>
          )}
        </div>
        
        <Button 
          onClick={onToggleScanning} 
          className="w-full"
          variant={scanning ? "destructive" : "default"}
        >
          {scanning ? (
            <>
              <XCircle className="w-4 h-4 mr-2" />
              Stop Scanning
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </>
          )}
        </Button>
        
        <div className="text-xs text-gray-500 text-center">
          Position the QR code within the frame to scan
        </div>
      </CardContent>
    </Card>
  )
}
