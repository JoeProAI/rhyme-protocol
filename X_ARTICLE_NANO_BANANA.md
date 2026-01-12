# Building Nano Banana 🍌: The AI Image Editor That Understands You

**Level up your dev skills by building a natural language image editor with Google's Gemini 2.5 Flash Image (Nano Banana)**

I built **Nano Banana** - a production-ready image editor where you literally just tell it what you want: "Remove the background," "Add a sunset," "Make it watercolor style." The AI does the rest.

This isn't just another tutorial. It's a **challenge**. Can you build it in under 2 hours? Let's find out.

## 🎯 Your Mission

Build **Nano Banana** - an AI image editor featuring:
- 🗣️ Natural language image editing ("make it cyberpunk")
- 🎨 Drag-and-drop uploads
- 📸 Camera capture
- ⚡ Real-time processing
- 💾 Download functionality
- 📱 Mobile-responsive design

**Tech Stack:** Next.js 14, React 18, TypeScript, TailwindCSS, Google Gemini API

**Difficulty:** Intermediate  
**Time to Complete:** 1-2 hours  
**XP Gained:** 500 🏆

---

## 🥉 Level 1: Setup (100 XP)

**Quest:** Get your environment ready for Nano Banana

First, install the Google Generative AI SDK:

```bash
npm install @google/generative-ai
```

**Achievement Unlocked:** 🔑 Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey)

Add it to `.env.local`:

```env
GEMINI_API_KEY=your_api_key_here
```

---

## 🥈 Level 2: The Nano Banana Backend (150 XP)

**Quest:** Build the server-side API that powers image editing

**⚠️ Boss Fight:** This is where the magic happens. The Gemini API returns actual edited IMAGES, not just text.

Create the API route at `app/api/nano-banana/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: NextRequest) {
  try {
    const { prompt, imageData } = await request.json();
    
    // Validate inputs
    if (!prompt || !imageData) {
      return NextResponse.json(
        { error: 'Prompt and image data are required' },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-image',
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });

    // Convert base64 to Gemini format
    const imagePart = {
      inlineData: {
        data: imageData.split(',')[1],
        mimeType: imageData.split(';')[0].split(':')[1],
      },
    };

    // Call Gemini API
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const candidate = response.candidates?.[0];

    // Extract edited image
    const imageResponse = candidate.content?.parts?.[0]?.inlineData;
    if (imageResponse?.data && imageResponse?.mimeType) {
      const editedImageData = `data:${imageResponse.mimeType};base64,${imageResponse.data}`;
      return NextResponse.json({ 
        editedImage: editedImageData 
      });
    }

    throw new Error('No valid response from Gemini');

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to process image' },
      { status: 500 }
    );
  }
}
```

**Key points:**
- The API runs server-side, keeping your API key secure
- `gemini-2.5-flash-image` is the model that can edit images
- Response comes back as `inlineData` with base64 image
- We convert it to a data URL for easy display

**🎓 What You Learned:**
- ✅ Server-side API routes keep your API key secure
- ✅ `gemini-2.5-flash-image` (Nano Banana) can EDIT images, not just analyze
- ✅ Response comes back as `inlineData` with base64 image
- ✅ Convert to data URL for browser display

**Achievement Unlocked:** 🛡️ Secure Backend Master

---

## 🥇 Level 3: Image Optimization (100 XP)

**Quest:** Resize images to prevent timeouts and save tokens

Before sending images to the API, we need to resize them to prevent timeouts. Add this function to your component:

```typescript
const resizeImage = (base64Str: string, maxWidth = 2048, maxHeight = 2048): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate scaling
      if (width > maxWidth || height > maxHeight) {
        const scale = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * scale);
        height = Math.round(height * scale);
      }

      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      }
    };
    img.src = base64Str;
  });
};
```

**Pro Tip:** This maintains aspect ratio while ensuring images don't exceed 2048x2048 pixels. Larger images = slower processing + higher costs.

**Achievement Unlocked:** 🎨 Image Compression Expert

---

## 💎 Level 4: Build the Nano Banana UI (150 XP)

**Quest:** Create the frontend that users will interact with

**Mini-Boss:** Managing state for uploads, processing, and results

Create `components/apps/NanoBanana.tsx`:

```typescript
"use client";
import React, { useState, useRef } from 'react';

const NanoBanana = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

  const handleEdit = async () => {
    if (!originalImage || !prompt.trim()) {
      setError('Please upload an image and enter a prompt');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/nano-banana', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, imageData: originalImage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process image');
      }

      if (data.editedImage) {
        setEditedImage(data.editedImage);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">AI Image Editor</h1>
      
      {/* Upload */}
      {!originalImage && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg"
          >
            Upload Image
          </button>
        </div>
      )}

      {/* Images */}
      {originalImage && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-2">Original</h3>
            <img src={originalImage} alt="Original" className="w-full rounded" />
          </div>
          {editedImage && (
            <div>
              <h3 className="font-semibold mb-2">Edited</h3>
              <img src={editedImage} alt="Edited" className="w-full rounded" />
            </div>
          )}
        </div>
      )}

      {/* Editing */}
      {originalImage && (
        <div className="space-y-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe your edit..."
            className="w-full h-24 px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleEdit}
            disabled={isProcessing}
            className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:bg-gray-400"
          >
            {isProcessing ? 'Processing...' : 'Edit Image'}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default NanoBanana;
```

---

## 🎮 Bonus Challenges: Power-Ups for Your Nano Banana

**Optional:** Add these features to level up your app

### 🏅 Challenge 1: Drag & Drop (50 XP)

```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const resizedData = await resizeImage(event.target?.result as string);
      setOriginalImage(resizedData);
    };
    reader.readAsDataURL(file);
  }
};
```

### 🏅 Challenge 2: Download Power (50 XP)

```typescript
const downloadImage = () => {
  if (!editedImage) return;
  const link = document.createElement('a');
  link.href = editedImage;
  link.download = `nano-banana-${Date.now()}.jpg`;
  link.click();
};
```

### 🏅 Challenge 3: Quick Prompts Menu (50 XP)

```typescript
const examplePrompts = [
  "Remove the background",
  "Make it black and white", 
  "Add a sunset",
  "Make it cyberpunk",
  "Turn into watercolor painting"
];

// In your JSX:
<div className="flex gap-2">
  {examplePrompts.map((example, idx) => (
    <button
      key={idx}
      onClick={() => setPrompt(example)}
      className="px-3 py-1 bg-gray-200 rounded text-sm"
    >
      {example}
    </button>
  ))}
</div>
```

---

## 🚀 Final Boss: Deployment (100 XP)

**Quest:** Ship Nano Banana to production

### Step 1: Configure Environment

In Vercel or your deployment platform, add:
- `GEMINI_API_KEY` = your API key

### Step 2: Launch to Production

```bash
npm run build
vercel --prod
```

---

## 🐛 Debug Challenges: Common Boss Fights

**Enemy 1: Empty Response Ghost** 👻  
**Weakness:** Make sure you're extracting `inlineData` from the response, not calling `.text()`. Nano Banana returns IMAGES, not text!

**Enemy 2: Giant Image Monster** 🦖  
**Weakness:** Always use the `resizeImage()` function before sending to API. Max size: 2048x2048px.

**Enemy 3: CORS Dragon** 🐉  
**Weakness:** API routes must be in the same Next.js app. Server-side only!

**Achievement Unlocked:** 🛠️ Master Debugger

---

## 🎨 What Nano Banana Can Do

**The possibilities are endless:**
- 🗑️ Remove backgrounds ("remove the background")
- 🎭 Change styles ("make it cyberpunk", "turn into watercolor")
- ➕ Add/remove objects ("add sunglasses", "remove the person")
- 🌈 Adjust colors ("make it black and white", "add sunset lighting")
- 🎲 Generate variations ("show me 3 different styles")
- 🖼️ Apply filters ("make it look like a painting")

**Pro Challenge:** See how creative you can get with your prompts!

---

## 🏆 Victory Screen: You Built Nano Banana!

**🎉 QUEST COMPLETE! 🎉**

You now have a production-ready Nano Banana editor that:
- ✅ Edits images with natural language
- ✅ Works on mobile and desktop
- ✅ Processes images securely server-side
- ✅ Handles errors gracefully
- ✅ Provides instant visual feedback

**Total XP Earned:** 500 🏆  
**Achievement Unlocked:** 🍌 Nano Banana Master Builder

**Live demo:** https://joepro.ai  
**Full code:** https://github.com/JoeProAI/JoeProAI

---

## 🎯 New Game+: Advanced Challenges

**Want to keep leveling up?**

1. 🕰️ **Image History System** (+100 XP) - Undo/redo functionality
2. 📦 **Batch Mode** (+150 XP) - Process multiple images at once
3. 🎨 **Custom Styles** (+200 XP) - Save favorite prompts
4. ⚡ **Real-time Preview** (+250 XP) - Show edits as they process
5. 🌐 **Social Sharing** (+100 XP) - Share creations on social media
6. 🖼️ **User Galleries** (+300 XP) - Save and showcase edits

**Secret Boss:** 🎪 Fine-tune your own custom Gemini model (+500 XP)

---

## 💪 The Nano Banana Power

The **Gemini 2.5 Flash Image (Nano Banana)** model is ridiculously powerful:
- ⚡ Fast: 2-5 seconds per edit
- 💰 Affordable: Free tier + pay-as-you-go
- 🧠 Smart: Understands complex natural language
- 🎨 Creative: Can interpret artistic requests
- 🔄 Versatile: Edit, generate, analyze

**Challenge:** See how wild you can get with prompts. Tag me with your craziest Nano Banana edits!

---

## 📊 Final Stats

**Built with:** Next.js 14, React 18, TypeScript, TailwindCSS, Google Gemini API  
**Lines of Code:** ~300  
**Time Investment:** 1-2 hours  
**Fun Factor:** 🍌🍌🍌🍌🍌 (5/5 bananas)  
**Cost:** Free tier available, then $0.00015 per image  
**Performance:** ~2-5 seconds per edit

---

**GG! You built Nano Banana. What will you create with it?** 🍌✨

Drop your questions, share your builds, or show off your wildest edits below! 👇