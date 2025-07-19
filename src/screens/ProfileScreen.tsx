import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Button, Text, Input } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { getInviteForEmail, acceptInvite, createInvite } from '../services/firestore';
import { Invite } from '../types';

export const ProfileScreen: React.FC = () => {
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
      Alert.alert('Success', 'Invitation sent to your partner!');
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
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text h3 style={styles.welcome}>Welcome, {user?.displayName}!</Text>
      </View>

      {pendingInvite && (
        <View style={styles.inviteCard}>
          <Text h4>You have an invitation!</Text>
          <Text style={styles.cardText}>Someone wants to find baby names with you.</Text>
          <Button
            title="Accept Invitation"
            onPress={handleAcceptInvite}
            loading={loading}
            buttonStyle={styles.acceptButton}
          />
        </View>
      )}

      {user?.coupleId ? (
        <View style={styles.statusCard}>
          <Text h4 style={styles.connectedText}>Connected with your partner!</Text>
          <Text style={styles.statusText}>
            You can now swipe through names together and see your shared matches in the Shortlists tab.
          </Text>
        </View>
      ) : !user?.invitePending && !pendingInvite ? (
        <View style={styles.inviteCard}>
          <Text h4>Invite Your Partner</Text>
          <Text style={styles.cardText}>
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
      ) : user?.invitePending && !pendingInvite ? (
        <View style={styles.pendingCard}>
          <Text h4>Invitation Sent</Text>
          <Text style={styles.cardText}>
            Waiting for your partner to accept your invitation...
          </Text>
          <Text style={styles.instructionText}>
            While you wait, you can start swiping through names in the Swipe tab!
          </Text>
        </View>
      ) : null}

      <View style={styles.accountCard}>
        <Text h4>Account</Text>
        <Text style={styles.accountText}>Email: {user?.email}</Text>
        <Button
          title="Sign Out"
          onPress={signOut}
          buttonStyle={styles.signOutButton}
          titleStyle={styles.signOutText}
          type="outline"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  welcome: {
    color: '#e91e63',
    marginBottom: 10,
  },
  inviteCard: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  statusCard: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: '#f0f8f0',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  pendingCard: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: '#fff3cd',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  accountCard: {
    margin: 15,
    borderRadius: 10,
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  cardText: {
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  statusText: {
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  instructionText: {
    color: '#856404',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
  },
  accountText: {
    color: '#666',
    marginBottom: 20,
  },
  acceptButton: {
    backgroundColor: '#4caf50',
    marginTop: 15,
    borderRadius: 25,
  },
  connectedText: {
    color: '#4caf50',
    marginBottom: 15,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#e91e63',
    marginTop: 15,
    borderRadius: 25,
  },
  signOutButton: {
    borderColor: '#666',
    borderRadius: 25,
  },
  signOutText: {
    color: '#666',
  },
});