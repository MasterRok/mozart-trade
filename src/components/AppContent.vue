<template>
  <div class="flex flex-column align-items-center gap-5">
    <div class="flex gap-3">
      <div class="flex align-items-center p-float-label">
        <InputNumber input-id="initialRate" v-model="initialRate" :max="100" suffix=" %"/>
        <label for="initialRate">Вход по рынку</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber input-id="initialPrice" v-model="initialPrice" suffix=" $"/>
        <label for="initialPrice">Текущая цена</label>
      </div>
    </div>
    <div v-if="initialRate !== 100" class="flex align-items-center p-float-label">
      <InputNumber input-id="positionGainBlocksAmount" :min="0" :max="3" showButtons :step="1"
                   v-model="positionGainBlocksAmount"/>
      <label for="positionGainBlocksAmount">Количество блоков добора</label>
    </div>

    <div v-if="initialRate !== 100" class="flex gap-3">
      <div v-for="(block, index) in positionGainBlocks" v-bind:key="index" class="flex flex-column gap-2">
        <div>Блок добора {{ index + 1 }}</div>
        <div class="flex align-items-center p-float-label">
          <InputNumber :input-id="'block-' + index + '-top'" mode="decimal" suffix=" $" v-model="block.top"/>
          <label :for="'block-' + index + '-top'"></label>
        </div>
        <div class="flex align-items-center p-float-label">
          <InputNumber :input-id="'block-' + index + '-bottom'"
                       mode="decimal"
                       suffix=" $"
                       disabled
                       :model-value="(block.bottom + block.top)/2"/>
          <label :for="'block-' + index + '-bottom'"></label>
        </div>
        <div class="flex align-items-center p-float-label mb-2">
          <InputNumber :input-id="'block-' + index + '-bottom'" mode="decimal" suffix=" $" v-model="block.bottom"/>
          <label :for="'block-' + index + '-bottom'"></label>
        </div>
        <div class="flex align-items-center p-float-label">
          <InputNumber :input-id="'block-' + index + '-ratio'" suffix=" %" v-model="block.ratio"/>
          <label :for="'block-' + index + '-ratio'"></label>
        </div>
      </div>
    </div>
    <Divider/>
    <div class="flex gap-3">
      <div class="flex align-items-center p-float-label">
        <InputNumber input-id="maxLoss" v-model="maxLoss" mode="decimal" suffix=" $" />
        <label for="maxLoss">Максимальный убыток</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber input-id="positionAmount" v-model="positionAmount" mode="decimal" suffix=" $"/>
        <label for="positionAmount">Размер позиции</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

type GainBlock = {
  ratio: number;
  top: number;
  middle: number;
  bottom: number
}

const maxLoss = ref(10);
const initialRate = ref(50);
const initialPrice = ref(0);
const positionAmount = ref(0);

const positionGainBlocks = ref<GainBlock[]>([])
const positionGainBlocksAmount = ref(0)

watch(
    () => positionGainBlocksAmount.value,
    (val: number) => positionGainBlocks.value = new Array<GainBlock>(val).fill({
      top: 0.1,
      middle: 0.1,
      bottom: 0.1,
      ratio: calculateRatio(initialRate.value, val)
    })
)
watch(
    () => initialRate.value,
    (val: number) => positionGainBlocks.value.forEach(
        (block: GainBlock) => block.ratio = calculateRatio(val, positionGainBlocksAmount.value)
    ));


function calculateRatio(initRate: number, blockAmount: number): number {
  return Math.floor((100 - initRate) / blockAmount);
}
</script>

<style>
.p-divider.p-divider-horizontal {
  background-color: var(--primary-color);
  height: 1px
}
</style>
