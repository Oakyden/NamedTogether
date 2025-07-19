import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Input, Button, Text } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  navigation: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName);
      // Navigation will happen automatically via AuthContext
      console.log('Registration successful');
    } catch (error: any) {
      console.error('Registration error:', error);
      Alert.alert('Registration Failed', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text h2 style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join NamedTogether</Text>
      
      <Input
        placeholder="Full Name"
        value={displayName}
        onChangeText={setDisplayName}
        leftIcon={{ type: 'feather', name: 'user' }}
      />
      
      <Input
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        leftIcon={{ type: 'feather', name: 'mail' }}
      />
      
      <Input
        placeholder="Password (6+ characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon={{ type: 'feather', name: 'lock' }}
      />
      
      <Button
        title="Create Account"
        onPress={handleRegister}
        loading={loading}
        buttonStyle={styles.button}
      />
      
      <Button
        title="Already have an account? Sign In"
        type="clear"
        onPress={() => navigation.navigate('Login')}
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