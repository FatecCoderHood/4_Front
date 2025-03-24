<template>
    <v-container fluid class="d-flex align-center justify-center fill-height bg-white">
        <v-card class="px-12 py-12 card-login h-50">
            <v-form
            v-model="form" @submit.prevent="onsubmit">

            <h1 class="font-weight-bold text-center mb-2">Entrar em GeoHood</h1>
            
                <v-text-field
                v-model="email"
                :readonly="loading"
                :rules="emailRules"
                class="mb-2"
                label="E-mail"
                clearable
                ></v-text-field>

                <v-text-field
                v-model="password"
                :readonly="loading"
                :rules="passwordRules"
                class="mb-2"
                label="Password"
                placeholder="password"
                clearable
                ></v-text-field>

                <br>
                
                <v-btn
                :disabled="!form"
                :loading="loading"
                color="success"
                size="large"
                type="submit"
                variant="elevated"
                block
                >Entrar
                </v-btn>
            </v-form>
        </v-card>
    </v-container>
    </template>

<script setup>
import { ref } from 'vue'

const form = ref(false)
const loading = ref(false)
const email = ref('')
const password = ref('')
const emailRules = ref([v => !!v || 'E-mail obrigatório'])
const passwordRules = ref([v => !!v || 'Senha obrigatória'])

const onsubmit = () => {
    loading.value = true
    setTimeout(() => {
    loading.value = false
    alert(`Login com: ${email.value}`)
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