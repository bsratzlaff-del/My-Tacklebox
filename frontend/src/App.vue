<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 💡 Vue State Management: Just use ref() instead of useState!
const usernameQuery = ref('bsratzlaff');
const profileData = ref<any>(null);
const loading = ref(false);
const errorMessage = ref('');

// 💡 Vue Lifecycles: onMounted is your new useEffect(() => {}, [])
const searchProfile = async () => {
  loading.value = true; // Notice we use .value to change state in Vue scripts!
  errorMessage.value = '';
  
  try {
    const response = await fetch(`http://localhost:3000/api/profiles/search?username=${usernameQuery.value}`);
    
    if (!response.ok) {
      throw new Error('Failed to reel in data from the server.');
    }
    
    const data = await response.json();
    // Grab the first profile found in our collection array
    profileData.value = data.length > 0 ? data[0] : null;
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

// Automatically run the search when the page loads for the first time
onMounted(() => {
  searchProfile();
});
</script>

<template>
  <div class="tacklebox-container">
    <header>
      <h1>🧰 My Tacklebox UI</h1>
      <p>Powered by Vue 3, Vite, and TypeScript</p>
    </header>

    <main>
      <div class="search-bar">
        <input v-model="usernameQuery" type="text" placeholder="Search username..." />
        <button @click="searchProfile">Search</button>
      </div>

      <div v-if="loading" class="status loading">Casting a line to the backend...</div>
      
      <div v-else-if="errorMessage" class="status error">
        ⚠️ {{ errorMessage }}
      </div>

      <div v-else-if="profileData" class="profile-card">
        <h3>🎣 Profile Locked In!</h3>
        <p><strong>Username:</strong> {{ profileData.username }}</p>
        <p><strong>Name:</strong> {{ profileData.name || 'N/A' }}</p>
      </div>

      <div v-else class="status empty">
        No profile matches found for "{{ usernameQuery }}".
      </div>
    </main>
  </div>
</template>

<style scoped>
.tacklebox-container {
  max-width: 600px;
  margin: 40px auto;
  font-family: system-ui, -apple-system, sans-serif;
  color: #2c3e50;
  padding: 20px;
}
header {
  text-align: center;
  border-bottom: 2px solid #42b883;
  padding-bottom: 10px;
  margin-bottom: 30px;
}
h1 { color: #42b883; margin-bottom: 5px; }
.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  flex: 1;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #35495e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}
button:hover { background-color: #42b883; }
.status {
  text-align: center;
  padding: 20px;
  border-radius: 6px;
  background: #f8f9fa;
}
.error { color: #e74c3c; background: #fdeae8; }
.profile-card {
  border: 1px solid #42b883;
  background: #f6fffa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.profile-card h3 { margin-top: 0; color: #42b883; }
</style>