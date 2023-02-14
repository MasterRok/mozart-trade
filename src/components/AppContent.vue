<template>
  <Input v-model.number="maxLoss">TEST1</Input>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

const maxLoss = ref('10');
</script>
