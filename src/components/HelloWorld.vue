<template>
  <v-app>
    <v-main :style="{ background: `url(${bgGif}) no-repeat center center`, backgroundSize: 'cover', height: '100vh' }">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" md="8" class="text-center">
            <h1 class="text-h3 font-weight-bold text-white" style="color: white;">Gestão de Fazendas Inteligente</h1>
            <p class="text-subtitle-1 text-white mt-4" style="color: white;">
              Monitore sua produção com tecnologia de ponta e imagens de satélite.
            </p>
          </v-col>
        </v-row>
      </v-container>

      <!-- Componente chamativo -->
      <div class="satellite-animation">
        <div class="satellite"></div>
      </div>
    </v-main>
  </v-app>
</template>

<script setup Lang = ts>
import bgGif from '@/assets/fundofazenda.jpg';


</script>


