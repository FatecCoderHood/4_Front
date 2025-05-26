<template>
      <v-dialog v-model="uploadOpen" max-width="500px">
        <v-card style="background-color: #F1FAFC;">
          <v-card-title class="text-black" style="font-weight: 600;">
            <h3> Carregar arquivo TIFF e vincular à fazenda: </h3>
          </v-card-title>
          <v-card-text class="bg-white">
            <v-container>
              <v-row cols="12" sm="6" md="6">
                    <v-file-input
                        v-model="tiffFile"
                        label="Upload da Imagem Tiff"
                        accept=".tiff,image/tiff"
                        outlined
                        :required="false"
                    />                    
              </v-row>
              <v-row>
                    <v-select
                        v-model="selectedFarmId"
                        :items="farms"
                        item-title="nome"
                        item-value="id"
                        label="Selecione a fazenda"
                        outlined
                        dense
                    />
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions class="bg-white">
            <v-spacer></v-spacer>
            <v-btn color="error" 
            variant="text" 
            @click='onClose'
            class="text-black">
              Cancelar
            </v-btn>
            <v-btn 
            color="primary" 
            variant="text" 
            @click='onSubmit'
            class="text-black"
            :disabled="!selectedFarmId || !tiffFile">
              Salvar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>    
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
    props: {
        farms: { type: Array, required: true},
        uploadOpen: { type: Boolean, required: true }
    },
  setup(props, { emit }) {
    const selectedFarmId = ref<string | null>(null);
    const tiffFile = ref<File | null>(null);

    function onSubmit() {
      if (selectedFarmId.value && tiffFile.value) {
        emit('submitUpload', { farmId: selectedFarmId.value, file: tiffFile.value });
        selectedFarmId.value = null;
        tiffFile.value = null;
        emit('update:uploadOpen', false);
      }
    }

    function onClose() {
      selectedFarmId.value = null;
      tiffFile.value = null;
      emit('update:uploadOpen', false);
    }

    return {
      selectedFarmId,
      tiffFile,
      onSubmit,
      onClose,
    };
  },
})
</script>