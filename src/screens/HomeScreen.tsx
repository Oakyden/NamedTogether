import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text, Input, Card } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { getInviteForEmail, acceptInvite, createInvite } from '../services/firestore';
import { Invite } from '../types';

interface HomeScreenProps {
  navigation: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [partnerEmail, setPartnerEmail] = useState('');
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkForInvite();
    }
  }, [user]);

  const checkForInvite = async () => {
    if (!user?.email) return;
    
    try {
      const invite = await getInviteForEmail(user.email);
      setPendingInvite(invite);
    } catch (error) {
      console.error('Error checking for invite:', error);
    }
  };

  const handleSendInvite = async () => {
    if (!partnerEmail || !user) {
      Alert.alert('Error', 'Please enter your partner\'s email');
      return;
    }

    if (partnerEmail.toLowerCase() === user.email.toLowerCase()) {
      Alert.alert('Error', 'You cannot invite yourself');
      return;
    }

    setLoading(true);
    try {
      await createInvite(user.id, partnerEmail);
      Alert.alert('Success', 'Invitation sent to your partner! You can start swiping names now.', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('NameSwiping')
        }
      ]);
      setPartnerEmail('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    if (!pendingInvite || !user) return;

    setLoading(true);
    try {
      await acceptInvite(pendingInvite.id, user.id);
      Alert.alert('Success', 'You\'re now connected with your partner!');
      setPendingInvite(null);
      // Navigate to name swiping screen
      navigation.navigate('NameSwiping');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigateToSwiping = () => {
    navigation.navigate('NameSwiping');
  };

  const navigateToShortlist = () => {
    navigation.navigate('Shortlist');
  };

  return (
    <View style={styles.container}>
      <Text h3 style={styles.welcome}>Welcome, {user?.displayName}!</Text>
      
      {pendingInvite && (
        <Card containerStyle={styles.inviteCard}>
          <Text h4>You have an invitation!</Text>
          <Text>Someone wants to find baby names with you.</Text>
          <Button
            title="Accept Invitation"
            onPress={handleAcceptInvite}
            loading={loading}
            buttonStyle={styles.acceptButton}
          />
        </Card>
      )}

      {user?.coupleId ? (
        <View style={styles.connectedSection}>
          <Text h4 style={styles.connectedText}>Connected with your partner!</Text>
          <Button
            title="Start Swiping Names"
            onPress={navigateToSwiping}
            buttonStyle={styles.actionButton}
          />
          <Button
            title="View Shortlist"
            onPress={navigateToShortlist}
            buttonStyle={[styles.actionButton, styles.secondaryButton]}
            titleStyle={styles.secondaryButtonText}
          />
        </View>
      ) : !user?.invitePending && !pendingInvite && (
        <View style={styles.inviteSection}>
          <Text h4>Invite Your Partner</Text>
          <Text style={styles.inviteText}>
            Enter your partner's email to start finding names together
          </Text>
          <Input
            placeholder="Partner's email"
            value={partnerEmail}
            onChangeText={setPartnerEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={{ type: 'feather', name: 'mail' }}
          />
          <Button
            title="Send Invitation"
            onPress={handleSendInvite}
            loading={loading}
            buttonStyle={styles.actionButton}
          />
        </View>
      )}

      {user?.invitePending && !pendingInvite && (
        <Card containerStyle={styles.pendingCard}>
          <Text h4>Invitation Sent</Text>
          <Text>Waiting for your partner to accept your invitation...</Text>
        </Card>
      )}

      <Button
        title="Sign Out"
        onPress={signOut}
        buttonStyle={styles.signOutButton}
        titleStyle={styles.signOutText}
        type="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  welcome: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 30,
    color: '#e91e63',
  },
  inviteCard: {
    borderRadius: 10,
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    marginTop: 15,
    borderRadius: 25,
  },
  connectedSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  connectedText: {
    color: '#4caf50',
    marginBottom: 30,
  },
  inviteSection: {
    marginTop: 20,
  },
  inviteText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#e91e63',
    marginVertical: 10,
    borderRadius: 25,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: '#e91e63',
    borderWidth: 2,
  },
  secondaryButtonText: {
    color: '#e91e63',
  },
  pendingCard: {
    borderRadius: 10,
    marginTop: 20,
    backgroundColor: '#fff3cd',
  },
  signOutButton: {
    marginTop: 'auto',
    borderColor: '#666',
    borderRadius: 25,
  },
  signOutText: {
    color: '#666',
  },
});