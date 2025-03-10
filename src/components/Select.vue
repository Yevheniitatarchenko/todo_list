<script setup>
import { ref, toRef, watch } from "vue";

const props = defineProps({
  modelValue: { type: [Number, Boolean, String], default: null },
  label: { type: String, default: "" },
  items: { type: Array, default: [] },
});

const emit = defineEmits(["update:modelValue"]);

const modelValue = toRef(props, "modelValue");
const innerValue = ref(null);

watch(innerValue, (value) => {
  emit("update:modelValue", value);
});
</script>

<template>
  <div class="w-90">
    <label class="block mb-2 text-white font-medium">{{ props.label }}</label>
    <select
      class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
      v-model="innerValue"
    >
      <option v-for="(item, key) in props.items" :key="key" :value="item.value">
        {{ item.label }}
      </option>
    </select>
  </div>
</template>
