<template>
          <div class="stepper-footer" >
            <v-btn
              v-if="currentStep === 1"
              @click="$emit('close')"
              class="btn-left">
              <svg style="margin-right: 8px;"fill="#023047" width="21px" height="21px" viewBox="0 0 24 24"  stroke="#023047" stroke-width="0.00024"><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm3.707,12.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414L10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12Z"></path></svg>
             <span style="color: #023047;">Fechar</span>
            </v-btn>

            <v-btn
              v-if="currentStep > 1"
              @click="$emit('back')"
              class="btn-left"
            >
            <svg style="margin-right: 8px;"width="18px" height="18px" viewBox="0 0 32.00 33" fill="#023047" stroke="#023047"> <g stroke-width="0"> <g transform="translate(-258.000000, -1089.000000)"> 
              <path d="M281,1106 L270.414,1106 L274.536,1110.12 C274.926,1110.51 274.926,1111.15 274.536,1111.54 C274.145,1111.93 273.512,1111.93 273.121,1111.54 L267.464,1105.88 C267.225,1105.64 267.15,1105.31 267.205,1105 C267.15,1104.69 267.225,1104.36 267.464,1104.12 L273.121,1098.46 C273.512,1098.07 274.145,1098.07 274.536,1098.46 C274.926,1098.86 274.926,1099.49 274.536,1099.88 L270.414,1104 L281,1104 C281.552,1104 282,1104.45 282,1105 C282,1105.55 281.552,1106 281,1106 L281,1106 Z M274,1089 C265.164,1089 258,1096.16 258,1105 C258,1113.84 265.164,1121 274,1121 C282.836,1121 290,1113.84 290,1105 C290,1096.16 282.836,1089 274,1089 L274,1089 Z" id="arrow-left-circle"> </path> </g> </g></svg>
             <span style="color: #023047;">Voltar</span>
            </v-btn>

            <v-btn
              v-if="currentStep < 3"
              @click="$emit('next')"
              class="btn-right"
            >
              Próximo
              <svg style="margin-left: 8px;"width="18px" height="18px" viewBox="0 0 32.00 33" fill="#ffffff"> <g transform="translate(-310.000000, -1089.000000)"> 
                <path d="M332.535,1105.88 L326.879,1111.54 C326.488,1111.93 325.855,1111.93 325.465,1111.54 C325.074,1111.15 325.074,1110.51 325.465,1110.12 L329.586,1106 L319,1106 C318.447,1106 318,1105.55 318,1105 C318,1104.45 318.447,1104 319,1104 L329.586,1104 L325.465,1099.88 C325.074,1099.49 325.074,1098.86 325.465,1098.46 C325.855,1098.07 326.488,1098.07 326.879,1098.46 L332.535,1104.12 C332.775,1104.36 332.85,1104.69 332.795,1105 C332.85,1105.31 332.775,1105.64 332.535,1105.88 L332.535,1105.88 Z M326,1089 C317.163,1089 310,1096.16 310,1105 C310,1113.84 317.163,1121 326,1121 C334.837,1121 342,1113.84 342,1105 C342,1096.16 334.837,1089 326,1089 L326,1089 Z"> </path> </g> </svg>
            </v-btn>

            <v-btn
              v-else
              :loading="saving"
              @click="$emit('save')"
              class="btn-right"
            >
            Salvar
            <svg style="margin-left: 8px;"width="16px" height="16px" viewBox="0 0 24.00 24.00"> 
              <path fill-rule="evenodd" d="M18.1716 1C18.702 1 19.2107 1.21071 19.5858 1.58579L22.4142 4.41421C22.7893 4.78929 23 5.29799 23 5.82843V20C23 21.6569 21.6569 23 20 23H4C2.34315 23 1 21.6569 1 20V4C1 2.34315 2.34315 1 4 1H18.1716ZM4 3C3.44772 3 3 3.44772 3 4V20C3 20.5523 3.44772 21 4 21L5 21L5 15C5 13.3431 6.34315 12 8 12L16 12C17.6569 12 19 13.3431 19 15V21H20C20.5523 21 21 20.5523 21 20V6.82843C21 6.29799 20.7893 5.78929 20.4142 5.41421L18.5858 3.58579C18.2107 3.21071 17.702 3 17.1716 3H17V5C17 6.65685 15.6569 8 14 8H10C8.34315 8 7 6.65685 7 5V3H4ZM17 21V15C17 14.4477 16.5523 14 16 14L8 14C7.44772 14 7 14.4477 7 15L7 21L17 21ZM9 3H15V5C15 5.55228 14.5523 6 14 6H10C9.44772 6 9 5.55228 9 5V3Z" fill="#ffffff"/></svg>
            </v-btn>
          </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props:{
      currentStep: { type: Number, required: true},
      saving: { type: Boolean, default: false},
    },
    emits: ['close', 'back', 'next', 'save']
  });
</script>
<style>
/* botões e footer */
.stepper-footer {
  position: sticky;
  bottom: 0;
  background-color: #F1FAFC;
  padding: 16px;
  border-top: 1px solid #A0A0A0;
  display: flex;
  justify-content: center;
}
.btn-right{
  background-color:#023047;
  border-radius: 0 5px 5px 0;
  width: 140px;
  height: 40px;
  color: white;
  font-weight: 400;
}
.btn-left{
  background-color: #FE5000;
  border-radius: 5px 0 0 5px;
  width: 140px;
  height: 40px;
}
</style>