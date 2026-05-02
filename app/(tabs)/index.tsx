import { ThemedGradient } from "@/components/themed-gradient";
import { BorderRadius, Colors, Fonts, Shadows, Spacing } from '@/constants/theme';
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  const today = new Date();
  const date = today.toDateString();

  return (
    <ThemedGradient>
      <View style={styles.container}>
        <Text style={styles.title}>Change 🌸</Text>

        <Text style={styles.date}>{date}</Text>

        <View style={styles.quoteCard}>
          <Text style={styles.quote}>
            "Discipline today creates confidence tomorrow ✨"
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push("/morning")}>
          <Text style={styles.btnText}>Start Your Day →</Text>
        </TouchableOpacity>
      </View>
    </ThemedGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    padding: Spacing.xl 
  },
  title: { 
    fontSize: 48, 
    fontWeight: "700",
    fontFamily: Fonts.rounded,
    textAlign: "center",
    marginBottom: Spacing.lg 
  },
  date: { 
    marginTop: Spacing.sm, 
    color: Colors.light.icon,
    fontSize: 18,
    fontWeight: "500"
  },
  quoteCard: { 
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
    backgroundColor: Colors.light.glass,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: Colors.light.glassBorder,
    ...Shadows.card,
    minWidth: "90%",
    alignItems: "center"
  },
  quote: { 
    textAlign: "center", 
    fontSize: 20, 
    color: Colors.light.text,
    fontWeight: "500",
    lineHeight: 28
  },
  button: { 
    marginTop: Spacing.xl, 
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.button,
    ...Shadows.button,
    shadowColor: Colors.light.accent,
    transform: [{ scale: 1 }]
  },
  btnText: { 
    color: "#fff", 
    fontWeight: "700",
    fontSize: 20,
    fontFamily: Fonts.rounded
  }
});
