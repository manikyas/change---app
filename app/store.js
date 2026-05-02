import AsyncStorage from "@react-native-async-storage/async-storage";

export const baseData = {
  Morning: [
    { id: "1", name: "Lemon Water 🍋", done: false },
    { id: "2", name: "Workout 💪", done: false },
    { id: "3", name: "Smoothie 🥤", done: false },
  ],
  Afternoon: [
    { id: "4", name: "Lunch 🍛", done: false },
    { id: "5", name: "Water 💧", done: false },
  ],
  Evening: [
    { id: "6", name: "Vegetable Bowl 🥗", done: false },
    { id: "7", name: "Dance 💃", done: false },
  ],
  Night: [
    { id: "8", name: "Dinner 🍽", done: false },
    { id: "9", name: "Skincare ✨", done: false },
  ],
};

export const loadData = async () => {
  const data = await AsyncStorage.getItem("appData");
  return data ? JSON.parse(data) : baseData;
};

export const saveData = async (data) => {
  await AsyncStorage.setItem("appData", JSON.stringify(data));
};