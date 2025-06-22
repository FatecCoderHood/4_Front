<template>
    <v-container fluid class="d-flex align-center justify-center fill-height bg-white" 
    :style="`
    background-image: url(${backgroundImage}); 
    background-size: cover; 
    background-position: center;
    `">
        <div class="left-blur"></div>
        <v-card class="px-12 pt-4 pb-8 card-login" >
            <v-form v-model="form" @submit.prevent="onsubmit">

                <div class="text-center">
                    <img src="@/assets/logo.png" alt="Ícone" style="width: 64px;">
                    <h2 style="color: #023047; margin-bottom: 24px;" >GeoHood</h2>
                </div>
            
                <v-alert v-if="errorMessage" type="error" class="mb-2">
                    {{ errorMessage }}
                </v-alert>
                <label class="field-label">Login:</label>
                <v-text-field v-model="email" :readonly="loading" :rules="emailRules" class="mb-2" label="E-mail"
                    clearable></v-text-field>

                <label class="field-label">Senha:</label>
                <v-text-field v-model="password" :readonly="loading" :rules="passwordRules" class="mb-2"
                    label="Password" type="password" placeholder="password" clearable></v-text-field>

                <br>

                <v-btn :loading="loading" size="large" type="submit" block style="background-color:#023047; color: white;">
                    Entrar
                    <svg style="margin-left: 8px;" width="16px" height="16px" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"> 
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"></path> <polyline points="10 17 15 12 10 7"/>
                        <line x1="15" y1="12" x2="3" y2="12"></line></svg>                    
                </v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup>
import api from '@/utils/api'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Get router and current route
const router = useRouter()
const route = useRoute()
const backgroundImage = new URL('@/assets/backgroundlogin.png', import.meta.url).href
const emit = defineEmits(['login-sucesso'])
const form = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const email = ref('')
const password = ref('')
const emailRules = ref([v => !!v || 'E-mail obrigatório'])
const passwordRules = ref([v => !!v || 'Senha obrigatória'])

const onsubmit = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        const response = await api.post('/auth/login', {
            email: email.value,
            senha: password.value
        })
        
        // Extract user info from the response
        const { name: userName, role } = response.data

        // Store authenticated user
        authStore.login(userName, role)

        // Get the redirect path from query or default to home ('/')
        const redirectPath = route.query.redirect ? String(route.query.redirect) : '/'
        router.push(redirectPath) // Redirect after login
    } catch (error) {
        errorMessage.value = error.response?.data?.error || 'Erro ao tentar fazer login'
    } finally {
        loading.value = false
    }
}
</script>

<style>

.v-container {
  position: relative;
}

html, body {
  overflow-y: hidden; 
}


.card-login {
    position: relative; 
    right: 28%;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    max-width: 80vh;
    border-radius: 16px;
    background: linear-gradient(to bottom, #D9D9D9 0%, #D9D9D9 50%, #737373 100%) !important;
    z-index: 2 !important;
}

.left-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 44%;
  height: 100%;
  backdrop-filter: blur(8px);
  z-index: 1 !important;
}

.field-label {
  color: #023047;
  font-weight: 600;
  display: block;
  font-size: 1rem;
}
</style>