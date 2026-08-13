<script setup lang="ts">
import { ref } from 'vue';
// @ts-ignore: Vue SFC module types may be missing in some TS setups
import LoginView from './components/LoginView.vue';
// @ts-ignore: Vue SFC module types may be missing in some TS setups
import CameraButton from './components/CameraButton.vue';
// 💡 PROPER WAY: Import dedicated functions and types from a centralized API client.
// This separates data fetching logic from the component's view logic.
import { getUserGear, deleteGearItem as apiDeleteGearItem, type Gear, type UserProfile } from './services/apiClient';

const profileData = ref<UserProfile | null>(null);
const currentUserId = ref<string>(''); 
const gearInventory = ref<Gear[]>([]); 
const loadingInventory = ref(false);

// 🔐 Fired dynamically when LoginView emits 'loginSuccess'
const handleLoginSuccess = async (userProfile: UserProfile) => {
  profileData.value = userProfile;
  
  const rawId = userProfile._id;
  currentUserId.value = typeof rawId === 'object' && rawId?.$oid ? rawId.$oid : String(rawId || '');
  
  // Instantly fetch the authenticated user's tacklebox items
  await loadUserGear(currentUserId.value);
};

const loadUserGear = async (userId: string) => {
  loadingInventory.value = true;
  try {
    // The component now just calls the clean, reusable function from the service.
    gearInventory.value = await getUserGear(userId);
  } catch (error) {
    console.error('Failed to load tacklebox inventory:', error);
    // You could add user-facing error feedback here
  } finally {
    loadingInventory.value = false;
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

const deleteGearItem = async (itemId: string, index: number) => {
  if (!itemId || itemId.startsWith('gear-')) {
    gearInventory.value.splice(index, 1);
    return;
  }

  try {
    // Call the API client to perform the deletion. We alias the import to avoid name conflicts.
    await apiDeleteGearItem(itemId);
    // On success, update the local state.
    gearInventory.value.splice(index, 1);
    console.log(`🗑️ Item deleted successfully via API: ${itemId}`);
  } catch (error) {
    console.error('Failed to delete item:', error);
  }
};

// 🚪 Destroys active session state to return to login overlay
const handleSignOut = () => {
  profileData.value = null;
  currentUserId.value = '';
  gearInventory.value = [];
};
</script>

<template>
  <div class="tacklebox-container">
    <div v-if="!profileData">
      <LoginView @loginSuccess="handleLoginSuccess" />
    </div>

    <div v-else>
      <header class="app-header">
        <div>
          <h1>🧰 My Tacklebox Home</h1>
          <p>Welcome back, <strong>{{ profileData.name || profileData.username }}</strong>!</p>
        </div>
        <button @click="handleSignOut" class="signout-btn">Sign Out</button>
      </header>

      <main class="dashboard-layout">
        <div class="profile-card">
          <h3>🎣 Scan New Gear Context</h3>
          <p>Snap a photo to instantly add visual components straight to your storage account via Gemini Flash Vision.</p>
          <CameraButton :userId="currentUserId" @lureScanned="handleNewGearScanned" />
        </div>

        <div class="inventory-section">
          <h2>📦 Current Asset Inventory</h2>
          
          <div v-if="loadingInventory" class="loading-spinner">Reeling in inventory records...</div>
          
          <div v-else-if="gearInventory.length > 0" class="gear-grid">
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
            <p>Your tacklebox is empty. Click the camera above to scan your local gear assets.</p>
          </div>
        </div>
      </main>
    </div>
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
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #42b883;
  padding-bottom: 14px;
  margin-bottom: 30px;
}

.app-header h1 { 
  color: #42b883; 
  margin: 0 0 4px 0; 
  font-size: 20px; /* Slightly smaller for mobile scaling */
}

/* 🛠️ HIGHLY VISIBLE SIGN OUT ACTION BUTTON */
.signout-btn {
  background: #e53e3e; /* Crisp crimson red so you can't miss it */
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: background 0.2s;
}

.signout-btn:hover { 
  background: #c53030; 
}
</style>