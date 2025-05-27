
 <template>
      <BaseDrawer v-model="drawer" @saveChanges="saveChanges" >
      <h2 style="margin-left: 45px; margin-top: 1px; font-size:medium;" 
      >Cadastro de Usuários</h2>

      <v-divider class="mb-1"></v-divider>
      <v-container>
    <v-card 
    class="pa-4" 
    color="#D9D9D9"
    width="400"
    dark
    >
    
<!-- campo ID  -->
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

<!-- campo username  -->
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

  <!-- campo email  -->
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
          v-model="email"
          label="Email"
          density="compact"
          variant="underlined"
          class="input-field"
        ></v-text-field>
      </v-col>
    </v-row>

<!-- campo senha -->
    <v-row>
      <v-col class="pa-4" style="height: 65px;">
        <v-text-field
         v-model="password"
         :type="showPassword ? 'text' : 'password'"
         label="Senha"
         append-inner-icon="mdi-eye-off"
         @click:append-inner="togglePassword"
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
 

//ref pra senha
const password = ref('');
const showPassword = ref(false);

//toggle para o icon
const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

//logica para botão de confirmar
const saveChanges = () => {
  console.log("Dados Cadastrados")
}

</script>
