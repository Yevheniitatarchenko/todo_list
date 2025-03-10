<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, alpha, helpers } from "@vuelidate/validators";
import api from "../utils/axios";

import Input from "../components/Input.vue";

const router = useRouter();

const form = reactive({
  username: "",
  phone: "",
});
const errorLogin = ref(false);

const onlySymbolsAndNumbers = helpers.regex(
  /^[0-9.'\-\/«».,():’— №!";+=*\sx]+$/
);
const rules = {
  username: {
    required,
    alpha,
  },
  phone: {
    required,
    onlySymbolsAndNumbers: helpers.withMessage(
      "Only numbers and special characters!",
      onlySymbolsAndNumbers
    ),
  },
};
const v$ = useVuelidate(rules, form);

const login = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    const resUser = await api.get(
      `/users?username=${form.username}&phone=${form.phone}`
    );
    if (resUser.data.length) {
      router.push(`/user/${resUser.data[0].id}`);
    } else {
      errorLogin.value = true;
    }
  }
};
</script>

<template>
  <div class="flex items-center min-h-screen">
    <form class="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md w-96">
      <h1 class="text-2xl font-bold mb-4">Registration</h1>
      <Input
        v-model="form.username"
        :label="'User name'"
        :error="v$.username.$errors[0]?.$message"
        :colorLabel="'text-gray-700'"
        :width="'auto'"
      />
      <Input
        v-model="form.phone"
        :label="'User phone'"
        :error="v$.phone.$errors[0]?.$message"
        :colorLabel="'text-gray-700'"
        :width="'auto'"
      />
      <button
        class="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition"
        @click.prevent="login"
      >
        Login
      </button>
      <p class="text-red-500" v-if="errorLogin">Error login</p>
    </form>
  </div>
</template>
