<script setup lang="ts">
import { ref, onMounted } from 'vue';

const usernameQuery = ref('bsratzlaff');
const profileData = ref<any>(null);
const gearInventory = ref<any[]>([]); 
const loading = ref(false);
const errorMessage = ref('');

const searchProfile = async () => {
  // Prevent double loading or loops if triggered consecutively
  if (loading.value) return; 

  loading.value = true;
  errorMessage.value = '';
  profileData.value = null;
  gearInventory.value = []; 
  
  try {
    const response = await fetch(`http://10.0.2.2:3000/api/profiles/search?username=${usernameQuery.value.trim()}`);
    
    if (!response.ok) {
      throw new Error('Failed to reel in data from the server.');
    }
    
    const data = await response.json();
    
    // Explicitly check that data exists and is a valid array
    if (data && Array.isArray(data) && data.length > 0) {
      profileData.value = data[0];
      
      // Extract string ID safely if it's an object/string structure
      const rawId = profileData.value._id;
      const userId = typeof rawId === 'object' && rawId?.$oid ? rawId.$oid : String(rawId || 'mock-user-123');
      
      await fetchUserGear(userId);
    } else {
      profileData.value = null;
    }
  } catch (error: any) {
    console.error('Profile search error:', error);
    errorMessage.value = error.message || 'Error executing search.';
  } finally {
    loading.value = false;
  }
};

const fetchUserGear = async (userId: string) => {
  try {
    const gearResponse = await fetch(`http://10.0.2.2:3000/api/gear/${userId}`);
    if (gearResponse.ok) {
      const gearData = await gearResponse.json();
      // Ensure it's strictly a primitive array layout to break any mutation memory leaks
      gearInventory.value = Array.isArray(gearData) ? [...gearData] : [];
    } else {
      gearInventory.value = [];
    }
  } catch (error) {
    console.error('Failed to automatically load tacklebox inventory:', error);
    gearInventory.value = [];
  }
};

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
        <input v-model="usernameQuery" type="text" placeholder="Search username..." @keyup.enter="searchProfile" />
        <button @click="searchProfile">Search</button>
      </div>

      <div v-if="loading" class="status loading">Casting a line to the backend...</div>
      
      <div v-else-if="errorMessage" class="status error">
        ⚠️ {{ errorMessage }}
      </div>

      <div v-else-if="profileData" class="dashboard-layout">
        <div class="profile-card">
          <h3>🎣 Profile Locked In!</h3>
          <p><strong>Username:</strong> {{ profileData.username }}</p>
          <p><strong>Name:</strong> {{ profileData.name || 'N/A' }}</p>
        </div>

        <div class="inventory-section">lllllllllllllllllllllllllllllllll
          <h2>🎣 My Gear Inventory</h2>
          
          <div v-if="gearInventory.length > 0" class="gear-grid">
            <div v-for="(item, index) in gearInventory" :key="item._id ? String(item._id) : 'gear-' + index" class="gear-card">
              <h4>{{ item.name }}</h4>
              <p class="tag">{{ item.category }}</p>
              <div class="details">
                <span><strong>Brand:</strong> {{ item.brand || 'Generic' }}</span>
                <span><strong>Color:</strong> {{ item.color || 'N/A' }}</span>
              </div>
            </div>
          </div>
          
          <div v-else class="empty-inventory">
            <p>This tacklebox is empty! No lures, rods, or reels found.</p>
          </div>
        </div>
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
.dashboard-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
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

/* New Design Layout Styles for Mobile Gear */
.inventory-section h2 {
  font-size: 20px;
  color: #35495e;
  margin-bottom: 10px;
}
.gear-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
}
.gear-card {
  border: 1px solid #e2e8f0;
  background: white;
  padding: 12px;
  border-radius: 6px;
}
.gear-card h4 { margin: 0 0 4px 0; font-size: 15px; }
.tag {
  display: inline-block;
  background: #edf2f7;
  color: #4a5568;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: bold;
}
.details {
  display: flex;
  flex-direction: column;
  font-size: 12px;
  color: #718096;
  margin-top: 8px;
}
.empty-inventory {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px dashed #cbd5e0;
}
</style>