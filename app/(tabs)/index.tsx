import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {

  const today = new Date();
  const todayKey = today.toDateString();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
  const date = today.toLocaleDateString();

  // ---------------- TASKS ----------------
  const baseSections = {
    Morning: [
      { id: "1", name: "Lemon Water 🍋", note: "Start fresh 💧", done: false },
      { id: "2", name: "Workout 💪", note: "Discipline builds you 🔥", done: false },
      { id: "3", name: "Smoothie 🥤", note: "Fuel your body 🌱", done: false },
    ],
    Afternoon: [
      { id: "4", name: "Lunch 🍛", note: "Eat mindfully 🍽", done: false },
    ],
    Evening: [
      { id: "5", name: "Vegetable Bowl 🥗", note: "Stay healthy 🌿", done: false },
    ],
    Night: [
      { id: "6", name: "Dinner 🍽", note: "Keep it light 🌙", done: false },
      { id: "7", name: "Skincare ✨", note: "Self care 💖", done: false },
    ]
  };

  const [sections, setSections] = useState(baseSections);

  // ---------------- DANCE LOGIC ----------------
  useEffect(() => {
    setSections(prev => {
      const updated = JSON.parse(JSON.stringify(prev));

      if (["Thursday", "Friday", "Saturday"].includes(dayName)) {
        if (!updated.Evening.some(t => t.id === "dance")) {
          updated.Evening.push({
            id: "dance",
            name: "Dance Class 💃",
            note: "Enjoy movement 💃",
            done: false
          });
        }
      }

      if (dayName === "Sunday") {
        if (!updated.Morning.some(t => t.id === "danceSun")) {
          updated.Morning.push({
            id: "danceSun",
            name: "Dance Class 💃",
            note: "Start energetic 🌞",
            done: false
          });
        }
        if (!updated.Afternoon.some(t => t.id === "family")) {
          updated.Afternoon.push({
            id: "family",
            name: "Family Time ❤️",
            note: "Moments matter 🤍",
            done: false
          });
        }
      }

      return updated;
    });
  }, []);

  const toggleTask = (section: string, id: string) => {
    const updated = { ...sections };
    updated[section] = updated[section].map(task =>
      task.id === id ? { ...task, done: !task.done } : task
    );
    setSections(updated);
  };

  // ---------------- ADD TASK ----------------
  const [newTask, setNewTask] = useState("");
  const [selectedSection, setSelectedSection] = useState("Morning");

  const addTask = () => {
    if (!newTask) return;

    const updated = { ...sections };
    updated[selectedSection].push({
      id: Date.now().toString(),
      name: newTask,
      note: "Stay consistent 💫",
      done: false
    });

    setSections(updated);
    setNewTask("");
  };

  // ---------------- WATER ----------------
  const [water, setWater] = useState(0);
  const waterGoal = 6;

  // ---------------- STUDY ----------------
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval: any;
    if (running) {
      interval = setInterval(() => setSeconds(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [running]);

  const studyHours = (seconds / 3600).toFixed(1);

  const stopStudy = () => {
    setRunning(false);
    setSeconds(0);
  };

  // ---------------- SLEEP ----------------
  const [sleepStart, setSleepStart] = useState<number | null>(null);
  const [sleepHours, setSleepHours] = useState(0);
  const sleepGoal = 7;

  const startSleep = () => setSleepStart(Date.now());

  const stopSleep = () => {
    if (sleepStart === null) return;
    const hours = (Date.now() - sleepStart) / (1000 * 60 * 60);
    setSleepHours(Number(hours.toFixed(1)));
    setSleepStart(null);
  };

  // ---------------- YESTERDAY + STREAK ----------------
  const [yesterdayStudy, setYesterdayStudy] = useState("0");
  const [yesterdayWater, setYesterdayWater] = useState(0);
  const [yesterdaySleep, setYesterdaySleep] = useState(0);
  const [yesterdayTasks, setYesterdayTasks] = useState({});
  const [streaks, setStreaks] = useState({});

  // ---------------- STORAGE ----------------
  const saveData = async () => {
    const taskStatus: any = {};

    Object.keys(sections).forEach(section => {
      sections[section].forEach(task => {
        taskStatus[task.name] = task.done;
      });
    });

    const data = {
      water,
      study: seconds,
      sleep: sleepHours,
      tasks: taskStatus,
      streaks,
      date: todayKey,
    };

    await AsyncStorage.setItem("todayData", JSON.stringify(data));
  };

  const loadData = async () => {
    const saved = await AsyncStorage.getItem("todayData");

    if (saved) {
      const parsed = JSON.parse(saved);

      if (parsed.date === todayKey) {
        setWater(parsed.water || 0);
        setSeconds(parsed.study || 0);
        setSleepHours(parsed.sleep || 0);
        setStreaks(parsed.streaks || {});
      } else {
        await AsyncStorage.setItem("yesterdayData", saved);
      }
    }

    const yesterday = await AsyncStorage.getItem("yesterdayData");

    if (yesterday) {
      const parsed = JSON.parse(yesterday);

      setYesterdayStudy((parsed.study / 3600).toFixed(1));
      setYesterdayWater(parsed.water || 0);
      setYesterdaySleep(parsed.sleep || 0);
      setYesterdayTasks(parsed.tasks || {});

      // 🔥 Streak Logic
      let updatedStreaks: any = { ...parsed.streaks };

      Object.keys(parsed.tasks || {}).forEach(task => {
        if (parsed.tasks[task]) {
          updatedStreaks[task] = (updatedStreaks[task] || 0) + 1;
        } else {
          updatedStreaks[task] = 0;
        }
      });

      setStreaks(updatedStreaks);
    }
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { saveData(); }, [water, seconds, sleepHours, sections, streaks]);

  // ---------------- UI ----------------
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 100 }}>

        <Text style={styles.title}>Change 🌸</Text>
        <Text style={styles.date}>{dayName}, {date}</Text>

        {Object.keys(sections).map(section => (
          <View key={section}>
            <Text style={styles.sectionTitle}>{section}</Text>

            {sections[section].map(task => (
              <TouchableOpacity
                key={task.id}
                style={[styles.taskCard, task.done && styles.taskDone]}
                onPress={() => toggleTask(section, task.id)}
              >
                <View>
                  <Text style={[styles.taskText, task.done && styles.doneText]}>
                    {task.name}
                  </Text>

                  <Text style={styles.note}>{task.note}</Text>

                  <Text style={styles.note}>
                    Yesterday: {
                      yesterdayTasks[task.name] === undefined
                        ? "No data"
                        : yesterdayTasks[task.name]
                        ? "Done ✅"
                        : "Missed ❌"
                    }
                  </Text>

                  <Text style={styles.note}>
                    🔥 Streak: {streaks[task.name] || 0} days
                  </Text>
                </View>
                <Text>{task.done ? "✔" : "○"}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* ADD TASK */}
        <View style={styles.addBox}>
          <TextInput placeholder="Add task..." value={newTask} onChangeText={setNewTask} />

          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {["Morning", "Afternoon", "Evening", "Night"].map(sec => (
              <TouchableOpacity key={sec} onPress={() => setSelectedSection(sec)}>
                <Text style={selectedSection === sec ? styles.selected : styles.option}>
                  {sec}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.addButton} onPress={addTask}>
            <Text style={{ color: "white" }}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* WATER */}
        <View style={styles.card}>
          <Text>💧 Water: {water}/{waterGoal}</Text>
          <Text style={styles.note}>
            {water < waterGoal ? `Drink ${waterGoal - water} more 💧` : "Great job 🎉"}
          </Text>
          <Text style={styles.note}>Yesterday: {yesterdayWater}</Text>
          <TouchableOpacity onPress={() => setWater(water + 1)}>
            <Text style={styles.button}>+1</Text>
          </TouchableOpacity>
        </View>

        {/* STUDY */}
        <View style={styles.card}>
          <Text>📚 Study: {studyHours} hrs</Text>
          <Text style={styles.note}>
            {Number(studyHours) < 2 ? "Minimum 2 hrs ⚡" : "Good progress 🔥"}
          </Text>
          <Text style={styles.note}>Yesterday: {yesterdayStudy} hrs</Text>

          <TouchableOpacity onPress={() => setRunning(!running)}>
            <Text style={styles.button}>{running ? "Pause" : "Start"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopStudy}>
            <Text style={styles.button}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* SLEEP */}
        <View style={styles.card}>
          <Text>😴 Sleep: {sleepHours} hrs</Text>
          <Text style={styles.note}>
            {sleepHours < sleepGoal ? "Aim 7+ hrs 🌙" : "Well rested 💖"}
          </Text>
          <Text style={styles.note}>Yesterday: {yesterdaySleep} hrs</Text>

          <TouchableOpacity onPress={startSleep}>
            <Text style={styles.button}>
              {sleepStart ? "Sleeping..." : "Start"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={stopSleep}>
            <Text style={styles.button}>Stop</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#ffe4ec", padding: 15 },
  title: { fontSize: 30, textAlign: "center", fontWeight: "bold" },
  date: { textAlign: "center", color: "gray", marginBottom: 10 },
  sectionTitle: { fontSize: 20, marginTop: 15, fontWeight: "bold" },

  taskCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },

  taskDone: { backgroundColor: "#ffd6e0" },
  taskText: { fontSize: 16 },
  doneText: { textDecorationLine: "line-through", color: "gray" },
  note: { fontSize: 12, color: "gray" },

  addBox: { marginTop: 20, backgroundColor: "#fff", padding: 10, borderRadius: 10 },
  addButton: {
    backgroundColor: "#ff6f91",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
    alignItems: "center"
  },

  option: { color: "gray" },
  selected: { color: "#ff6f91", fontWeight: "bold" },

  card: {
    marginTop: 15,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 15
  },

  button: { color: "#ff6f91", marginTop: 5 }
});