<template>
      <BaseDrawer v-model="drawer" @saveChanges="saveChanges">
      <h2 style="margin-left: 45px; margin-top: 1px; font-size:medium;" 
      >Edição de Usuário</h2>
      <v-divider class="mb-1"></v-divider>
      <v-container >
    <v-card 
    class="pa-4" 
    color="#D9D9D9"
    width="400"
    dark
    >
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
          v-model="userId"
          label="Código de Usuário"
          readonly
          :value="userId"
          append-icon="mdi-lock"
          disabled
          density="compact"
          class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
          v-model="username"
          label="Nome de Usuário"
          density="compact"
          variant="underlined"
          class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
          v-model="newEmail"
          label="Email Novo"
          density="compact"
          variant="underlined"
          class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
         v-model="password"
         :type="showPassword ? 'text' : 'password'"
         label="Nova Senha"
         append-inner-icon="mdi-eye-off"
         @click:append-inner="togglePassword"
         density="compact"
         variant="underlined"
         class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
         v-model="newPassword"
         :type="showNewPassword ? 'text' : 'password'"
         label="Confirmar Nova Senha"
         append-inner-icon="mdi-eye-off"
         @click:append-inner="toggleNewPassword"
         density="compact"
         variant="underlined"
         class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>
    
    </v-card>
  </v-container>
      </BaseDrawer>


  </template>

<script setup>
import { ref } from 'vue'
import BaseDrawer from '../BaseDrawer.vue'

// adicione dados mocados:
const userId = ref('') 
const username = ref('')
const newEmail = ref('') 


//Lógica do icon toggle senha
const password = ref('');
const newPassword = ref('');
const showPassword = ref(false);
const showNewPassword = ref(false);
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value;
};


//logica para botão de confirmar sem dados reais
const saveChanges = () => {
  if (password.value !== newPassword.value) {
    return;
  }
  // Simulando atualização dos dados do usuário
  const updatedUser = {
    userId: userId.value,
    username: username.value,
    email: newEmail.value,
    password: password.value ? "••••••••" : "(Senha não alterada)"
  };
  console.log("Usuário atualizado", updatedUser);
//reset de campo
  password.value = "";
  newPassword.value = "";
};
</script>


