import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { loadData, saveData } from "../store";

export default function Morning() {
  const router = useRouter();

  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const stored = await loadData();
    setData(stored);
    setTasks(stored.Morning || []);
  };

  const updateData = async (updatedTasks) => {
    const newData = { ...data, Morning: updatedTasks };
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
    const updated = [...tasks, { id: Date.now().toString(), name: newTask, done: false }];
    setNewTask("");
    updateData(updated);
  };

  const completedCount = tasks.filter(t => t.done).length;
  const totalCount = tasks.length;

  return (
    <LinearGradient colors={["#fff3e0", "#ffe0b2", "#ffccbc"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Morning 🌅</Text>
          <Text style={styles.subtitle}>Win your morning, win your day 💖</Text>
          
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
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No tasks yet</Text>
            <Text style={styles.emptySubtext}>Add your first morning task to get started!</Text>
          </View>
        ) : (
          tasks.map((task, index) => (
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

        {/* ADD TASK */}
        <View style={styles.inputBox}>
          <TextInput
            placeholder="Add something extra..."
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

        {/* NEXT */}
        <TouchableOpacity 
          style={styles.nextBtn} 
          onPress={() => router.push("/afternoon")}
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
    textAlign: "center",
    marginTop: 15,
    color: "#e65100"
  },

  subtitle: {
    fontSize: 16,
    color: "#d84315",
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
    backgroundColor: "#ff6f00",
    borderRadius: 3
  },

  progressText: {
    fontSize: 12,
    color: "#bf360c",
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
    color: "#bf360c",
    marginBottom: 8
  },

  emptySubtext: {
    fontSize: 14,
    color: "#d84315",
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
    borderLeftColor: "#ff6f00"
  },

  doneCard: {
    backgroundColor: "#ffe0b2",
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
    fontSize: 15,
    flex: 1,
    color: "#212121",
    fontWeight: "500"
  },

  doneText: {
    fontSize: 15,
    flex: 1,
    textDecorationLine: "line-through",
    color: "#888",
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
    marginTop: 25,
    width: "100%",
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
    backgroundColor: "#ff6f91",
    borderRadius: 50,
    padding: 10,
    marginLeft: 10
  },

  btnText: {
    color: "#fff",
    fontSize: 18
  },

  nextBtn: {
    marginTop: 30,
    backgroundColor: "#ff6f91",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30
  },

  nextText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16
  }
});