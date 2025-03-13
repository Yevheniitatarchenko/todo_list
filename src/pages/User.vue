<script setup>
import { onMounted, watch, reactive, ref, inject } from "vue";
import { useRoute } from "vue-router";
import { useVuelidate } from "@vuelidate/core";
import { required, numeric } from "@vuelidate/validators";
import api from "../utils/axios";
import debounce from "lodash.debounce";

import Select from "../components/Select.vue";
import Input from "../components/Input.vue";

const notify = inject("notify");
const route = useRoute();

const user = ref({});
const todos = ref([]);
const newTodos = ref([]);

const formCreateTodo = reactive({
  userId: "",
  title: "",
  isFavorite: false,
});
const rules = {
  userId: {
    required,
    numeric,
  },
  title: {
    required,
  },
};
const v$ = useVuelidate(rules, formCreateTodo);

const formSortBy = reactive({
  status: "",
  userId: "",
  title: "",
});

const statusItems = reactive([
  { value: null, label: "All" },
  { value: true, label: "Completed" },
  { value: false, label: "Uncompleted" },
  { value: "", label: "Favorites" },
]);

const idUsersFromTodos = ref([{ value: null, label: "All" }]);

onMounted(async () => {
  const resUsers = await api.get(`/users/${route.params.id}`);
  user.value = resUsers.data;

  const resTodos = await api.get("/todos");
  const modifiedResTodos = resTodos.data.map((item) => {
    return {
      ...item,
      isFavorite: false,
    };
  });
  const resNewTodos = JSON.parse(localStorage.getItem("newTodos")) || [];
  newTodos.value = resNewTodos;
  const listFavoritesTodoId = localStorage.getItem("favorites");
  const newModifiedResTodos = [...resNewTodos, ...modifiedResTodos];

  if (listFavoritesTodoId) {
    for (let id of listFavoritesTodoId.split(",")) {
      const todo = newModifiedResTodos.find(
        (todo) => Number(todo.id) === Number(id)
      );
      if (todo) todo.isFavorite = true;
    }
  }
  todos.value = newModifiedResTodos;

  const usersId = resTodos.data.map((item) => item.userId);
  const uniqueUsersId = [...new Set(usersId)];
  uniqueUsersId.forEach((item) =>
    idUsersFromTodos.value.push({ value: item, label: item })
  );
});

watch(formSortBy, (value) => {
  filterSortBy(value);
});

const filterSortBy = debounce(async (value) => {
  let payload = {
    completed: typeof value.status === "boolean" ? value.status : "",
    id: typeof value.status === "string" ? value.status : "",
    userId: value.userId ? value.userId : "",
    title: value.title,
  };
  for (var propName in payload) {
    if (payload[propName] === "") {
      delete payload[propName];
    }
  }
  const searchParams = new URLSearchParams(payload).toString();
  const resTodos = await api.get(
    `/todos${searchParams ? `?${searchParams}` : ""}`
  );
  todos.value = resTodos.data;
}, 300);

const createTodo = async () => {
  v$.value.$touch();
  if (!v$.value.$invalid) {
    const res = await api.post("/todos", formCreateTodo);
    const newTodo = {
      ...res.data,
      id: formCreateTodo.userId,
    };

    todos.value.unshift(newTodo);
    newTodos.value.unshift(newTodo);
    formCreateTodo.userId = "";
    formCreateTodo.title = "";
    localStorage.setItem("newTodos", JSON.stringify(newTodos.value));

    v$.value.$reset();
    notify("Success create todo!", "success");
  }
};

const setToFavorites = (id) => {
  const favorites = localStorage.getItem("favorites");
  if (favorites) {
    localStorage.setItem("favorites", favorites.concat(",", id.toString()));
    statusItems[3].value = localStorage.getItem("favorites");
  } else {
    localStorage.setItem("favorites", id.toString());
    statusItems[3].value = localStorage.getItem("favorites");
  }
  const getCurrentTodo = todos.value.find((item) => item.id === id);
  getCurrentTodo.isFavorite = true;

  notify("Success add todo to favorites!", "success");
};

const removeFromFavorites = (id) => {
  const favorites = localStorage.getItem("favorites");
  const filteredFavorites = favorites
    .split(",")
    .filter((fvId) => fvId !== id.toString())
    .join(",");
  localStorage.setItem("favorites", filteredFavorites);

  const getCurrentTodo = todos.value.find((item) => item.id === id);
  getCurrentTodo.isFavorite = false;

  const newTodo = newTodos.value.find((item) => item.id === id);
  if (newTodo) newTodo.isFavorite = false;
  localStorage.setItem("newTodos", JSON.stringify(newTodos.value));

  notify("Success remove todo from favorites!", "error");
};
</script>

<template>
  <div class="h-full p-8">
    <div class="text-white mb-10">
      <h1 class="text-2xl font-bold mb-4">User info:</h1>
      <ul class="list-disc pl-4">
        <li>Name: {{ user.username }}</li>
        <li>Phone: {{ user.phone }}</li>
        <li>Email: {{ user.email }}</li>
      </ul>
    </div>

    <div class="flex items-center justify-center flex-col">
      <div class="flex items-center justify-center mb-20">
        <form class="flex flex-col gap-4 xl:flex-row">
          <Select
            v-model="formSortBy.status"
            :label="'Status'"
            :items="statusItems"
          />
          <Select
            v-model="formSortBy.userId"
            :label="'User ID'"
            :items="idUsersFromTodos"
          />
          <Input v-model="formSortBy.title" :label="'Search by title'" />
        </form>
      </div>

      <div class="flex items-center justify-center flex-col w-full max-w-3xl">
        <h2 class="text-2xl font-bold mb-4 text-white">Todos</h2>

        <div class="bg-white rounded-lg w-full">
          <div class="flex items-center justify-center flex-col p-5 w-full">
            <h2 class="text-2xl font-bold mb-4 text-gray-700">Create todo</h2>
            <form class="flex flex-col w-full gap-4 lg:flex-row mb-5">
              <Input
                v-model="formCreateTodo.userId"
                :label="'User ID'"
                :error="v$.userId.$errors[0]?.$message"
                :colorLabel="'text-gray-700'"
                :width="'full'"
              />
              <Input
                v-model="formCreateTodo.title"
                :label="'Title'"
                :error="v$.title.$errors[0]?.$message"
                :colorLabel="'text-gray-700'"
                :width="'full'"
              />
            </form>
            <button
              class="w-40 bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition ml-auto cursor-pointer"
              @click.prevent="createTodo"
            >
              Create todo
            </button>
          </div>

          <hr class="border-t-2 border-gray-700 my-5" />

          <div
            class="relative flex w-full max-h-110 h-full flex-col border-slate-200"
          >
            <h2 class="text-2xl font-bold mb-4 text-gray-700 text-center">
              Todo list
            </h2>
            <div class="flex flex-col gap-1 p-1.5 shadow-sm overflow-y-scroll">
              <div
                role="button"
                class="flex w-full items-center justify-between min-h-14 text-slate-800 rounded-md px-3 transition-all hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"
                v-for="(todo, key) in todos"
                :key="key"
              >
                <p class="text-slate-500 text-sm">
                  {{ todo.title }}
                </p>
                <button
                  class="min-w-40 w-40 bg-blue-600 text-white p-1 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  v-if="!todo.isFavorite"
                  @click="setToFavorites(todo.id)"
                >
                  Add to favorites
                </button>
                <button
                  class="min-w-40 w-40 bg-red-600 text-white p-1 rounded-lg hover:bg-red-700 transition cursor-pointer"
                  v-if="todo.isFavorite"
                  @click="removeFromFavorites(todo.id)"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
