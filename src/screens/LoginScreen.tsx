import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h2 style={styles.title}>NamedTogether</Text>
      <Text style={styles.subtitle}>Find the perfect name together</Text>
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon={{ type: 'feather', name: 'mail' }}
      />
      
      <Input
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={{ type: 'feather', name: 'lock' }}
      />
      
      <Button
        title="Sign In"
        onPress={handleLogin}
        loading={loading}
        buttonStyle={styles.button}
      />
      
      <Button
        title="Don't have an account? Sign Up"
        type="clear"
        onPress={() => navigation.navigate('Register')}
        titleStyle={styles.linkText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#e91e63',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#e91e63',
    marginTop: 20,
    borderRadius: 25,
  },
  linkText: {
    color: '#e91e63',
  },
});