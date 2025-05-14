import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Image, Animated } from "react-native";

const SplashScreen = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Wait 2 seconds, then fade out over 0.5 seconds
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1500,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* App Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("./AletheiaLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* App Name */}
      <Text style={styles.appName}>InstallOps</Text>
      <Text style={styles.tagline}>Installation Management</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0c0d0e",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2D2D2D",
    marginBottom: 8,
    textAlign: "center",
  },
  tagline: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 60,
    textAlign: "center",
  },
});

export default SplashScreen;
