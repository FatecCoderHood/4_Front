<template>
      <v-dialog v-model="modelValue" max-width="500px">
        <v-card class="bg-white">
          <v-card-title class="text-black">
            <span class="text-h5">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text class="bg-white">
            <v-container>
              <v-row>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.nome" label="Nome completo" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.email" label="E-mail" type="email" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-text-field v-model="editedItem.senha" label="Senha" type="password" required
                    class="text-black"></v-text-field>
                </v-col>
                <v-col cols="12" sm="6" md="6">
                  <v-select v-model="editedItem.tipoAcesso" :items="tiposAcesso" item-title="text" item-value="value"
                    label="Tipo de Acesso" required class="text-black" bg-color="white">
                    <template v-slot:item="{ props, item }">
                      <v-list-item v-bind="props" :class="`text-${getColor(item.value)}`"></v-list-item>
                    </template>
                  </v-select>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="bg-white">
            <v-spacer></v-spacer>
            <v-btn color="error" variant="text" @click="$emit('update:modelValue', false)" class="text-black">
              Cancelar
            </v-btn>
            <v-btn color="primary" variant="text" @click="$emit('save')" class="text-black">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
import type { User } from '@/pages/Users.vue';


export default defineComponent({
  name: 'UserForm',

  props: {
    modelValue: {
      type: Boolean,
      required: true
    },
    editedItem: {
      type: Object as PropType<User>,
      required: true
    },
    tiposAcesso: {
      type: Array as PropType<Array<{ text: string; value: string; color: string }>>,
      required: true
    },
    formTitle: {
      type: String,
      required: true
    },
  },
   emits: ['update:modelValue', 'save'],

  methods: {
    getColor(tipoAcesso: 'ADMIN' | 'CONSULTOR' | 'ANALISTA'): string {
      const tipo = this.tiposAcesso.find(t => t.value === tipoAcesso);
      return tipo ? tipo.color : 'grey';
    }
  }
});
</script>