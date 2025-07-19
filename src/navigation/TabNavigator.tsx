import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-elements';
import { NameSwipingScreen } from '../screens/NameSwipingScreen';
import { ShortlistScreen } from '../screens/ShortlistScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="NameSwiping"
      screenOptions={{
        tabBarActiveTintColor: '#e91e63',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e0e0e0',
        },
        headerStyle: {
          backgroundColor: '#e91e63',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen 
        name="NameSwiping" 
        component={NameSwipingScreen}
        options={{
          title: 'Find Names',
          tabBarLabel: 'Names',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="favorite"
              type="material"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Shortlist" 
        component={ShortlistScreen}
        options={{
          title: 'Shortlists',
          tabBarLabel: 'Shortlists',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="list"
              type="material"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon
              name="person"
              type="material"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};