import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, ListItem } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { getShortlist, getBabyNames, getUserVotes } from '../services/firestore';
import { BabyName, Vote } from '../types';

interface ShortlistScreenProps {
  navigation: any;
}

export const ShortlistScreen: React.FC<ShortlistScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [sharedNames, setSharedNames] = useState<BabyName[]>([]);
  const [myLikedNames, setMyLikedNames] = useState<BabyName[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadShortlists();
  }, []);

  const loadShortlists = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([loadSharedShortlist(), loadMyLikedNames()]);
    } catch (error) {
      console.error('Error loading shortlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSharedShortlist = async () => {
    if (!user?.coupleId) return;

    try {
      const shortlist = await getShortlist(user.coupleId);
      if (shortlist && shortlist.matchedNames.length > 0) {
        const allNames = await getBabyNames();
        const nameMap = new Map(allNames.map(name => [name.id, name]));
        
        const matchedNames = shortlist.matchedNames
          .map(item => nameMap.get(item.nameId))
          .filter(Boolean) as BabyName[];
        
        setSharedNames(matchedNames);
      } else {
        setSharedNames([]);
      }
    } catch (error) {
      console.error('Error loading shared shortlist:', error);
      setSharedNames([]);
    }
  };

  const loadMyLikedNames = async () => {
    if (!user) return;

    try {
      const votes = await getUserVotes(user.id);
      const likedVotes = votes.filter(vote => vote.vote === 'yes');
      
      if (likedVotes.length > 0) {
        const allNames = await getBabyNames();
        const nameMap = new Map(allNames.map(name => [name.id, name]));
        
        const likedNames = likedVotes
          .map(vote => nameMap.get(vote.nameId))
          .filter(Boolean) as BabyName[];
        
        setMyLikedNames(likedNames);
      } else {
        setMyLikedNames([]);
      }
    } catch (error) {
      console.error('Error loading my liked names:', error);
      setMyLikedNames([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadShortlists();
    setRefreshing(false);
  };

  const renderNameItem = ({ item }: { item: BabyName }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <ListItem.Title style={styles.nameTitle}>{item.name}</ListItem.Title>
        <ListItem.Subtitle style={styles.nameSubtitle}>
          {item.gender?.charAt(0).toUpperCase() + item.gender?.slice(1)}
          {item.origin && ` • ${item.origin}`}
        </ListItem.Subtitle>
      </ListItem.Content>
    </ListItem>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading shortlists...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text h3 style={styles.header}>Your Shortlists</Text>

      {user?.coupleId ? (
        <Card containerStyle={styles.sectionCard}>
          <Text h4 style={styles.sectionTitle}>
            Shared Matches ({sharedNames.length})
          </Text>
          <Text style={styles.sectionDescription}>
            Names you both liked
          </Text>
          {sharedNames.length > 0 ? (
            <FlatList
              data={sharedNames}
              keyExtractor={(item) => item.id}
              renderItem={renderNameItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>
                No matches yet. Keep swiping to find names you both love!
              </Text>
            </View>
          )}
        </Card>
      ) : (
        <Card containerStyle={styles.sectionCard}>
          <Text h4 style={styles.sectionTitle}>Connect with Partner</Text>
          <Text style={styles.sectionDescription}>
            Invite your partner to see shared matches here
          </Text>
        </Card>
      )}

      <Card containerStyle={styles.sectionCard}>
        <Text h4 style={styles.sectionTitle}>
          My Favorites ({myLikedNames.length})
        </Text>
        <Text style={styles.sectionDescription}>
          Names you've liked
        </Text>
        {myLikedNames.length > 0 ? (
          <FlatList
            data={myLikedNames}
            keyExtractor={(item) => item.id}
            renderItem={renderNameItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>
              No favorites yet. Start swiping to build your list!
            </Text>
          </View>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    color: '#e91e63',
  },
  sectionCard: {
    borderRadius: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  sectionTitle: {
    color: '#e91e63',
    marginBottom: 5,
    textAlign: 'center',
  },
  sectionDescription: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 15,
    fontSize: 14,
  },
  nameTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  nameSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptySection: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});