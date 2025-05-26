<template>
  <v-bottom-sheet class="right-aligned-sheet" v-model="show" location="botton left" width="400">
    <v-card class="pa-4 rounded-lg">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Processando cadastro</span>
        <v-btn icon @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-progress-linear
          v-model="progress"
          height="20"
          striped
          rounded
          style="color: dodgerblue"
        >
          <template v-slot:default="{ value }">
            <strong style="color: #000;">{{ Math.ceil(value) }}%</strong>
          </template>
        </v-progress-linear>

        <div class="mt-4">
          <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
          <span>{{ statusMessage }}</span>
        </div>

        <div v-if="timeRemaining" class="mt-2 text-caption">
          <v-icon small>mdi-clock-outline</v-icon>
          Tempo estimado: {{ timeRemaining }}s
        </div>
      </v-card-text>
    </v-card>
  </v-bottom-sheet>
</template>

<script lang="ts">
import {defineComponent, ref, computed} from 'vue';

export default defineComponent({
  setup() {
    const show = ref(false);
    const progress = ref(0);
    const timeRemaining = ref<number | null>(null);
    const status = ref<'loading' | 'success' | 'error'>('loading');

    const statusIcon = computed(() => {
      return {
        loading: 'mdi-progress-upload',
        success: 'mdi-check-circle',
        error: 'mdi-alert-circle'
      }[status.value];
    });

    const statusColor = computed(() => {
      return {
        loading: 'primary',
        success: 'success',
        error: 'error'
      }[status.value];
    });

    const statusMessage = computed(() => {
      return {
        loading: 'Enviando dados...',
        success: 'Cadastro concluído!',
        error: 'Falha no envio'
      }[status.value];
    });

    function start() {
      show.value = true;
      status.value = 'loading';
      progress.value = 0;
      // simulateProgress();
    }

    function simulateProgress() {
      const duration = 2500
      const startTime = Date.now();

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progressRatio = Math.min(1, elapsed / duration);

        // Curva de progresso personalizada
        progress.value = Math.floor(
          100 * (1 - Math.pow(1 - progressRatio, 3)) // EaseOutCubic
        );

        timeRemaining.value = Math.ceil((duration - elapsed) / 1000);

        if (progressRatio >= 1) {
          clearInterval(interval);
          status.value = 'success';
          setTimeout(() => close(), 2000);
        }
      }, 500);
    }

    function close() {
      show.value = false;
    }

    return {
      show,
      progress,
      timeRemaining,
      statusIcon,
      statusColor,
      statusMessage,
      start,
      close
    };
  }
});
</script>

<style>
.v-bottom-sheet > .v-bottom-sheet__content.v-overlay__content {
  left: auto !important;
}

.v-overlay__scrim {
  background: transparent !important;
}
</style>
