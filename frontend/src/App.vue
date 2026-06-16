<script setup lang="ts">
import { ref, onMounted } from 'vue';
import CameraButton from './components/CameraButton.vue';

const usernameQuery = ref('bsratzlaff');
const profileData = ref<any>(null);
const currentUserId = ref<string>(''); 
const gearInventory = ref<any[]>([]); 
const loading = ref(false);
const errorMessage = ref('');

const searchProfile = async () => {
  if (loading.value) return; 

  loading.value = true;
  errorMessage.value = '';
  profileData.value = null;
  currentUserId.value = '';
  gearInventory.value = []; 
  
  try {
    const response = await fetch(`http://10.0.2.2:3000/api/profiles/search?username=${usernameQuery.value.trim()}`);
    
    if (!response.ok) {
      throw new Error('Failed to reel in data from the server.');
    }
    
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      profileData.value = data[0];
      
      const rawId = profileData.value._id;
      const userId = typeof rawId === 'object' && rawId?.$oid ? rawId.$oid : String(rawId || 'mock-user-123');
      
      currentUserId.value = userId;
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
      gearInventory.value = Array.isArray(gearData) ? [...gearData] : [];
    } else {
      gearInventory.value = [];
    }
  } catch (error) {
    console.error('Failed to automatically load tacklebox inventory:', error);
    gearInventory.value = [];
  }
};

const handleNewGearScanned = (scannedItems: any) => {
  console.log("🎒 App.vue caught new gear from the camera component:", scannedItems);
  
  if (Array.isArray(scannedItems)) {
    gearInventory.value.unshift(...scannedItems);
  } else if (scannedItems && typeof scannedItems === 'object') {
    gearInventory.value.unshift(scannedItems);
  }
};

// 🛠️ NEW: Sends a delete request to the backend and drops it from the UI state
const deleteGearItem = async (itemId: string, index: number) => {
  // If it's a mock item without a DB ID, just drop it from the local screen array
  if (!itemId || itemId.startsWith('gear-')) {
    gearInventory.value.splice(index, 1);
    return;
  }

  try {
    const response = await fetch(`http://10.0.2.2:3000/api/gear/${itemId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      // Successfully deleted from database, now filter it out of the UI list instantly
      gearInventory.value.splice(index, 1);
      console.log(`🗑️ Local card removed for ID: ${itemId}`);
    } else {
      console.error('Backend refused to delete the item.');
    }
  } catch (error) {
    console.error('Network error during item deletion:', error);
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
        
          <CameraButton :userId="currentUserId" @lureScanned="handleNewGearScanned" />
        </div>
      

        <div class="inventory-section">
          <h2>🎣 My Gear Inventory</h2>
          
          <div v-if="gearInventory.length > 0" class="gear-grid">
            <div v-for="(item, index) in gearInventory" :key="item._id ? String(item._id) : 'gear-' + index" class="gear-card">
              <div class="card-header">
                <h4>{{ item.name }}</h4>
                <button class="delete-btn" @click="deleteGearItem(item._id ? String(item._id) : '', index)" title="Delete Item">×</button>
              </div>
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
  position: relative;
}
/* 🛠️ NEW STYLES: Cleans up header layout and adds the deletion action layout styles */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 4px;
}
.gear-card h4 { margin: 0 0 4px 0; font-size: 15px; flex: 1; }
.delete-btn {
  background: transparent;
  color: #a0aec0;
  border: none;
  font-size: 20px;
  line-height: 14px;
  padding: 0 4px;
  cursor: pointer;
  transition: color 0.2s;
}
.delete-btn:hover {
  color: #e53e3e;
}

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