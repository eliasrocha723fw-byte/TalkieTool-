import React, { useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

interface FloatingBubbleProps {
  isRecording?: boolean;
}

const FloatingBubble = ({ isRecording = false }: FloatingBubbleProps) => {
  const position = useRef(new Animated.ValueXY({ x: width - 80, y: height - 200 })).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: position.x, dy: position.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        // Snap to edges
        const toX = position.x._value > width / 2 ? width - 70 : 10;
        Animated.spring(position.x, {
          toValue: toX,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  return (
    <Animated.View
      style={[
        styles.bubble,
        {
          transform: [{ translateX: position.x }, { translateY: position.y }],
        },
        isRecording && styles.bubbleActive,
      ]}
      {...panResponder.panHandlers}
    >
      <View style={styles.bubbleInner}>
        <MaterialCommunityIcons
          name={isRecording ? "microphone" : "microphone-outline"}
          size={28}
          color={isRecording ? "#16c784" : "#fff"}
        />
      </View>
      {isRecording && <View style={styles.pulseRing} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2a2a3e",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#16c784",
    zIndex: 1000,
  },
  bubbleInner: {
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleActive: {
    backgroundColor: "rgba(22, 199, 132, 0.2)",
    borderColor: "#16c784",
  },
  pulseRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "#16c784",
    opacity: 0.5,
  },
});

export default FloatingBubble;
