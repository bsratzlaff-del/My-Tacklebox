<template>
  <div class="login-container">
    <div class="login-card">
      <h1>🎣 Tacklebox</h1>
      <p class="subtitle">Your Fishing Gear Companion</p>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Enter your username"
            required
            :disabled="isLoading"
          />
        </div>

        <button type="submit" class="login-btn" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { UserProfile } from '../services/apiClient';

const username = ref('');
const isLoading = ref(false);
const errorMessage = ref('');

const emit = defineEmits<{
  loginSuccess: [profile: UserProfile];
}>();

const handleLogin = async () => {
  if (!username.value.trim()) {
    errorMessage.value = 'Please enter a username';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';

  try {
    // Call the backend profile search API
    const response = await fetch(`http://${getBackendHost()}/api/profiles/search?username=${encodeURIComponent(username.value)}`);
    
    if (!response.ok) {
      throw new Error('Login failed');
    }

    const profiles = await response.json();

    if (!profiles || profiles.length === 0) {
      errorMessage.value = 'Username not found';
      return;
    }

    // Emit the first matching profile
    const profile = profiles[0];
    emit('loginSuccess', profile);
  } catch (error) {
    console.error('Login error:', error);
    errorMessage.value = 'Login failed. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Helper function to get the correct backend host for emulator/physical device
const getBackendHost = () => {
  // This matches the logic in apiClient.ts
  // Android emulator needs 10.0.2.2:3000
  // Physical device or web needs localhost:3000 or your computer's IP
  return '10.0.2.2:3000';
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
}

h1 {
  text-align: center;
  font-size: 32px;
  margin: 0 0 8px;
  color: #333;
}

.subtitle {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin: 0 0 30px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.3s;
}

.login-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #fee;
  color: #c33;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}
</style>
