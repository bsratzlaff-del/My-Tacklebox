<template>
  <div class="camera-action">
    <button @click="takePhoto" class="capture-btn">
      📸 Take Photo
    </button>
    <img v-if="photo" :src="photo" class="preview" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const photo = ref<string | undefined>(undefined);

const takePhoto = async () => {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      source: CameraSource.Prompt, // This lets you choose Camera or Gallery
      resultType: CameraResultType.Uri
    });
    photo.value = image.webPath;
  } catch (e) {
    console.error("User cancelled camera");
  }
};
</script>

<style scoped>
.capture-btn {
  background: #42b883;
  color: white;
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  font-weight: bold;
}
.preview {
  margin-top: 10px;
  width: 100%;
  border-radius: 8px;
}
</style>