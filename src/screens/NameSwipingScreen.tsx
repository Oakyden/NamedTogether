import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import { Text, Button } from 'react-native-elements';
import { useAuth } from '../contexts/AuthContext';
import { getBabyNames, voteOnName, getUserVotes } from '../services/firestore';
import { BabyName, Vote } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface NameSwipingScreenProps {
  navigation: any;
}

export const NameSwipingScreen: React.FC<NameSwipingScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [allNames, setAllNames] = useState<BabyName[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayIndex, setDisplayIndex] = useState(0); // For instant text updates
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  // Use useRef for Animated values to prevent recreation on every render
  const position = useRef(new Animated.ValueXY()).current;
  const currentCardOpacity = useRef(new Animated.Value(1)).current;
  const nextCardScale = useRef(new Animated.Value(0.9)).current;

  // Use refs to access current state in PanResponder
  const isAnimatingRef = useRef(isAnimating);
  const handleVoteRef = useRef<(vote: 'yes' | 'no') => void>();

  // Update refs when state changes
  isAnimatingRef.current = isAnimating;

  // Load data once when component mounts
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load names and user votes in parallel
      const [babyNames, votes] = await Promise.all([
        getBabyNames(),
        getUserVotes(user.id)
      ]);

      // Filter out already voted names
      const votedNameIds = new Set(votes.map(vote => vote.nameId));
      const availableNames = babyNames.filter(name => !votedNameIds.has(name.id));
      
      console.log('Loaded names:', babyNames.length, 'Available:', availableNames.length);
      setAllNames(availableNames);
      setCurrentIndex(0);
      setDisplayIndex(0);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Simple local state - just get current and next from array
  const currentName = allNames[currentIndex];
  const nextName = allNames[currentIndex + 1];
  const remainingCount = allNames.length - displayIndex;

  const handleVote = useCallback((vote: 'yes' | 'no') => {
    if (!user || !currentName || isAnimating) return;

    setIsAnimating(true);
    
    // Instantly update display index for text
    setDisplayIndex(prev => prev + 1);
    
    // Animate current card off screen and next card to scale up
    const direction = vote === 'yes' ? screenWidth + 100 : -screenWidth - 100;
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x: direction, y: 0 },
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(currentCardOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(nextCardScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start(() => {
      // Animation complete - move to next card
      setCurrentIndex(prev => prev + 1);
      position.setValue({ x: 0, y: 0 });
      currentCardOpacity.setValue(1);
      nextCardScale.setValue(0.9);
      setIsAnimating(false);
    });

    // Vote in background without blocking UI
    voteOnName(user.id, currentName.id, vote).catch(error => {
      console.error('Error voting on name:', error);
    });
  }, [user, currentName, isAnimating]);

  // Update ref with current handleVote function
  handleVoteRef.current = handleVote;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isAnimatingRef.current,
      onMoveShouldSetPanResponder: () => !isAnimatingRef.current,
      onPanResponderMove: (_, gestureState) => {
        if (!isAnimatingRef.current) {
          position.setValue({ x: gestureState.dx, y: gestureState.dy });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (isAnimatingRef.current) return;
        
        if (gestureState.dx > 120) {
          handleVoteRef.current?.('yes');
        } else if (gestureState.dx < -120) {
          handleVoteRef.current?.('no');
        } else {
          // Return to center
          Animated.parallel([
            Animated.spring(position, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: false,
            }),
            Animated.timing(currentCardOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }),
            Animated.timing(nextCardScale, {
              toValue: 0.9,
              duration: 150,
              useNativeDriver: false,
            })
          ]).start();
        }
      },
    })
  ).current;

  const getRotation = useCallback(() => {
    return position.x.interpolate({
      inputRange: [-screenWidth / 2, 0, screenWidth / 2],
      outputRange: ['-10deg', '0deg', '10deg'],
      extrapolate: 'clamp',
    });
  }, [position.x]);

  const getLikeOpacity = useCallback(() => {
    return position.x.interpolate({
      inputRange: [0, 150],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  }, [position.x]);

  const getNopeOpacity = useCallback(() => {
    return position.x.interpolate({
      inputRange: [-150, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  }, [position.x]);

  const renderCard = useCallback((name: BabyName) => (
    <View style={styles.nameCard}>
      <View style={styles.nameContent}>
        <Text h2 style={styles.nameText}>{name?.name}</Text>
        <Text style={styles.genderText}>
          {name?.gender?.charAt(0).toUpperCase() + name?.gender?.slice(1)}
        </Text>
        {name?.origin && (
          <Text style={styles.originText}>Origin: {name.origin}</Text>
        )}
      </View>
    </View>
  ), []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading names...</Text>
      </View>
    );
  }

  if (allNames.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <Text h4>No names available</Text>
        <Text>Please try again later</Text>
      </View>
    );
  }

  console.log('Current name:', currentName, 'Index:', currentIndex, 'Total names:', allNames.length);

  if (!currentName || currentIndex >= allNames.length) {
    return (
      <View style={styles.completedContainer}>
        <Text h3 style={styles.completedTitle}>All done!</Text>
        <Text style={styles.completedText}>
          You've voted on all available names. Check your shortlist to see matches with your partner!
        </Text>
        <Button
          title="View Shortlist"
          onPress={() => navigation.navigate('Shortlist')}
          buttonStyle={styles.shortlistButton}
        />
        <Button
          title="Back to Home"
          onPress={() => navigation.navigate('Home')}
          buttonStyle={styles.homeButton}
          type="outline"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text h4 style={styles.header}>
        {remainingCount} names remaining
      </Text>

      <View style={styles.cardContainer}>
        {/* Next card (behind current card) */}
        {nextName && (
          <Animated.View
            style={[
              styles.card,
              styles.nextCard,
              {
                transform: [{ scale: nextCardScale }],
              },
            ]}
          >
            {renderCard(nextName)}
          </Animated.View>
        )}

        {/* Current card (on top) */}
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate: getRotation() },
              ],
              opacity: currentCardOpacity,
              zIndex: 2,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {renderCard(currentName)}

          <Animated.View style={[styles.likeLabel, { opacity: getLikeOpacity() }]}>
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.nopeLabel, { opacity: getNopeOpacity() }]}>
            <Text style={styles.nopeText}>PASS</Text>
          </Animated.View>
        </Animated.View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Pass"
          onPress={() => handleVote('no')}
          buttonStyle={[styles.actionButton, styles.passButton]}
          titleStyle={styles.passButtonText}
          icon={{ name: 'close', color: '#f44336' }}
        />
        <Button
          title="Like"
          onPress={() => handleVote('yes')}
          buttonStyle={[styles.actionButton, styles.likeButton]}
          titleStyle={styles.likeButtonText}
          icon={{ name: 'favorite', color: '#4caf50' }}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    color: '#e91e63',
    marginBottom: 20,
  },
  completedText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  shortlistButton: {
    backgroundColor: '#e91e63',
    marginBottom: 15,
    borderRadius: 25,
    width: 200,
  },
  homeButton: {
    borderColor: '#e91e63',
    borderRadius: 25,
    width: 200,
  },
  header: {
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 20,
    color: '#e91e63',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth * 0.85,
    height: 400,
  },
  nextCard: {
    position: 'absolute',
    zIndex: 1,
  },
  nameCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: '#fff',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  nameContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameText: {
    color: '#e91e63',
    marginBottom: 10,
  },
  genderText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 5,
  },
  originText: {
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
  },
  likeLabel: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#4caf50',
    padding: 10,
    borderRadius: 10,
    transform: [{ rotate: '-30deg' }],
  },
  likeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  nopeLabel: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 10,
    transform: [{ rotate: '30deg' }],
  },
  nopeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 40,
  },
  actionButton: {
    borderRadius: 50,
    width: 120,
    height: 50,
  },
  passButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#f44336',
  },
  passButtonText: {
    color: '#f44336',
  },
  likeButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  likeButtonText: {
    color: '#4caf50',
  },
});