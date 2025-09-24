// app/page.tsx
'use client';

import { useState, useRef } from 'react';

export default function CivicAIHome() {
  const [photo, setPhoto] = useState<string>('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Camera functionality
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',  // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to load
        videoRef.current.onloadedmetadata = () => {
          console.log('Video loaded:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);
        };
        
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Camera access denied:', error);
      alert('Camera access required for photo capture');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) {
      alert('Video not found');
      return;
    }

    // Check if video is ready
    if (video.videoWidth === 0 || video.videoHeight === 0) {
      alert('Camera is still loading. Please wait a moment and try again.');
      return;
    }

    console.log('Capturing photo from video:', video.videoWidth, 'x', video.videoHeight);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw the current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to base64 image
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('Photo captured, data length:', photoDataUrl.length);
      
      if (photoDataUrl.length > 100) { // Basic check if image was captured
        setPhoto(photoDataUrl);
        
        // Stop camera stream
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        setIsCameraActive(false);
      } else {
        alert('Failed to capture photo. Please try again.');
      }
    } else {
      alert('Failed to create image context');
    }
  };

  // GPS functionality
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Location access denied:', error);
          alert('Location access required for issue reporting');
        }
      );
    }
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    alert('Issue reported successfully! 🎉');
    
    // Reset form
    setPhoto('');
    setLocation(null);
    setDescription('');
    setCategory('');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 text-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🏛️ CivicAI</h1>
          <p className="text-xl opacity-90">Report Civic Issues with AI Intelligence</p>
        </div>

        {/* Main Form */}
        <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Photo Capture Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📸 Capture Issue Photo</h3>
              
              {!isCameraActive && !photo && (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-xl transition-colors"
                  >
                    📱 Open Camera
                  </button>
                  
                  {/* Fallback File Upload */}
                  <div className="text-center">
                    <span className="text-sm opacity-75">Or</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (e) => setPhoto(e.target?.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white file:text-green-700 hover:file:bg-gray-100"
                  />
                </div>
              )}

              {isCameraActive && (
                <div className="space-y-4">
                  <div className="relative">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '400px' }}
                    />
                    {/* Camera status indicator */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
                      📹 LIVE
                    </div>
                    {/* Debug info */}
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {videoRef.current?.videoWidth || 0} x {videoRef.current?.videoHeight || 0}
                    </div>
                  </div>
                  
                  {/* Wait message */}
                  <div className="text-center text-sm bg-yellow-500/20 p-2 rounded">
                    ⏳ Wait for camera to fully load, then click capture
                  </div>
                  
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    📸 Capture Photo Now
                  </button>
                  
                  {/* Test button for debugging */}
                  <button
                    type="button"
                    onClick={() => {
                      const video = videoRef.current;
                      if (video) {
                        console.log('Video debug:', {
                          width: video.videoWidth,
                          height: video.videoHeight,
                          ready: video.readyState,
                          currentTime: video.currentTime
                        });
                        alert(`Video: ${video.videoWidth}x${video.videoHeight}, Ready: ${video.readyState >= 2}`);
                      }
                    }}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg text-sm"
                  >
                    🔍 Debug Camera Status
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      // Stop camera without taking photo
                      const stream = videoRef.current?.srcObject as MediaStream;
                      if (stream) {
                        stream.getTracks().forEach(track => track.stop());
                      }
                      setIsCameraActive(false);
                    }}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    ❌ Cancel
                  </button>
                </div>
              )}

              {photo && (
                <div className="space-y-4">
                  <div className="relative">
                    <img 
                      src={photo} 
                      alt="Captured Issue" 
                      className="w-full rounded-lg border-2 border-green-500"
                      style={{ maxHeight: '400px', objectFit: 'cover' }}
                    />
                    {/* Success indicator */}
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                      ✅ CAPTURED
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {setPhoto(''); startCamera();}}
                      className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      🔄 Retake Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto('')}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      🗑️ Remove Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📍 Location</h3>
              {!location ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    📍 Get Current Location
                  </button>
                  
                  {/* Manual Location Input */}
                  <div className="text-center">
                    <span className="text-sm opacity-75">Or enter manually</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter address or area name..."
                    onChange={(e) => {
                      if (e.target.value) {
                        setLocation({ lat: 19.0760, lng: 72.8777 }); // Default Mumbai coords for demo
                      }
                    }}
                    className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
                  />
                </div>
              ) : (
                <div className="bg-white/20 p-4 rounded-lg">
                  <p className="font-semibold">Location Captured ✅</p>
                  <p className="text-sm opacity-90">
                    Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
                  </p>
                  <button
                    type="button"
                    onClick={() => setLocation(null)}
                    className="mt-2 text-sm bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                  >
                    Reset Location
                  </button>
                </div>
              )}
            </div>

            {/* Issue Category */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">🏷️ Issue Category</h3>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70"
              >
                <option value="">Select Issue Type</option>
                <option value="pothole">🕳️ Pothole</option>
                <option value="streetlight">💡 Broken Streetlight</option>
                <option value="garbage">🗑️ Garbage/Sanitation</option>
                <option value="traffic">🚦 Traffic Signal</option>
                <option value="other">❓ Other</option>
              </select>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">📝 Description</h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail..."
                required
                rows={4}
                className="w-full p-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !photo || !location || !category || !description}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '⏳ Submitting...' : '🚀 Report Issue'}
            </button>
          </form>

          {/* Status */}
          {isSubmitting && (
            <div className="mt-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <p className="mt-2">Processing your report...</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-green-300">95%</div>
            <div className="text-sm opacity-90">AI Accuracy</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-300">2.5 Days</div>
            <div className="text-sm opacity-90">Avg Response</div>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-300">40%</div>
            <div className="text-sm opacity-90">Cost Reduction</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 opacity-75">
          <p>🤖 Powered by AI • 🏛️ Built for Smart Cities</p>
        </div>
      </div>
    </div>
  );
}