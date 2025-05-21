<template>
                <v-row class="ma-0 pa-0" style="margin-top: -8px !important;">
                    <v-col>
                    <v-card class="resumo-layout pa-2">
                        <div class="resumo-content">
                        <v-card-title class= "mb-5"style="font-size: 24px;font-weight: 700;">Resumo da Fazenda</v-card-title>
                        <v-card-text >
                            <p class="mb-7"><strong>Nome:</strong> {{ farm.nome }}</p>
                            <p class="mb-7"><strong>Localização:</strong> {{ farm.cidade }}, {{ farm.estado }}</p>
                            <p class="mb-7"><strong>Número de Talhões:</strong> {{ items.length }}</p>
                            <p><strong>GeoJSON de Daninhas:</strong> {{ weedsGeoJsonFile ? 'Incluído' : 'Não incluído' }}</p>
                        </v-card-text>
                        </div>
                    </v-card>
                    </v-col>
                    <v-col> 
                    <v-card class="talhao-layout pa-2">
                        <div class="resumo-content">
                        <v-card-title class= "mb-5"style="font-size: 24px;font-weight: 700;">Talhões Cadastrados ({{ items.length }})</v-card-title>
                        <v-data-table 
                        :items="itemsComNumeracao"
                        :headers="viewPlotHeaders"
                        class="talhao-list"
                        >
                            <template v-slot:item.nome="{ item }">
                              <p>Talhão {{ item.numeroTalhao }}</p>
                            </template>                              
                            <template v-slot:item.areaHaTl="{ item }">
                            {{ item.areaHaTl !== null ? item.areaHaTl + ' ha' : 'N/A' }}
                            </template>
                            <template v-slot:item.productivity="{ item }">
                            <v-text-field
                                v-model="item.productivity"
                                type="number"
                                suffix="sacas/ano"
                                dense
                                outlined
                                hide-details
                                @change="onProductivityChange(item)"
                            ></v-text-field>
                            </template> 
       
                        </v-data-table>
                        </div>
                    </v-card>
                    </v-col>
                </v-row>    
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'FarmSummary',
    props: {
        farm: { type: Object, required: true},
        items: { type: Array, required: true},
        weedsGeoJsonFile: { type: [File, null], default: null},
        viewPlotHeaders: { type: Array, required: true}
    },
    emits: ['update-productivity'],
    methods: {
        onProductivityChange(item) {
        this.$emit('update-productivity', item);
  }
},
computed: {
  itemsComNumeracao() {
    return this.items.map((item, i) => ({
      ...item,
      numeroTalhao: i + 1
    }));
  }
}
});
</script>

<style scoped>
.resumo-layout{
  width: 340px;
  height: 300px;
  background-color: #F1FAFC;
  box-shadow: 3px 2px 3px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
  justify-content: center;
}

.resumo-content{
  color: #023047;
}

.talhao-list{
  width: 700px;
  background-color: #F1FAFC;
  margin-left: 20px;
  max-height: 220px;
  overflow-y: auto;
}

.talhao-layout{
  width: 740px;
  height: 300px;
  background-color: #F1FAFC;
  box-shadow: 3px 2px 3px rgba(0, 0, 0, 0.3);
  border-radius: 16px;
}
</style>