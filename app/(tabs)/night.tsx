import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadData, saveData } from "../store";


export default function Night() {
  const router = useRouter();

  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => { init(); }, []);

  const init = async () => {
    const stored = await loadData();
    setData(stored);
    setTasks(stored.Night);
  };

  const updateData = async (updatedTasks) => {
    const newData = { ...data, Night: updatedTasks };
    setData(newData);
    setTasks(updatedTasks);
    await saveData(newData);
  };

  const toggleTask = (id) => {
    const updated = tasks.map(t =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    updateData(updated);
  };

  const addTask = () => {
    if (!newTask) return;
    const updated = [
      ...tasks,
      { id: Date.now().toString(), name: newTask, done: false },
    ];
    setNewTask("");
    updateData(updated);
  };

  const finishDay = () => {
    const quotes = [
      "You showed up today 💖",
      "Progress > perfection 🌸",
      "You’re building discipline 🔥",
      "Proud of you, keep going ✨"
    ];

    const random = quotes[Math.floor(Math.random() * quotes.length)];

    Alert.alert("Day Complete 🌙", random, [
      { text: "OK", onPress: () => router.push("/") }
    ]);
  };

  return (
    <ThemedGradient>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={styles.title}>Night 🌙</Text>
        <Text style={styles.subtitle}>Wind down peacefully 💫</Text>

        {tasks.map(task => (
          <TouchableOpacity
            key={task.id}
            style={[styles.card, task.done && styles.doneCard]}
            onPress={() => toggleTask(task.id)}
          >
            <Text style={task.done ? styles.doneText : styles.text}>
              {task.done ? "✔ " : "○ "} {task.name}
            </Text>
          </TouchableOpacity>
        ))}

        <View style={styles.inputBox}>
          <TextInput
            placeholder="Add something..."
            value={newTask}
            onChangeText={setNewTask}
            style={styles.input}
          />
          <TouchableOpacity style={styles.addBtn} onPress={addTask}>
            <Text style={styles.btnText}>＋</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={finishDay}>
          <Text style={styles.nextText}>Finish Day 🌸</Text>
        </TouchableOpacity>

      </ScrollView>
    </ThemedGradient>
  );

}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.xl,
    alignItems: "center",
    flexGrow: 1
  },

  title: {
    fontSize: 48,
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    textAlign: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.md
  },

  subtitle: {
    fontSize: 20,
    color: Colors.light.icon,
    marginBottom: Spacing.lg,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 26
  },

  card: {
    width: "92%",
    backgroundColor: Colors.light.glass,
    borderRadius: BorderRadius.card,
    marginVertical: Spacing.sm,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.glassBorder,
    ...Shadows.card,
    alignItems: "center"
  },

  doneCard: {
    backgroundColor: Colors.light.success + '20',
    borderColor: Colors.light.success
  },

  text: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600"
  },

  doneText: {
    fontSize: 18,
    textAlign: "center",
    textDecorationLine: "line-through",
    color: Colors.light.icon
  },

  inputBox: {
    flexDirection: "row",
    marginTop: Spacing.lg,
    width: "92%",
    backgroundColor: Colors.light.glass,
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    alignItems: "center",
    ...Shadows.card,
    borderWidth: 1,
    borderColor: Colors.light.glassBorder
  },

  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: Colors.light.text
  },

  addBtn: {
    backgroundColor: Colors.light.accent,
    borderRadius: BorderRadius.small,
    padding: 14,
    marginLeft: Spacing.sm
  },

  btnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700"
  },

  nextBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl * 1.5,
    borderRadius: BorderRadius.button,
    backgroundColor: Colors.light.accent,
    ...Shadows.button,
    alignSelf: "center",
    marginBottom: Spacing.xl
  },

  nextText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
    fontFamily: Fonts.rounded
  }
});
