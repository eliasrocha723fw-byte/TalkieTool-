import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";

const AuthCallbackScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle OAuth callback
    setTimeout(() => {
      router.replace("/home");
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Processing authentication...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#16c784",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AuthCallbackScreen;
