<template v-slot:item.actions="{ item }">
    <v-icon style="font-size: 16px;" color="#F6A700" class="mr-1" @click="$emit('view')">
      mdi-eye
    </v-icon>
    <svg
      class="svg-icon"
      fill="#023047"
      width="16px"
      height="16px"
      viewBox="0 0 24.00 24.00"
      stroke="#023047"
      style="vertical-align: middle; margin-right: 2px;"
      stroke-width="0.00024000000000000003"
      @click="$emit('edit')"
      >
      <path d="M20.052,3.948a3.234,3.234,0,0,1,0,4.575L18.471,10.1,13.9,5.529l1.581-1.581A3.234,3.234,0,0,1,20.052,3.948ZM8.438,20.138l8.619-8.62L12.482,6.943l-8.62,8.619L3,21Z"></path>
    </svg>
    <v-icon color="#FE5000" style="font-size: 16px;" @click="$emit('delete')">
      mdi-delete
    </v-icon>
</template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    props: {
      farm: { type: Object, required: true }
    },
    emits: ['view', 'edit', 'delete']
  });
  </script>

<style scoped>
.v-icon {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.v-icon:hover {
  opacity: 1;
}

.svg-icon {
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.svg-icon:hover {
  opacity: 1;
}
</style>