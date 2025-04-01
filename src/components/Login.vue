<template>
    <v-container fluid class="d-flex align-center justify-center fill-height bg-white">
        <v-card class="px-12 py-12 card-login">
            <v-form v-model="form" @submit.prevent="onsubmit">

                <h1 class="font-weight-bold text-center mb-2">Entrar em GeoHood</h1>

                <v-alert v-if="errorMessage" type="error" class="mb-2">
                    {{ errorMessage }}
                </v-alert>

                <v-text-field v-model="email" :readonly="loading" :rules="emailRules" class="mb-2" label="E-mail"
                    clearable></v-text-field>

                <v-text-field v-model="password" :readonly="loading" :rules="passwordRules" class="mb-2"
                    label="Password" type="password" placeholder="password" clearable></v-text-field>

                <br>

                <v-btn :disabled="!form" :loading="loading" color="success" size="large" type="submit"
                    variant="elevated" block>Entrar
                </v-btn>
            </v-form>
        </v-card>
    </v-container>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Get router and current route
const router = useRouter()
const route = useRoute()

const emit = defineEmits(['login-sucesso'])
const form = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const email = ref('')
const password = ref('')
const emailRules = ref([v => !!v || 'E-mail obrigatório'])
const passwordRules = ref([v => !!v || 'Senha obrigatória'])

const onsubmit = () => {
    loading.value = true
    errorMessage.value = ''

    setTimeout(() => {
        if (email.value === 'admin@admin.com.br' && password.value === '123456') {
            authStore.login('Rafael', 'Consultor') // Store auth state

            // Get the redirect path from query or default to home ('/')
            const redirectPath = route.query.redirect ? String(route.query.redirect) : '/'

            router.push(redirectPath) // Redirect after login
        } else {
            errorMessage.value = 'E-mail ou senha incorretos'
        }
        loading.value = false
    }, 1000)
}
</script>

<style>
.card-login {
    width: 100%;
    max-width: 600px;
    background-color: #1F272F;
    border-radius: 16px;
    /* box-shadow: 0 0 10px rgba(0,0,0,0.7); */
}
</style>