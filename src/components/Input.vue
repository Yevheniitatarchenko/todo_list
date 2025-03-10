<script setup>
import { ref, toRef, watch } from "vue";

const props = defineProps({
  modelValue: { type: String, default: null },
  label: { type: String, default: "" },
  colorLabel: { type: String, default: "text-white" },
  width: { type: [Number, String], default: 90 },
  error: { type: String, default: "" },
});

const emit = defineEmits(["update:modelValue"]);

const modelValue = toRef(props, "modelValue");
const innerValue = ref(null);

watch(innerValue, (value) => {
  emit("update:modelValue", value);
});
</script>

<template>
  <div :class="`w-${props.width}`">
    <label :class="['block mb-2 font-medium', props.colorLabel]">
      {{ props.label }}
    </label>
    <input
      type="text"
      :placeholder="props.label"
      class="w-full p-2 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
      v-model="innerValue"
    />
    <div class="h-5">
      <span v-if="props.error" class="text-red-500">
        {{ props.error }}
      </span>
    </div>
  </div>
</template>
