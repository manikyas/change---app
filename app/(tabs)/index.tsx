import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { defaultDailyRecord, getDateKey, loadData, saveData } from "../store";

const DAILY_GOALS = {
  waterLiters: 3,
  sleepHours: 8,
  studyHours: 2,
};

const DANCE_SCHEDULE = {
  0: { title: "Dance Class", start: "10:00 AM", end: "11:30 AM" },
  4: { title: "Dance Class", start: "6:00 PM", end: "7:30 PM" },
  5: { title: "Dance Class", start: "6:00 PM", end: "7:30 PM" },
  6: { title: "Dance Class", start: "6:00 PM", end: "7:30 PM" },
};

const ensureDanceBlock = (recordForDay, date) => {
  const config = DANCE_SCHEDULE[date.getDay()];
  if (!config) {
    return { updatedRecord: recordForDay, changed: false };
  }

  const existing = (recordForDay.timeBlocks || []).some(block =>
    block.title === config.title && block.start === config.start && block.end === config.end
  );

  if (existing) {
    return { updatedRecord: recordForDay, changed: false };
  }

  const updatedRecord = {
    ...recordForDay,
    timeBlocks: [
      ...(recordForDay.timeBlocks || []),
      {
        id: `dance-${getDateKey(date)}`,
        title: config.title,
        start: config.start,
        end: config.end,
      },
    ],
  };

  return { updatedRecord, changed: true };
};

export default function Home() {
  const router = useRouter();

  const [data, setData] = useState({});
  const [dateKey, setDateKey] = useState("");
  const [record, setRecord] = useState(defaultDailyRecord);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [blockTitle, setBlockTitle] = useState("");
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const stored = await loadData();
    const today = new Date();
    const todayKey = getDateKey(today);
    const todayRecord = {
      ...defaultDailyRecord,
      ...(stored.dailyRecords?.[todayKey] || {}),
    };

    const { updatedRecord, changed } = ensureDanceBlock(todayRecord, today);
    const updatedData = changed
      ? {
        ...stored,
        dailyRecords: {
          ...(stored.dailyRecords || {}),
          [todayKey]: updatedRecord,
        },
      }
      : stored;

    setData(updatedData);
    setDateKey(todayKey);
    setRecord(updatedRecord);

    if (changed) {
      await saveData(updatedData);
    }
  };

  const saveRecord = async (updatedRecord) => {
    if (!dateKey) return;
    const updatedData = {
      ...data,
      dailyRecords: {
        ...(data.dailyRecords || {}),
        [dateKey]: updatedRecord,
      },
    };

    setData(updatedData);
    setRecord(updatedRecord);
    await saveData(updatedData);
  };

  const updateNumber = (field, value) => {
    const parsed = Number(value);
    const safeValue = Number.isNaN(parsed) ? 0 : parsed;
    saveRecord({ ...record, [field]: safeValue });
  };

  const addWater = (amount) => {
    const next = Math.max(0, Number((record.waterLiters + amount).toFixed(2)));
    saveRecord({ ...record, waterLiters: next });
  };

  const startSleep = () => {
    if (record.activeSleepStart) return;
    saveRecord({ ...record, activeSleepStart: Date.now() });
  };

  const stopSleep = () => {
    if (!record.activeSleepStart) return;
    const session = {
      id: Date.now().toString(),
      start: record.activeSleepStart,
      end: Date.now(),
    };
    saveRecord({
      ...record,
      activeSleepStart: null,
      sleepSessions: [...record.sleepSessions, session],
    });
  };

  const startStudy = () => {
    if (record.activeStudyStart) return;
    saveRecord({ ...record, activeStudyStart: Date.now() });
  };

  const stopStudy = () => {
    if (!record.activeStudyStart) return;
    const session = {
      id: Date.now().toString(),
      start: record.activeStudyStart,
      end: Date.now(),
    };
    saveRecord({
      ...record,
      activeStudyStart: null,
      studySessions: [...record.studySessions, session],
    });
  };

  const deleteSession = (type, id) => {
    const key = type === "sleep" ? "sleepSessions" : "studySessions";
    const updated = record[key].filter(session => session.id !== id);
    saveRecord({ ...record, [key]: updated });
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim()) return;
    const updated = [
      ...record.checklist,
      { id: Date.now().toString(), text: newChecklistItem.trim(), done: false },
    ];
    setNewChecklistItem("");
    saveRecord({ ...record, checklist: updated });
  };

  const toggleChecklistItem = (id) => {
    const updated = record.checklist.map(item =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    saveRecord({ ...record, checklist: updated });
  };

  const deleteChecklistItem = (id) => {
    const updated = record.checklist.filter(item => item.id !== id);
    saveRecord({ ...record, checklist: updated });
  };

  const addTimeBlock = () => {
    if (!blockTitle.trim() || !blockStart.trim() || !blockEnd.trim()) return;
    const updated = [
      ...record.timeBlocks,
      {
        id: Date.now().toString(),
        title: blockTitle.trim(),
        start: blockStart.trim(),
        end: blockEnd.trim(),
      },
    ];
    setBlockTitle("");
    setBlockStart("");
    setBlockEnd("");
    saveRecord({ ...record, timeBlocks: updated });
  };

  const deleteTimeBlock = (id) => {
    const updated = record.timeBlocks.filter(block => block.id !== id);
    saveRecord({ ...record, timeBlocks: updated });
  };

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!record.activeSleepStart && !record.activeStudyStart) return;
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, [record.activeSleepStart, record.activeStudyStart]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDuration = (ms) => {
    const totalMinutes = Math.max(0, Math.round(ms / 60000));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const sumSessionMinutes = (sessions) => {
    return sessions.reduce((total, session) => {
      if (!session.end) return total;
      return total + Math.max(0, session.end - session.start);
    }, 0);
  };

  const getSessionHours = (sessions, activeStart, includeActive) => {
    const baseMs = sumSessionMinutes(sessions);
    const activeMs = includeActive && activeStart ? Math.max(0, now - activeStart) : 0;
    return Number(((baseMs + activeMs) / 3600000).toFixed(2));
  };

  const sleepHours = getSessionHours(
    record.sleepSessions,
    record.activeSleepStart,
    true
  );
  const studyHours = getSessionHours(
    record.studySessions,
    record.activeStudyStart,
    true
  );

  const waterProgress = Math.min(record.waterLiters / DAILY_GOALS.waterLiters, 1);
  const sleepProgress = Math.min(sleepHours / DAILY_GOALS.sleepHours, 1);
  const studyProgress = Math.min(studyHours / DAILY_GOALS.studyHours, 1);
  const checklistDone = record.checklist.filter(item => item.done).length;

  const motivationMessages = useMemo(() => {
    const messages = [];

    if (sleepProgress < 1) {
      const remaining = Math.max(0, DAILY_GOALS.sleepHours - sleepHours).toFixed(1);
      messages.push("Plan a calm wind-down to reach 8 hours of sleep.");
    } else {
      messages.push("Sleep goal met. Your body will thank you.");
    }

    if (studyProgress < 1) {
      const remaining = Math.max(0, DAILY_GOALS.studyHours - studyHours).toFixed(1);
      messages.push(`Focus sprint: ${remaining}h more study to finish strong.`);
    } else {
      messages.push("Study goal achieved. Strong consistency today.");
    }

    if (record.checklist.length > 0) {
      messages.push(`Checklist momentum: ${checklistDone} of ${record.checklist.length} done.`);
    }

    if (record.timeBlocks.length === 0) {
      messages.push("Schedule a time block to protect your priorities.");
    }

    return messages;
  }, [waterProgress, sleepProgress, studyProgress, checklistDone, record, sleepHours, studyHours]);

  const todayLabel = new Date().toDateString();

  const weeklyHistory = useMemo(() => {
    const days = [];
    const today = new Date();

    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = getDateKey(date);
      const storedRecord = key === dateKey
        ? record
        : { ...defaultDailyRecord, ...(data.dailyRecords?.[key] || {}) };

      const sleep = getSessionHours(
        storedRecord.sleepSessions || [],
        storedRecord.activeSleepStart,
        key === dateKey
      );
      const study = getSessionHours(
        storedRecord.studySessions || [],
        storedRecord.activeStudyStart,
        key === dateKey
      );

      days.push({
        key,
        label: date.toLocaleDateString([], { month: "short", day: "numeric" }),
        water: storedRecord.waterLiters || 0,
        sleep,
        study,
      });
    }

    return days;
  }, [data.dailyRecords, dateKey, record, now]);

  return (
    <LinearGradient colors={["#fff1f2", "#ffe4ec", "#fff7f9"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Change 🌸</Text>
          <Text style={styles.subtitle}>Your daily reset and progress hub</Text>
          <View style={styles.dateContainer}>
            <Text style={styles.date}>{todayLabel}</Text>
          </View>
        </View>

        <View style={styles.card}> 
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Daily Goals</Text>
            <TouchableOpacity onPress={() => router.push("/morning")} activeOpacity={0.8}>
              <Text style={styles.linkText}>Start routine →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Water (L)</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${waterProgress * 100}%` }]} />
            </View>
            <View style={styles.goalControls}>
              <TextInput
                style={styles.goalInput}
                value={record.waterLiters ? String(record.waterLiters) : ""}
                placeholder="0"
                keyboardType="numeric"
                onChangeText={(value) => updateNumber("waterLiters", value)}
              />
              <View style={styles.quickButtons}>
                <TouchableOpacity style={styles.quickBtn} onPress={() => addWater(0.25)}>
                  <Text style={styles.quickBtnText}>+0.25</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.quickBtn} onPress={() => addWater(0.5)}>
                  <Text style={styles.quickBtnText}>+0.5</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.goalTarget}>Goal: {DAILY_GOALS.waterLiters}L</Text>
            </View>
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Sleep (hrs)</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${sleepProgress * 100}%` }]} />
            </View>
            <View style={styles.timerRow}>
              <Text style={styles.timerValue}>{sleepHours}h logged</Text>
              <TouchableOpacity
                style={[styles.timerButton, record.activeSleepStart && styles.timerStop]}
                onPress={record.activeSleepStart ? stopSleep : startSleep}
                activeOpacity={0.8}
              >
                <Text style={styles.timerButtonText}>
                  {record.activeSleepStart ? "Stop" : "Start"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.goalTarget}>Goal: {DAILY_GOALS.sleepHours}h</Text>
            </View>
            {record.activeSleepStart && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>
                  Running {formatDuration(now - record.activeSleepStart)}
                </Text>
              </View>
            )}
            {record.sleepSessions.length > 0 && (
              <View style={styles.sessionList}>
                {record.sleepSessions.map(session => (
                  <View key={session.id} style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionTime}>
                        {formatTime(session.start)} - {formatTime(session.end)}
                      </Text>
                      <Text style={styles.sessionDuration}>{formatDuration(session.end - session.start)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deleteSession("sleep", session.id)}
                    >
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.goalRow}>
            <Text style={styles.goalLabel}>Study (hrs)</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${studyProgress * 100}%` }]} />
            </View>
            <View style={styles.timerRow}>
              <Text style={styles.timerValue}>{studyHours}h logged</Text>
              <TouchableOpacity
                style={[styles.timerButton, record.activeStudyStart && styles.timerStop]}
                onPress={record.activeStudyStart ? stopStudy : startStudy}
                activeOpacity={0.8}
              >
                <Text style={styles.timerButtonText}>
                  {record.activeStudyStart ? "Stop" : "Start"}
                </Text>
              </TouchableOpacity>
              <Text style={styles.goalTarget}>Goal: {DAILY_GOALS.studyHours}h</Text>
            </View>
            {record.activeStudyStart && (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>
                  Running {formatDuration(now - record.activeStudyStart)}
                </Text>
              </View>
            )}
            {record.studySessions.length > 0 && (
              <View style={styles.sessionList}>
                {record.studySessions.map(session => (
                  <View key={session.id} style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionTime}>
                        {formatTime(session.start)} - {formatTime(session.end)}
                      </Text>
                      <Text style={styles.sessionDuration}>{formatDuration(session.end - session.start)}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => deleteSession("study", session.id)}
                    >
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Today's Schedule</Text>

          <Text style={styles.sectionLabel}>Checklist</Text>
          {record.checklist.length === 0 ? (
            <Text style={styles.helperText}>Add quick tasks for today.</Text>
          ) : (
            record.checklist.map(item => (
              <View key={item.id} style={styles.listRow}>
                <TouchableOpacity
                  style={[styles.checkItem, item.done && styles.checkItemDone]}
                  onPress={() => toggleChecklistItem(item.id)}
                  activeOpacity={0.8}
                >
                  <Text style={item.done ? styles.checkTextDone : styles.checkText}>
                    {item.done ? "✓" : "○"} {item.text}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteChecklistItem(item.id)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.flexInput}
              placeholder="Add a task..."
              value={newChecklistItem}
              onChangeText={setNewChecklistItem}
              onSubmitEditing={addChecklistItem}
            />
            <TouchableOpacity style={styles.addButton} onPress={addChecklistItem}>
              <Text style={styles.addButtonText}>＋</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>Time Blocks</Text>
          {record.timeBlocks.length === 0 ? (
            <Text style={styles.helperText}>Plan focused time to protect your goals.</Text>
          ) : (
            record.timeBlocks.map(block => (
              <View key={block.id} style={styles.timeBlockRow}>
                <View>
                  <Text style={styles.timeBlockTitle}>{block.title}</Text>
                  <Text style={styles.timeBlockTime}>{block.start} - {block.end}</Text>
                </View>
                <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTimeBlock(block.id)}>
                  <Text style={styles.deleteText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))
          )}

          <View style={styles.timeBlockInputs}>
            <TextInput
              style={styles.flexInput}
              placeholder="Block title"
              value={blockTitle}
              onChangeText={setBlockTitle}
            />
            <View style={styles.timeRangeRow}>
              <TextInput
                style={styles.timeInput}
                placeholder="Start"
                value={blockStart}
                onChangeText={setBlockStart}
              />
              <Text style={styles.timeSeparator}>to</Text>
              <TextInput
                style={styles.timeInput}
                placeholder="End"
                value={blockEnd}
                onChangeText={setBlockEnd}
              />
            </View>
            <TouchableOpacity style={styles.addBlockBtn} onPress={addTimeBlock}>
              <Text style={styles.addBlockText}>Add time block</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.cardAccent}>
          <Text style={styles.cardTitle}>Motivation</Text>
          {motivationMessages.map((message, index) => (
            <View key={`motivation-${index}`} style={styles.motivationRow}>
              <View style={styles.motivationDot} />
              <Text style={styles.motivationText}>{message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly History</Text>
          <View style={styles.historyHeader}>
            <Text style={styles.historyLabel}>Day</Text>
            <Text style={styles.historyValue}>Water (L)</Text>
            <Text style={styles.historyValue}>Sleep (h)</Text>
            <Text style={styles.historyValue}>Study (h)</Text>
          </View>
          {weeklyHistory.map(day => (
            <View key={day.key} style={styles.historyRow}>
              <Text style={styles.historyLabel}>{day.label}</Text>
              <Text style={styles.historyValue}>{day.water.toFixed(1)}</Text>
              <Text style={styles.historyValue}>{day.sleep.toFixed(1)}</Text>
              <Text style={styles.historyValue}>{day.study.toFixed(1)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 50,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    color: "#c2185b",
  },
  subtitle: {
    fontSize: 14,
    color: "#d81b60",
    marginTop: 6,
    marginBottom: 14,
  },
  dateContainer: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderLeftWidth: 4,
    borderLeftColor: "#ff6f91",
  },
  date: {
    fontSize: 13,
    color: "#6b4c5e",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#ffb6c1",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 5,
  },
  cardAccent: {
    backgroundColor: "#ffe3ec",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8e2055",
  },
  linkText: {
    color: "#ff6f91",
    fontWeight: "700",
    fontSize: 12,
  },
  goalRow: {
    marginBottom: 16,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b4c5e",
    marginBottom: 6,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f3e6ea",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#ff6f91",
  },
  goalControls: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  goalInput: {
    borderWidth: 1,
    borderColor: "#f2c6d2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 70,
    fontSize: 14,
    color: "#4e2940",
  },
  goalTarget: {
    fontSize: 12,
    color: "#9b5a74",
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  timerValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4e2940",
    marginRight: 10,
  },
  timerButton: {
    backgroundColor: "#ff6f91",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
  },
  timerStop: {
    backgroundColor: "#8e2055",
  },
  timerButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },
  liveBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ffe3ec",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  liveBadgeText: {
    color: "#8e2055",
    fontWeight: "700",
    fontSize: 12,
  },
  sessionList: {
    marginTop: 8,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f2c6d2",
    backgroundColor: "#fffafa",
    marginBottom: 8,
  },
  sessionTime: {
    color: "#4e2940",
    fontWeight: "700",
  },
  sessionDuration: {
    color: "#9b5a74",
    fontSize: 12,
    marginTop: 2,
  },
  quickButtons: {
    flexDirection: "row",
  },
  quickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ffe3ec",
    marginRight: 8,
  },
  quickBtnText: {
    fontSize: 12,
    color: "#c2185b",
    fontWeight: "700",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: "#6b4c5e",
    fontWeight: "600",
  },
  metricInput: {
    borderWidth: 1,
    borderColor: "#f2c6d2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 90,
    textAlign: "center",
    color: "#4e2940",
  },
  ratingRow: {
    marginBottom: 12,
  },
  ratingGroup: {
    flexDirection: "row",
    marginTop: 6,
  },
  ratingChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f7eef1",
    marginRight: 8,
  },
  ratingChipActive: {
    backgroundColor: "#c2185b",
  },
  ratingChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9b5a74",
  },
  ratingChipTextActive: {
    color: "#ffffff",
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6b4c5e",
    marginTop: 10,
    marginBottom: 6,
  },
  helperText: {
    color: "#a06b84",
    marginBottom: 10,
    fontSize: 12,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkItem: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f2c6d2",
    backgroundColor: "#fffafa",
  },
  checkItemDone: {
    backgroundColor: "#ffe3ec",
  },
  checkText: {
    color: "#4e2940",
    fontWeight: "600",
  },
  checkTextDone: {
    color: "#8b6f7a",
    textDecorationLine: "line-through",
  },
  deleteBtn: {
    marginLeft: 10,
    backgroundColor: "#ffe3ec",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteText: {
    color: "#c2185b",
    fontWeight: "700",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  flexInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f2c6d2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#4e2940",
    marginRight: 8,
  },
  addButton: {
    backgroundColor: "#ff6f91",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  timeBlockRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f2c6d2",
    backgroundColor: "#fffafa",
    marginBottom: 8,
  },
  timeBlockTitle: {
    color: "#4e2940",
    fontWeight: "700",
  },
  timeBlockTime: {
    color: "#9b5a74",
    fontSize: 12,
    marginTop: 2,
  },
  timeBlockInputs: {
    marginTop: 8,
  },
  timeRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 10,
  },
  timeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#f2c6d2",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#4e2940",
    marginRight: 8,
  },
  timeSeparator: {
    color: "#9b5a74",
    fontWeight: "700",
  },
  addBlockBtn: {
    alignItems: "center",
    backgroundColor: "#c2185b",
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBlockText: {
    color: "#fff",
    fontWeight: "700",
  },
  motivationRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
  },
  motivationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ff6f91",
    marginTop: 6,
    marginRight: 8,
  },
  motivationText: {
    flex: 1,
    color: "#6b3a50",
    fontWeight: "600",
    fontSize: 13,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#f3e6ea",
  },
  historyLabel: {
    flex: 1.2,
    color: "#6b4c5e",
    fontWeight: "600",
    fontSize: 12,
  },
  historyValue: {
    flex: 1,
    textAlign: "right",
    color: "#8e2055",
    fontWeight: "600",
    fontSize: 12,
  },
});