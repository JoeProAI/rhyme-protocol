import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadString, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'

export interface Generation {
  id: string
  type: 'cover_art' | 'video'
  imageUrl: string
  prompt: string
  metadata: Record<string, any>
  createdAt: Date
}

/**
 * Save image to Firebase Storage and return permanent URL
 */
export async function saveImageToStorage(userId: string, imageData: string, generationId: string): Promise<string> {
  // If already a permanent URL (not base64), return as-is
  if (!imageData.startsWith('data:')) {
    // For external URLs, we need to fetch and re-upload
    // For now, just return the URL (it may expire)
    return imageData
  }

  const storageRef = ref(storage, `generations/${userId}/${generationId}.png`)
  
  // Upload base64 image
  await uploadString(storageRef, imageData, 'data_url')
  
  // Get permanent download URL
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
  const generationId = `gen_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
  
  // Save image to storage and get permanent URL
  let permanentImageUrl = generation.imageUrl
  try {
    permanentImageUrl = await saveImageToStorage(userId, generation.imageUrl, generationId)
  } catch (error) {
    console.error('Failed to save to storage, using original URL:', error)
  }

  const generationsRef = collection(db, 'users', userId, 'generations')
  
  const docRef = await addDoc(generationsRef, {
    type: generation.type,
    imageUrl: permanentImageUrl,
    prompt: generation.prompt,
    metadata: generation.metadata,
    createdAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    type: generation.type,
    imageUrl: permanentImageUrl,
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
      imageUrl: data.imageUrl,
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
