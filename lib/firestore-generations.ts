import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

export interface Generation {
  id: string
  type: 'cover_art' | 'video' | 'audio_voice' | 'audio_sfx' | 'audio_music' | 'lyrics'
  imageUrl: string
  audioUrl?: string
  textContent?: string
  prompt: string
  metadata: Record<string, any>
  createdAt: Date
}

/**
 * Save image to Firebase Storage and return permanent URL
 */
export async function saveImageToStorage(userId: string, imageData: string, generationId: string): Promise<string> {
  // If base64 data URL, upload directly
  if (imageData.startsWith('data:')) {
    const storageRef = ref(storage, `generations/${userId}/${generationId}.png`)
    await uploadString(storageRef, imageData, 'data_url')
    const downloadUrl = await getDownloadURL(storageRef)
    return downloadUrl
  }

  // If external URL, fetch and re-upload to Firebase Storage
  if (imageData.startsWith('http')) {
    try {
      const response = await fetch(imageData)
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString('base64')
      const mimeType = blob.type || 'image/png'
      const dataUrl = `data:${mimeType};base64,${base64}`
      
      const storageRef = ref(storage, `generations/${userId}/${generationId}.png`)
      await uploadString(storageRef, dataUrl, 'data_url')
      const downloadUrl = await getDownloadURL(storageRef)
      return downloadUrl
    } catch (err) {
      console.error('Failed to fetch and save external image:', err)
      return imageData // Return original URL as fallback
    }
  }

  return imageData
}

/**
 * Save audio to Firebase Storage and return permanent URL
 */
export async function saveAudioToStorage(userId: string, audioData: string, generationId: string): Promise<string> {
  if (!audioData.startsWith('data:')) {
    return audioData
  }

  const storageRef = ref(storage, `generations/${userId}/${generationId}.mp3`)
  await uploadString(storageRef, audioData, 'data_url')
  const downloadUrl = await getDownloadURL(storageRef)
  return downloadUrl
}

/**
 * Save a generation to Firestore
 */
export async function saveGeneration(
  userId: string,
  generation: Omit<Generation, 'id' | 'createdAt'>
): Promise<Generation> {
  console.log('[saveGeneration] Starting save for user:', userId, 'type:', generation.type)
  
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  
  // Save image to storage if present
  let permanentImageUrl = generation.imageUrl
  if (generation.imageUrl) {
    try {
      console.log('[saveGeneration] Saving image to storage...')
      permanentImageUrl = await saveImageToStorage(userId, generation.imageUrl, generationId)
      console.log('[saveGeneration] Image saved:', permanentImageUrl?.substring(0, 50))
    } catch (error) {
      console.error('[saveGeneration] Failed to save image to storage:', error)
    }
  }

  // Save audio to storage if present
  let permanentAudioUrl = generation.audioUrl
  if (generation.audioUrl) {
    try {
      console.log('[saveGeneration] Saving audio to storage...')
      permanentAudioUrl = await saveAudioToStorage(userId, generation.audioUrl, generationId)
      console.log('[saveGeneration] Audio saved:', permanentAudioUrl?.substring(0, 50))
    } catch (error) {
      console.error('[saveGeneration] Failed to save audio to storage:', error)
    }
  }

  console.log('[saveGeneration] Writing to Firestore...')
  const generationsRef = collection(db, 'users', userId, 'generations')
  
  const docRef = await addDoc(generationsRef, {
    type: generation.type,
    imageUrl: permanentImageUrl || '',
    audioUrl: permanentAudioUrl || '',
    textContent: generation.textContent || '',
    prompt: generation.prompt,
    metadata: generation.metadata,
    createdAt: serverTimestamp(),
  })
  console.log('[saveGeneration] Saved to Firestore with id:', docRef.id)

  return {
    id: docRef.id,
    type: generation.type,
    imageUrl: permanentImageUrl || '',
    audioUrl: permanentAudioUrl,
    textContent: generation.textContent,
    prompt: generation.prompt,
    metadata: generation.metadata,
    createdAt: new Date(),
  }
}

/**
 * Get user's generation history
 */
export async function getGenerations(userId: string): Promise<Generation[]> {
  const generationsRef = collection(db, 'users', userId, 'generations')
  const q = query(generationsRef, orderBy('createdAt', 'desc'), limit(50))
  
  const snapshot = await getDocs(q)
  
  return snapshot.docs.map(doc => {
    const data = doc.data()
    return {
      id: doc.id,
      type: data.type,
      imageUrl: data.imageUrl || '',
      audioUrl: data.audioUrl || undefined,
      textContent: data.textContent || undefined,
      prompt: data.prompt,
      metadata: data.metadata || {},
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
    }
  })
}

/**
 * Delete a generation
 */
export async function deleteGeneration(userId: string, generationId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'users', userId, 'generations', generationId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error('Failed to delete generation:', error)
    return false
  }
}
