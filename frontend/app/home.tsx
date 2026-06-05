import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { createRoom, joinRoom, getSession, clearSession } from "../src/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const HomeScreen = () => {
  const [roomCode, setRoomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [session, setSessionState] = useState<any>(null);

  React.useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sess = await getSession();
    setSessionState(sess);
  };

  const handleCreateRoom = async () => {
    setLoading(true);
    try {
      const response = await createRoom(session?.userId);
      if (response.success) {
        router.push(`/room/${response.code}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      Alert.alert("Error", "Please enter a room code");
      return;
    }

    setLoading(true);
    try {
      const response = await joinRoom(session?.userId, roomCode);
      if (response.success) {
        router.push(`/room/${response.code}`);
      }
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await clearSession();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back!</Text>
          <Text style={styles.nickname}>{session?.nickname}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Create Room */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="plus-circle"
            size={48}
            color="#16c784"
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>Create Room</Text>
          <Text style={styles.cardDesc}>Start a new voice room</Text>
          <TouchableOpacity
            style={styles.cardButton}
            onPress={handleCreateRoom}
            disabled={loading}
          >
            <Text style={styles.cardButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Join Room */}
        <View style={styles.card}>
          <MaterialCommunityIcons
            name="door-open"
            size={48}
            color="#16c784"
            style={styles.cardIcon}
          />
          <Text style={styles.cardTitle}>Join Room</Text>
          <Text style={styles.cardDesc}>Enter room code</Text>

          <View style={styles.inputContainer}>
            <View style={styles.codeInput}>
              <Text style={styles.codeText}>#</Text>
              <Text
                style={[
                  styles.codeValue,
                  { letterSpacing: 8, marginLeft: 8 },
                ]}
              >
                {roomCode}
              </Text>
            </View>
          </View>

          <View style={styles.numberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.numButton}
                onPress={() => {
                  if (num === "*") {
                    setRoomCode(roomCode.slice(0, -1));
                  } else if (num !== "#" && roomCode.length < 4) {
                    setRoomCode(roomCode + num);
                  }
                }}
              >
                <Text style={styles.numText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.cardButton, roomCode.length < 4 && styles.buttonDisabled]}
            onPress={handleJoinRoom}
            disabled={loading || roomCode.length < 4}
          >
            <Text style={styles.cardButtonText}>Join</Text>
          </TouchableOpacity>
        </View>

        {/* Premium */}
        {!session?.isPremium && (
          <View style={styles.premiumBanner}>
            <MaterialCommunityIcons
              name="crown"
              size={32}
              color="#ffd700"
            />
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Go Premium</Text>
              <Text style={styles.premiumDesc}>
                Better audio, no ads, unlimited rooms
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/premium")}
              style={styles.premiumButton}
            >
              <Text style={styles.premiumButtonText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    paddingBottom: 30,
  },
  greeting: {
    fontSize: 16,
    color: "#aaa",
  },
  nickname: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 4,
  },
  logoutBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    backgroundColor: "#2a2a3e",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#16c784",
  },
  cardIcon: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 12,
  },
  codeInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#16c784",
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16c784",
  },
  codeValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  numberPad: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
    gap: 8,
  },
  numButton: {
    width: "30%",
    aspectRatio: 1,
    backgroundColor: "#1a1a2e",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#16c784",
  },
  numText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16c784",
  },
  cardButton: {
    backgroundColor: "#16c784",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
  premiumBanner: {
    flexDirection: "row",
    backgroundColor: "#2a2a3e",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  premiumContent: {
    flex: 1,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffd700",
  },
  premiumDesc: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 2,
  },
  premiumButton: {
    backgroundColor: "#16c784",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1a1a2e",
  },
});

export default HomeScreen;
