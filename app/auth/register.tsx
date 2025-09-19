import { signUp } from "@/auth/register";
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
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

  const doRegister = async () => {
    try {
      if (!name.trim() || !age.trim()) {
        return Alert.alert("Error", "Insert name and age.");
      }
      const ageNum = Number(age);
      if (!Number.isFinite(ageNum) || ageNum <= 0) {
        return Alert.alert("Error", "Age needs to be a positive number.");
      }

      setLoading(true);
      await signUp(name.trim(), email.trim(), password, ageNum);
      router.replace("/"); // Gate pusta kada se kreira users/{uid}
    } catch (e: any) {
      Alert.alert("Registracija greška", e?.message ?? "Proveri podatke i pokušaj ponovo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950 px-6 justify-center">
      <Animated.View style={cardStyle} className="w-full">
        <Text className="text-center text-3xl font-extrabold tracking-tight text-white">
          Welcome to FinScope
        </Text>
        <Text className="text-center text-slate-400 mt-2 mb-6">Create your account</Text>

        <View className="bg-slate-900/70 rounded-2xl p-5 border border-slate-800">
          <Text className="text-slate-300 mb-1">Name</Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
            placeholder="Your name"
            placeholderTextColor="#94a3b8"
            value={name}
            onChangeText={setName}
          />

          <Text className="text-slate-300 mb-1">Age</Text>
          <TextInput
            className="rounded-xl px-4 py-3 mb-3 bg-slate-800 text-slate-100"
            placeholder="e.g. 23"
            placeholderTextColor="#94a3b8"
            keyboardType="number-pad"
            value={age}
            onChangeText={setAge}
          />

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
              onPress={doRegister}
              className="bg-indigo-600 rounded-2xl py-3 items-center"
            >
              <Text className="text-white font-semibold">
                {loading ? "Creating account…" : "Sign up"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>

        <View className="items-center mt-6">
          <Link href="/auth/login" className="text-indigo-400">
            Already have account? Login Now!
          </Link>
        </View>
      </Animated.View>
    </View>
  );
}
