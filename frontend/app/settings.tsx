import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { getSession, clearSession } from "../src/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const router = useRouter();
  const [session, setSessionState] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [qualityMode, setQualityMode] = useState("high");

  React.useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sess = await getSession();
    setSessionState(sess);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        onPress: async () => {
          await clearSession();
          router.replace("/login");
        },
        style: "destructive",
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Nickname</Text>
              <Text style={styles.settingValue}>{session?.nickname}</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Premium Status</Text>
              <Text style={styles.settingValue}>
                {session?.isPremium ? "Premium" : "Free"}
              </Text>
            </View>
            {!session?.isPremium && (
              <TouchableOpacity
                onPress={() => router.push("/premium")}
                style={styles.upgradeBtn}
              >
                <Text style={styles.upgradeBtnText}>Upgrade</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio</Text>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingLabel}>Quality Mode</Text>
              <Text style={styles.settingDesc}>
                {qualityMode === "high" ? "High Quality" : "Balanced"}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                setQualityMode(qualityMode === "high" ? "balanced" : "high")
              }
              style={styles.toggleBtn}
            >
              <MaterialCommunityIcons
                name="menu"
                size={20}
                color="#16c784"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Noise Cancellation</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: "#2a2a3e", true: "#16c784" }}
            />
          </View>

          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Auto-Pause on Inactive</Text>
            <Switch
              value={true}
              onValueChange={() => {}}
              trackColor={{ false: "#2a2a3e", true: "#16c784" }}
            />
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>About</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>Terms of Service</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#aaa"
            />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <TouchableOpacity
            style={styles.dangerButton}
            onPress={handleLogout}
          >
            <MaterialCommunityIcons name="logout" size={20} color="#ff6b6b" />
            <Text style={styles.dangerButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a3e",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#aaa",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#2a2a3e",
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#16c784",
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 12,
    color: "#16c784",
    marginTop: 4,
  },
  settingDesc: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
  },
  toggleBtn: {
    padding: 8,
  },
  upgradeBtn: {
    backgroundColor: "#16c784",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  upgradeBtnText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  dangerButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#ff6b6b",
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff6b6b",
  },
});

export default SettingsScreen;
