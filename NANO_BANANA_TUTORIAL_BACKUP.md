# Building an AI-Powered Image Editor with Google's Gemini 2.5 Flash Image

## A Complete Implementation Guide

This tutorial demonstrates how to build a production-ready image editor powered by Google's Gemini 2.5 Flash Image model (Nano Banana). The model enables natural language image editing, allowing users to modify images through text prompts such as "Remove the background" or "Convert to watercolor style."

This guide provides complete, copy-paste ready code for both frontend and backend implementation, suitable for integration into existing Next.js applications or as a standalone feature.

---

## 🎮 What You'll Build

**Nano Banana Image Editor** - A sleek, powerful AI image editor featuring:

✅ **Natural Language Editing** - "Remove the boot", "Change background to beach", "Make it black and white"  
✅ **Drag & Drop Upload** - Just drag your images in  
✅ **Camera Capture** - Take photos directly in the app  
✅ **Quick Prompts** - One-click access to common edits  
✅ **Download Edited Images** - Save your creations instantly  
✅ **Smart Resizing** - Handles any image size while preserving quality  
✅ **Animated Loading** - Professional spinner during processing  
✅ **Before/After View** - Compare original and edited side-by-side

---

## 🚀 Prerequisites

Before we start, make sure you have:

- **Next.js project** (App Router) - `npx create-next-app@latest`
- **TailwindCSS** - Usually included with Next.js
- **Google AI API Key** - Free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- **Node.js 18+** - For running the project

**Install the Google AI SDK:**
```bash
npm install @google/generative-ai
```

---

## 📁 Project Structure

You'll create two main files:

```
your-project/
├── app/
│   └── api/
│       └── nano-banana/
│           └── route.ts          # Backend API endpoint
└── components/
    └── apps/
        └── NanoBanana.tsx         # Frontend React component
```

---

## 🔧 Part 1: Setting Up the API (Backend)

### Step 1: Create the API Route

Create `app/api/nano-banana/route.ts`

This file handles:
- Receiving image data and edit prompts from the frontend
- Calling Google's Gemini API with the Nano Banana model
- Extracting the edited image from the response
- Returning it to the frontend

### Key Concepts to Understand:

**Why Nano Banana is Special:**
- Most AI models return TEXT responses
- Nano Banana returns ACTUAL EDITED IMAGES
- We extract the image from `response.candidates[0].content.parts[0].inlineData`

**The API Flow:**
1. Receive prompt + base64 image from frontend
2. Convert image to Gemini's expected format
3. Call Nano Banana model
4. Extract edited image from response
5. Return as base64 data URL

### 🎯 Pro Tip for LLM Users:
Copy the structure below and tell your LLM: "Create a Next.js API route that calls Google's Gemini 2.5 Flash Image model, handles image input/output, and includes proper error handling"

---

## 🎨 Part 2: Building the Frontend (React Component)

### Step 2: Create the Main Component

Create `components/apps/NanoBanana.tsx`

This component handles:
- **Multiple upload methods**: File picker, drag-and-drop, camera
- **Smart image resizing**: Maintains aspect ratio, prevents API failures
- **UI/UX polish**: Loading states, error handling, quick prompts
- **Result display**: Before/after comparison, download functionality

### Key Features Breakdown:

#### 🖼️ Image Resizing Logic
```
Why we need it:
- Large images = API failures
- Must maintain aspect ratio
- Should preserve quality

How it works:
1. Check if image exceeds 2048x2048
2. Calculate scale factor (use Math.min for both dimensions)
3. Resize with canvas
4. Compress to JPEG at 0.85 quality
```

#### 📤 Drag & Drop Upload
```
User experience:
- Drag image anywhere in drop zone
- Visual feedback (yellow highlight)
- Instant upload on drop
```

#### ⚡ Quick Example Prompts
```
Why they're useful:
- Users don't know what prompts work
- Reduces friction
- Shows capabilities instantly

Examples:
- "Remove the background"
- "Make it black and white"
- "Add a sunset"
- "Change to watercolor style"
```

#### 🔄 Processing Flow
```
1. User uploads image → Store in state
2. User enters/selects prompt
3. Click "Edit with Nano Banana"
4. Show animated spinner
5. API processes with Gemini
6. Display edited image with download button
```

---

## 🎯 Part 3: The Complete Implementation

### Copy-Paste Ready Code Sections

I've organized the code into logical sections. You can:
1. **Copy each section individually** and paste into your files
2. **Copy the entire tutorial** and paste into Claude/ChatGPT with: "Help me implement this Nano Banana image editor step by step"
3. **Ask your LLM**: "Explain section X in detail" or "Add feature Y to this"

---

## 🔑 Part 4: Environment Setup

### Step 3: Add Your API Key

Create `.env.local` in your project root:

```env
GEMINI_API_KEY=your_api_key_here
```

**Get Your Free API Key:**
1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env.local`

**Important:** 
- Never commit `.env.local` to git
- Add it to `.gitignore`
- Keep your API key secret

---

## 🎮 Part 5: LLM-Assisted Development Tips

### How to Use This Tutorial with AI Assistants

#### Strategy 1: Full Implementation
```
Prompt: "I want to build an AI image editor using Google's Nano Banana model. 
Here's the complete tutorial: [paste entire tutorial]. 
Help me implement this step-by-step, starting with the API route."
```

#### Strategy 2: Feature-by-Feature
```
Prompt: "Help me add drag-and-drop image upload to my React component. 
Here's the relevant section: [paste drag-drop section]"
```

#### Strategy 3: Debugging
```
Prompt: "My Nano Banana API is returning empty responses. 
Here's my code: [paste code]
And here's the expected flow: [paste API flow section]
What's wrong?"
```

#### Strategy 4: Enhancement
```
Prompt: "I've built the Nano Banana editor. Now I want to add [feature]. 
Here's my current code: [paste code]
How should I implement it?"
```

---

## 🐛 Part 6: Common Issues & Solutions

### Issue 1: "Empty response from AI"
**Cause:** Model not extracting image correctly  
**Solution:** Ensure you're accessing `response.candidates[0].content.parts[0].inlineData`

### Issue 2: "Images are cropped"
**Cause:** CSS using `object-cover` instead of `object-contain`  
**Solution:** Use `object-contain` and `max-h-96` instead of fixed height

### Issue 3: "API timeout with large images"
**Cause:** Image too large  
**Solution:** Implement the resizing function (max 2048x2048)

### Issue 4: "Aspect ratio not preserved"
**Cause:** Incorrect resize calculation  
**Solution:** Use `Math.min(widthRatio, heightRatio)` for scale factor

### Issue 5: "Drag & drop not working"
**Cause:** Missing event.preventDefault()  
**Solution:** Add `e.preventDefault()` in all drag handlers

---

## 🚀 Part 7: Testing Your App

### Step 4: Run and Test

```bash
npm run dev
```

Visit `http://localhost:3000` and test:

✅ **Upload Tests:**
- [ ] Click "Upload Image" - works with all formats
- [ ] Drag and drop - zone highlights properly
- [ ] Camera capture - takes photo successfully

✅ **Editing Tests:**
- [ ] Type custom prompt - processes correctly
- [ ] Click quick prompt - auto-fills textarea
- [ ] Submit with image - returns edited result

✅ **UI Tests:**
- [ ] Loading spinner - animates during processing
- [ ] Error messages - display properly
- [ ] Download button - saves edited image
- [ ] Reset button - clears everything

✅ **Edge Cases:**
- [ ] Large images - resize correctly
- [ ] Portrait/landscape - maintain aspect ratio
- [ ] Multiple edits - can edit same image again
- [ ] Camera permissions denied - shows error

---

## 🎨 Part 8: Customization Ideas

### Easy Modifications (Ask Your LLM!)

#### Add More Quick Prompts
```javascript
const examplePrompts = [
  "Remove the background",
  "Make it black and white",
  // Add your own:
  "Turn into anime style",
  "Add dramatic lighting",
  "Make it look vintage"
];
```

#### Change Color Scheme
```
Current: Yellow/Gold theme
Change to: Purple, Blue, Green, Red, etc.

Find/Replace in component:
yellow-400 → purple-400
yellow-500 → purple-500
```

#### Add Image History
```javascript
const [imageHistory, setImageHistory] = useState([]);
// Store each edit
// Add undo/redo functionality
```

#### Add Progress Bar
```javascript
// Instead of just spinner
const [progress, setProgress] = useState(0);
// Simulate progress or use API streaming
```

#### Multiple Model Support
```javascript
const models = [
  'gemini-2.5-flash-image', // Nano Banana
  'gemini-1.5-flash',       // Analysis
];
// Let users choose model
```

---

## 📊 Part 9: Understanding the Tech Stack

### Why These Technologies?

**Next.js App Router**
- Server-side API routes (keeps API key secure)
- Fast performance
- Built-in routing

**React with Hooks**
- useState: Managing component state
- useRef: Accessing DOM elements (file input, video)
- Clean, modern code

**TailwindCSS**
- Utility-first styling
- Responsive design
- Quick prototyping

**Google Gemini AI**
- Multimodal (text + images)
- Nano Banana model for image editing
- Fast processing
- Generous free tier

---

## 🎓 Part 10: Learning Outcomes

After completing this tutorial, you'll understand:

✅ **API Integration**
- How to call Google's Gemini API
- Handling multimodal inputs (text + images)
- Processing AI responses

✅ **Image Processing**
- Base64 encoding/decoding
- Canvas manipulation
- Aspect ratio preservation
- File compression

✅ **Modern React Patterns**
- Hook management
- Async state updates
- Drag & drop events
- File handling

✅ **UX Best Practices**
- Loading states
- Error handling
- Progressive enhancement
- Visual feedback

✅ **LLM-Assisted Development**
- How to structure prompts for AI helpers
- Breaking down complex features
- Debugging with AI assistance

---

## 🌟 Part 11: Next Steps & Advanced Features

### Take It Further

#### 🎯 Beginner Level
- [ ] Add more color themes
- [ ] Create preset filter buttons
- [ ] Add keyboard shortcuts
- [ ] Improve mobile responsiveness

#### 🚀 Intermediate Level
- [ ] Add batch processing (multiple images)
- [ ] Implement undo/redo functionality
- [ ] Save editing history
- [ ] Add image comparison slider

#### 💪 Advanced Level
- [ ] Real-time preview while typing
- [ ] Multi-step editing workflows
- [ ] User accounts & saved projects
- [ ] Share edited images socially
- [ ] Advanced prompt templates

---

## 📝 Part 12: Copy-Paste LLM Prompt Templates

### Template 1: Full Build
```
I want to build an AI image editor using Google's Gemini 2.5 Flash Image (Nano Banana) model.

Tech stack:
- Next.js with App Router
- React with TypeScript
- TailwindCSS
- @google/generative-ai

Features needed:
1. Drag & drop image upload
2. Camera capture
3. Natural language image editing
4. Before/after view
5. Download edited images
6. Quick example prompts
7. Animated loading states
8. Smart image resizing

Please help me implement this step-by-step, starting with the API route.
I have the tutorial structure here: [paste tutorial]
```

### Template 2: Debugging
```
I'm building a Nano Banana image editor but [specific issue].

Here's my code:
[paste relevant code section]

Expected behavior:
[describe what should happen]

Actual behavior:
[describe what's happening]

Error messages (if any):
[paste errors]

Help me fix this.
```

### Template 3: Feature Addition
```
I have a working Nano Banana image editor. I want to add [feature name].

Current implementation:
[paste current code]

Desired feature:
- [describe feature]
- [user interaction]
- [expected behavior]

How should I implement this?
```

---

## 🎉 Conclusion

Congratulations! You now have a complete AI image editor powered by Google's cutting-edge Nano Banana model. You've learned:

✅ How to integrate advanced AI models into web apps  
✅ Modern React patterns and best practices  
✅ Image processing and manipulation  
✅ Building polished, production-ready UIs  
✅ How to leverage LLMs for development  

### Share Your Creation! 🚀

Built something cool with this tutorial? Share it:
- Tag #NanoBanana #GeminiAI #AIImageEditor
- Show your before/after edits
- Share what you learned
- Help others build it too!

### Resources

- **Google AI Studio**: [aistudio.google.com](https://aistudio.google.com)
- **Gemini Docs**: [ai.google.dev/gemini-api/docs](https://ai.google.dev/gemini-api/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Full Code**: [link to your repo]

---

## 💡 Pro Tips for Maximum Success

1. **Start Small**: Get basic upload/edit working first, then add features
2. **Use Your LLM**: Paste sections into Claude/ChatGPT for explanations
3. **Test Incrementally**: Test each feature as you add it
4. **Read Error Messages**: They usually tell you exactly what's wrong
5. **Experiment**: Try different prompts, models, and features
6. **Share & Learn**: Post your progress, help others, iterate

---

## 🤝 Community & Support

Questions? Stuck on something? Want to share your build?

- **GitHub Issues**: [your repo]
- **Twitter**: [@your_handle]
- **Discord**: [your server]

Remember: The best way to learn is by building, breaking, and fixing things. Don't be afraid to experiment!

Happy building! 🍌✨

---

**P.S.** This entire tutorial can be copy-pasted into Claude, ChatGPT, or any LLM to get interactive help building your app. Just start with: "Help me build this Nano Banana image editor step by step" and paste this tutorial!
