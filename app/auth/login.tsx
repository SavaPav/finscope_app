import { signIn } from "@/auth/login";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // enter anim
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);
  const btnScale = useSharedValue(1);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, []);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  const doLogin = async () => {
    try {
      setLoading(true);
      await signIn(email.trim(), password);
      router.replace("/"); // ide na Home (/(tabs)/index.tsx)
    } catch (e: any) {
      Alert.alert("Login Error", "There seems to be an error with your login details. Please check your username and password and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <Animated.View style={cardStyle} className="w-full">
      <Text className="text-center text-3xl font-extrabold tracking-tight text-white">
        Welcome to <Text className="text-indigo-500">Fin</Text>Scope
      </Text>
        <Text className="text-center text-slate-400 mt-2 mb-6">Sign in to continue</Text>

        <View className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-300 mb-1">Email</Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
            placeholder="you@email.com"
            placeholderTextColor="#94a3b8"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text className="text-slate-300 mb-1">Password</Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-4 bg-slate-800 text-slate-100"
            placeholder="••••••••"
            placeholderTextColor="#94a3b8"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Animated.View style={buttonStyle}>
            <Pressable
              disabled={loading}
              onPressIn={() => (btnScale.value = withSpring(0.98))}
              onPressOut={() => (btnScale.value = withSpring(1))}
              onPress={doLogin}
              className="bg-indigo-600 rounded-2xl py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {loading ? "Signing in…" : "Sign in"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <View className="items-center mt-6">
          <Link href="/auth/register" className="text-indigo-400">
            Need account? Register now!
          </Link>
        </View>
      </Animated.View>
    </View>
  );
}