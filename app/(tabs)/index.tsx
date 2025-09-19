
import { Text, View } from 'react-native';
import { useAuth } from '../../providers/authProvider'; // Promeni path

export default function HomeScreen() {
  const { user, userDoc, loading } = useAuth();

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <Text className="text-xl">Please log in</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-bold mb-4">
        Hello, {userDoc?.name || user.email}!
      </Text>
      
      <Text className="text-gray-600">
        Welcome to FinScope
      </Text>
      
      {userDoc && (
        <View className="mt-4">
          <Text>Name: {userDoc.name}</Text>
          <Text>Email: {userDoc.email}</Text>
          <Text>Age: {userDoc.age}</Text>
        </View>
      )}
    </View>
  );
}

