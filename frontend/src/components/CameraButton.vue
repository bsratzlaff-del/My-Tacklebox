<template>
  <div class="camera-action">
    <button @click="takePhoto" class="capture-btn" :disabled="isAnalyzing">
      <span>{{ isAnalyzing ? 'Scanning Tacklebox...' : '📸 Take Photo' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'; // If profile data isn't in a global state, inject it or pass it as a prop
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

// Assuming you pass the active user ID as a prop from App.vue
const props = defineProps<{
  userId?: string
}>();

const photo = ref<string | undefined>(undefined);
const isAnalyzing = ref<boolean>(false);
const emit = defineEmits(['lureScanned']);

const takePhoto = async () => {
  try {
    // 1. Capture the image context
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      source: CameraSource.Prompt, 
      resultType: CameraResultType.Uri
    });
    
    photo.value = image.webPath;
    if (!image.webPath) return;
    isAnalyzing.value = true;

    // 2. Transpile the local path layout into a binary object file
    const response = await fetch(image.webPath);
    const blob = await response.blob();

    // 3. Build Multipart Request matching backend keys exactly
    const formData = new FormData();
    // 🛠️ FIX 2: Swapped field name 'file' to 'tacklePhoto' to satisfy upload.single()
    formData.append('tacklePhoto', blob, 'tacklebox_lure.jpg'); 
    
    // 🛠️ FIX 3: Inject the active target account ID (Fallback used for testing if missing)
    formData.append('userId', props.userId || 'mock-user-123');

    // 🛠️ FIX 1: Pointing directly to /api/tacklebox/scan on port 3000
    const backendUrl = 'http://10.0.2.2:3000/api/tacklebox/scan'; 
    
    const serverResponse = await fetch(backendUrl, {
      method: 'POST',
      body: formData
    });

    if (serverResponse.ok) {
      const apiPayload = await serverResponse.json();
      console.log("AI execution flow finished:", apiPayload);
      
      // Pass the saved database records up to update the layout array grid
      emit('lureScanned', apiPayload.data);
    } else {
      console.error("The node runtime execution route caught an edge anomaly.");
    }

  } catch (e) {
    console.error("Pipeline processing crash:", e);
  } finally {
    isAnalyzing.value = false;
  }
};
</script>