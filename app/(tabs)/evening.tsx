import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadData, saveData } from "../store";

export default function Evening() {
  const router = useRouter();

  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => { init(); }, []);

  const init = async () => {
    const stored = await loadData();
    setData(stored);
    setTasks(stored.Evening || []);
  };

  const updateData = async (updatedTasks) => {
    const newData = { ...data, Evening: updatedTasks };
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

  const deleteTask = (id) => {
    const updated = tasks.filter(t => t.id !== id);
    updateData(updated);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    const updated = [
      ...tasks,
      { id: Date.now().toString(), name: newTask, done: false },
    ];
    setNewTask("");
    updateData(updated);
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  return (
    <LinearGradient colors={["#fce4ec", "#f8bbd0", "#f48fb1"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Evening 🌆</Text>
          <Text style={styles.subtitle}>Reset, refocus, recharge ✨</Text>
          
          {totalCount > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>{completedCount} of {totalCount} completed</Text>
            </View>
          )}
        </View>

        {tasks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌆</Text>
            <Text style={styles.emptyText}>No evening tasks yet</Text>
            <Text style={styles.emptySubtext}>Reflect and prepare for tomorrow!</Text>
          </View>
        ) : (
          tasks.map(task => (
            <View key={task.id} style={styles.taskWrapper}>
              <TouchableOpacity
                style={[styles.card, task.done && styles.doneCard]}
                onPress={() => toggleTask(task.id)}
                activeOpacity={0.7}
              >
                <View style={styles.taskContent}>
                  <Text style={styles.taskIcon}>{task.done ? "✅" : "⭕"}</Text>
                  <Text style={task.done ? styles.doneText : styles.text}>
                    {task.name}
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.deleteBtn}
                onPress={() => deleteTask(task.id)}
              >
                <Text style={styles.deleteIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <View style={styles.inputBox}>
          <TextInput
            placeholder="Add something..."
            placeholderTextColor="#ccc"
            value={newTask}
            onChangeText={setNewTask}
            style={styles.input}
            onSubmitEditing={addTask}
          />
          <TouchableOpacity 
            style={[styles.addBtn, newTask.trim() === "" && styles.addBtnDisabled]} 
            onPress={addTask}
            activeOpacity={0.7}
          >
            <Text style={styles.btnText}>＋</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={() => router.push("/night")}
          activeOpacity={0.8}
        >
          <Text style={styles.nextText}>Next →</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 25, 
    alignItems: "center",
    paddingBottom: 40
  },

  header: {
    width: "100%",
    marginBottom: 25,
    alignItems: "center"
  },

  title: { 
    fontSize: 38, 
    fontWeight: "900",
    marginTop: 15,
    color: "#c2185b",
    textAlign: "center"
  },

  subtitle: {
    fontSize: 15,
    color: "#d81b60",
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "600"
  },

  progressContainer: {
    width: "95%",
    alignItems: "center"
  },

  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#c2185b",
    borderRadius: 3
  },

  progressText: {
    fontSize: 12,
    color: "#a1184a",
    fontWeight: "600"
  },

  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    width: "100%"
  },

  emptyEmoji: {
    fontSize: 60,
    marginBottom: 15
  },

  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#a1184a",
    marginBottom: 8
  },

  emptySubtext: {
    fontSize: 14,
    color: "#d81b60",
    textAlign: "center"
  },

  taskWrapper: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: "5%"
  },

  card: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: "#c2185b"
  },

  doneCard: { 
    backgroundColor: "#f8bbd0",
    borderLeftColor: "#4caf50"
  },

  taskContent: {
    flexDirection: "row",
    alignItems: "center"
  },

  taskIcon: {
    fontSize: 18,
    marginRight: 12
  },

  text: { 
    textAlign: "left", 
    fontSize: 15,
    flex: 1,
    color: "#212121",
    fontWeight: "500"
  },

  doneText: {
    textAlign: "left",
    fontSize: 15,
    flex: 1,
    textDecorationLine: "line-through",
    color: "gray",
    fontWeight: "500"
  },

  deleteBtn: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "#ffebee",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    width: 36,
    height: 36
  },

  deleteIcon: {
    fontSize: 16,
    color: "#c62828",
    fontWeight: "bold"
  },

  inputBox: {
    flexDirection: "row",
    width: "100%",
    marginTop: 25,
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginHorizontal: "5%"
  },

  input: { 
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 14,
    color: "#212121"
  },

  addBtn: {
    backgroundColor: "#c2185b",
    borderRadius: 50,
    padding: 10,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40
  },

  addBtnDisabled: {
    backgroundColor: "#ccc"
  },

  btnText: { 
    color: "#fff", 
    fontSize: 18,
    fontWeight: "bold"
  },

  nextBtn: {
    marginTop: 30,
    marginBottom: 15,
    backgroundColor: "#c2185b",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#c2185b",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6
  },

  nextText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});