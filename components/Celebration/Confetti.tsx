import React from "react";
import { StyleSheet, View } from "react-native";
import LottieView from "lottie-react-native";

interface ConfettiProps {
  onFinish: () => void;
}

export function Confetti({ onFinish }: ConfettiProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LottieView
        source={require("@/assets/lottie/confetti.json")}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
    </View>
  );
}
