"use client";

import React, { useState, useRef } from 'react';

const NanoBanana = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Quick example prompts
  const examplePrompts = [
    "Remove the background",
    "Make it black and white",
    "Add a sunset",
    "Change to watercolor style",
    "Enhance colors",
    "Remove unwanted objects"
  ];

  // Resize and compress image to handle various sizes
  const resizeImage = (base64Str: string, maxWidth: number = 2048, maxHeight: number = 2048): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Only resize if image exceeds max dimensions
        if (width > maxWidth || height > maxHeight) {
          // Calculate scaling factor to fit within max dimensions while maintaining aspect ratio
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const scale = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Use JPEG with 0.85 quality for good balance of size/quality
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = base64Str;
    });
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const originalData = event.target?.result as string;
        // Resize image to handle large uploads
        const resizedData = await resizeImage(originalData);
        setOriginalImage(resizedData);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error(err);
    }
  };

  // Capture photo from camera
  const capturePhoto = async () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg');
        // Resize camera capture as well
        const resizedData = await resizeImage(imageData);
        setOriginalImage(resizedData);
        setEditedImage(null);
        stopCamera();
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Download edited image
  const downloadImage = () => {
    if (!editedImage) return;
    const link = document.createElement('a');
    link.href = editedImage;
    link.download = `nano-banana-edit-${Date.now()}.jpg`;
    link.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const originalData = event.target?.result as string;
        const resizedData = await resizeImage(originalData);
        setOriginalImage(resizedData);
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  // Edit image with natural language
  const handleEdit = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setAiSuggestion(null);

    try {
      console.log('Sending request to API...');
      const response = await fetch('/api/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          imageData: originalImage,
        }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      console.log('Data keys:', Object.keys(data));

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      // Check if we got an edited image back
      if (data.editedImage) {
        console.log('Received edited image!');
        setEditedImage(data.editedImage);
        setAiSuggestion('✨ Image edited successfully!');
        setError(null);
      } 
      // Or if we got a text analysis
      else if (data.result && data.result.trim()) {
        console.log('Received analysis:', data.result);
        setAiSuggestion(data.result);
        setError(null);
      } 
      else {
        throw new Error('No valid response from AI');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze image. Make sure GEMINI_API_KEY is configured.');
      setAiSuggestion(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 w-full h-full p-3 sm:p-4 md:p-6 bg-gradient-to-br from-yellow-900/10 to-orange-900/10 border border-yellow-400/30 rounded-xl">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3">
        <span className="text-3xl md:text-4xl">🍌</span>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-yellow-400">Nano Banana Editor</h2>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">AI-powered image editing with natural language</p>
        </div>
      </div>

      {/* Upload/Camera Section */}
      {!originalImage && !isCameraActive && (
        <div className="flex flex-col gap-4">
          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-4 md:p-8 text-center transition-all ${
              isDragging 
                ? 'border-yellow-400 bg-yellow-500/20' 
                : 'border-yellow-400/30 bg-yellow-500/5 hover:bg-yellow-500/10'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl md:text-4xl">🍌</div>
              <p className="text-sm md:text-base text-yellow-400 font-semibold">
                {isDragging ? 'Drop image here!' : 'Drag & drop image'}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">or tap buttons below</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-3 md:px-6 md:py-4 bg-yellow-500/20 active:bg-yellow-500/40 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg transition-all text-yellow-400 font-semibold text-sm md:text-base touch-manipulation"
            >
              📁 <span className="hidden sm:inline">Upload</span> Image
            </button>
            <button
              onClick={startCamera}
              className="px-4 py-3 md:px-6 md:py-4 bg-yellow-500/20 active:bg-yellow-500/40 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg transition-all text-yellow-400 font-semibold text-sm md:text-base touch-manipulation"
            >
              📸 <span className="hidden sm:inline">Take</span> Photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Camera View */}
      {isCameraActive && (
        <div className="flex flex-col gap-4">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-lg border border-yellow-400/30"
          />
          <div className="flex gap-3 md:gap-4">
            <button
              onClick={capturePhoto}
              className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-yellow-500 active:bg-yellow-700 hover:bg-yellow-600 rounded-lg transition-all text-black font-semibold text-sm md:text-base touch-manipulation"
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-4 py-3 md:px-6 md:py-4 bg-red-500/20 active:bg-red-500/40 hover:bg-red-500/30 border border-red-400/50 rounded-lg transition-all text-red-400 font-semibold text-sm md:text-base touch-manipulation"
            >
              ✕ Cancel
            </button>
          </div>
        </div>
      )}

      {/* Image Display */}
      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-sm md:text-base font-semibold text-yellow-400">Original</h3>
            <img 
              src={originalImage} 
              alt="Original" 
              className="w-full max-h-64 md:max-h-96 object-contain rounded-lg border border-yellow-400/30 bg-black/30"
            />
          </div>
          {editedImage && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm md:text-base font-semibold text-yellow-400">✨ Edited Result</h3>
                <button
                  onClick={downloadImage}
                  className="px-3 py-2 md:px-4 md:py-2 bg-green-500/20 active:bg-green-500/40 hover:bg-green-500/30 border border-green-400/50 rounded text-green-400 text-xs md:text-sm font-semibold transition-all touch-manipulation"
                >
                  ⬇️ Save
                </button>
              </div>
              <img 
                src={editedImage} 
                alt="Edited" 
                className="w-full max-h-64 md:max-h-96 object-contain rounded-lg border border-green-400/50 bg-black/30 ring-2 ring-green-500/20"
                onError={(e) => {
                  console.error('Edited image failed to load');
                  setError('Edited image failed to load. Please try again.');
                  setEditedImage(null);
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Edit Prompt */}
      {originalImage && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm md:text-base font-semibold text-yellow-400">
              Describe your edit
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Try: 'Remove background', 'Add sunset', 'Make black and white'"
              className="w-full h-24 md:h-28 px-3 py-2 md:px-4 md:py-3 bg-black/50 border border-yellow-400/30 rounded-lg text-white text-sm md:text-base placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none touch-manipulation"
            />
            
            {/* Quick Example Prompts */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 w-full sm:w-auto">Quick:</span>
              {examplePrompts.map((example, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(example)}
                  className="px-2 py-1 md:px-3 md:py-1.5 bg-yellow-500/10 active:bg-yellow-500/30 hover:bg-yellow-500/20 border border-yellow-400/30 rounded text-yellow-400 text-xs md:text-sm transition-all touch-manipulation"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <button
              onClick={handleEdit}
              disabled={isProcessing || !prompt.trim()}
              className={`flex-1 px-4 py-3 md:px-6 md:py-4 rounded-lg transition-all font-semibold text-sm md:text-base flex items-center justify-center gap-2 touch-manipulation ${
                isProcessing || !prompt.trim()
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-500 active:bg-yellow-700 hover:bg-yellow-600 text-black'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 md:w-5 md:h-5 border-3 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Processing...</span>
                  <span className="sm:hidden">Processing...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span className="hidden sm:inline">Edit with AI</span>
                  <span className="sm:hidden">Edit</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setOriginalImage(null);
                setEditedImage(null);
                setPrompt('');
                setError(null);
                setAiSuggestion(null);
              }}
              className="px-4 py-3 md:px-6 md:py-4 bg-red-500/20 active:bg-red-500/40 hover:bg-red-500/30 border border-red-400/50 rounded-lg transition-all text-red-400 font-semibold text-sm md:text-base touch-manipulation"
            >
              🗑️ Reset
            </button>
          </div>
        </div>
      )}

      {/* AI Suggestions Display */}
      {aiSuggestion && (
        <div className="p-3 md:p-4 bg-green-500/20 border border-green-400/50 rounded-lg text-green-400 text-xs md:text-sm">
          <p className="font-semibold mb-1 md:mb-2">✨ Result:</p>
          <p className="whitespace-pre-wrap">{aiSuggestion}</p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-3 md:p-4 bg-red-500/20 border border-red-400/50 rounded-lg text-red-400 text-xs md:text-sm">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="p-3 md:p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg text-xs md:text-sm text-gray-700 dark:text-gray-400">
        <div className="mb-3 p-3 bg-green-500/20 border border-green-400/50 rounded">
          <p className="text-green-700 dark:text-green-300 font-bold flex items-center gap-2">
            <span className="text-lg">✅</span>
            <span>Powered by Nano Banana (Gemini 2.5 Flash Image)</span>
          </p>
          <p className="mt-2 text-green-800 dark:text-green-200/80">This powerful AI model can EDIT and GENERATE images with natural language! Just describe what you want!</p>
        </div>
        
        <p className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">🍌 What You Can Do:</p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Edit Images:</strong> "Remove the background", "Change sky to purple", "Add sunglasses"</li>
          <li><strong>Analyze Images:</strong> "What's in this image?", "Describe the scene"</li>
          <li><strong>Get Suggestions:</strong> "How can I improve this photo?"</li>
          <li><strong>Style Transfer:</strong> "Make it look like a painting"</li>
        </ul>
      </div>
    </div>
  );
};

export default NanoBanana;
