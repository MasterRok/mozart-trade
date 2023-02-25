<template>
  <div class="flex flex-column align-items-center gap-5">
    <div class="flex flex-column gap-5">
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="initialRate"
                     input-id="initialRate"
                     suffix=" %"
                     class="w-full"
                     :max="100"/>
        <label for="initialRate">Вход по рынку</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="initialPrice"
                     input-id="initialPrice"
                     suffix=" $"
                     class="w-full"
                     :minFractionDigits="1"
                     :maxFractionDigits="10"/>
        <label for="initialPrice">Текущая цена</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="stopLossPrice"
                     input-id="stopLossPrice"
                     suffix=" $"
                     class="w-full"
                     :minFractionDigits="1"
                     :maxFractionDigits="10"/>
        <label for="stopLossPrice">STOP цена</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="leverage"
                     :min="1"
                     :max="100"
                     :step="1"
                     input-id="leverage"
                     showButtons/>
        <label for="positionGainBlocksAmount">Плечо</label>
      </div>
    </div>
    <div v-if="initialRate !== 100" class="flex align-items-center p-float-label">
      <InputNumber v-model="positionGainBlocksAmount"
                   :min="0"
                   :max="3"
                   :step="1"
                   input-id="positionGainBlocksAmount"
                   showButtons/>
      <label for="positionGainBlocksAmount">Количество блоков добора</label>
    </div>

    <div v-if="initialRate !== 100" class="position-gain-blocks">
      <div v-for="(block, index) in positionGainBlocks" v-bind:key="index"
           class="flex flex-column gap-2">
        <div>Блок добора {{ index + 1 }}</div>
        <div class="flex align-items-center p-float-label">
          <InputNumber v-model="block.top"
                       mode="decimal"
                       suffix=" $"
                       :input-id="'block-' + index + '-top'"
                       :min="0"
                       :minFractionDigits="1"
                       :maxFractionDigits="10"
                       @update:modelValue="block.middle = (block?.bottom + $event)/2"/>
          <label :for="'block-' + index + '-top'"></label>
        </div>
        <div class="flex align-items-center p-float-label">
          <InputNumber v-model="block.middle"
                       disabled
                       mode="decimal"
                       suffix=" $"
                       :minFractionDigits="1"
                       :maxFractionDigits="10"
                       :input-id="'block-' + index + '-bottom'"/>
          <label :for="'block-' + index + '-middle'"></label>
        </div>
        <div class="flex align-items-center p-float-label mb-2">
          <InputNumber v-model="block.bottom"
                       mode="decimal"
                       suffix=" $"
                       :input-id="'block-' + index + '-bottom'"
                       :min="0"
                       :minFractionDigits="1"
                       :maxFractionDigits="10"
                       @update:modelValue="block.middle = (block?.top + $event)/2"/>
          <label :for="'block-' + index + '-bottom'"></label>
        </div>
        <div class="flex align-items-center p-float-label">
          <InputNumber v-model="block.ratio"
                       suffix=" %"
                       :input-id="'block-' + index + '-ratio'"
                       :min="0"
                       :max="100"
                       :minFractionDigits="1"
                       :maxFractionDigits="10"/>
          <label :for="'block-' + index + '-ratio'"></label>
        </div>
      </div>
    </div>
    <Divider/>
    <div class="flex gap-5 justify-content-center flex-wrap">
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="maxLoss"
                     disabled
                     input-id="maxLoss"
                     mode="decimal"
                     suffix=" $"
                     :min="0"
                     :minFractionDigits="1"
                     :maxFractionDigits="10"/>
        <label for="maxLoss">Максимальный убыток</label>
      </div>
      <div class="flex align-items-center p-float-label">
        <InputNumber v-model="positionAmount"
                     input-id="positionAmount"
                     mode="decimal"
                     suffix=" $"
                     :min="0"
                     :minFractionDigits="1"
                     :maxFractionDigits="10"
                     @update:modelValue="onPositionAmountChange"/>
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

const maxLoss = ref(0);
const initialRate = ref(50);
const initialPrice = ref(0);
const positionAmount = ref(0);
const stopLossPrice = ref(0);
const leverage = ref(1);

const positionGainBlocks = ref<GainBlock[]>([])
const positionGainBlocksAmount = ref(0)

watch(
    () => positionGainBlocksAmount.value,
    (val: number, prevVal: number) => {
      if (val > prevVal) {
        positionGainBlocks.value.push({
          top: 0,
          middle: 0,
          bottom: 0,
          ratio: calculateRatio(initialRate.value, val),
        })
        recalculateBlocksRatio();
      } else {
        positionGainBlocks.value.pop();
      }
    }
)
watch(
    () => initialRate.value,
    () => recalculateBlocksRatio()
);

watch(
    () => leverage.value,
    () => onPositionAmountChange(positionAmount.value)
);


function calculateRatio(initRate: number, blockAmount: number): number {
  return Math.floor((100 - initRate) / blockAmount);
}

function recalculateBlocksRatio(): void {
  positionGainBlocks.value.forEach(
      (block: GainBlock) => block.ratio = calculateRatio(initialRate.value, positionGainBlocksAmount.value)
  )
}

function onPositionAmountChange(value: number): void {
  let fullTokenAmount = value * initialRate.value / 100 / initialPrice.value;
  positionGainBlocks.value.forEach((block: GainBlock) => {
    const blockOrderAmount = value * (block.ratio / 100) / 3;
    const topTokenAmount = blockOrderAmount / block.top;
    const middleTokenAmount = blockOrderAmount / block.middle;
    const bottomTokenAmount = blockOrderAmount / block.bottom;
    fullTokenAmount += topTokenAmount + middleTokenAmount + bottomTokenAmount;
  });
  const averagePrice = value / fullTokenAmount;
  maxLoss.value = Math.abs(fullTokenAmount * (stopLossPrice.value - averagePrice) * leverage.value) || 0;
}

</script>

<style>
.p-divider.p-divider-horizontal {
  background-color: var(--primary-color);
  height: 1px;
}

.position-gain-blocks {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

@media screen and (max-width: 650px) {
  .position-gain-blocks {
    flex-wrap:wrap;
  }
}
</style>
