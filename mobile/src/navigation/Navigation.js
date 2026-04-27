import React, { useContext } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import NewComplaintScreen from '../screens/NewComplaintScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import SchemesScreen from '../screens/SchemesScreen';
import SchemeDetailScreen from '../screens/SchemeDetailScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminComplaintDetailScreen from '../screens/AdminComplaintDetailScreen';
import SarpanchDashboardScreen from '../screens/SarpanchDashboardScreen';
import GovtDashboardScreen from '../screens/GovtDashboardScreen';
import VillageComplaintsScreen from '../screens/VillageComplaintsScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import DirectoryScreen from '../screens/DirectoryScreen';
import PollsScreen from '../screens/PollsScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkersScreen from '../screens/WorkersScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: '#3498db' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

// Auth Stack (Login/Register)
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Citizen Dashboard - Tab Navigator
const CitizenTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color }) => {
        let icon = '📋';
        if (route.name === 'DashboardTab') icon = '🏠';
        else if (route.name === 'MyComplaintsTab') icon = '📝';
        else if (route.name === 'SchemesTab') icon = '📜';
        else if (route.name === 'ProfileTab') icon = '👤';
        return <Text style={{ fontSize: 20 }}>{icon}</Text>;
      },
      tabBarActiveTintColor: '#3498db',
      tabBarInactiveTintColor: '#95a5a6',
      headerStyle: { backgroundColor: '#2c3e50' },
      headerTintColor: '#fff',
    })}
  >
    <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Home', headerShown: false }} />
    <Tab.Screen name="MyComplaintsTab" component={MyComplaintsScreen} options={{ title: 'My Complaints' }} />
    <Tab.Screen name="SchemesTab" component={SchemesScreen} options={{ title: 'Schemes' }} />
    <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: 'Profile' }} />
  </Tab.Navigator>
);

// Citizen Stack Navigator (for complaints, chatbot, etc.)
const CitizenStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="DashboardMain" component={CitizenTabs} options={{ headerShown: false }} />
    <Stack.Screen name="NewComplaint" component={NewComplaintScreen} options={{ title: 'File Complaint' }} />
    <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} options={{ title: 'My Complaints' }} />
    <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
    <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Schemes' }} />
    <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Panchayat Bot' }} />
    <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
    <Stack.Screen name="Directory" component={DirectoryScreen} options={{ title: 'Village Directory' }} />
    <Stack.Screen name="Polls" component={PollsScreen} options={{ title: 'Polls' }} />
  </Stack.Navigator>
);

// Sarpanch Stack Navigator
const SarpanchStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="SarpanchDashboard" component={SarpanchDashboardScreen} options={{ title: 'Village Admin', headerShown: false }} />
    <Stack.Screen name="VillageComplaints" component={VillageComplaintsScreen} options={{ title: 'Village Complaints' }} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} options={{ title: 'Manage Complaint' }} />
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Panel' }} />
    <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Schemes' }} />
    <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
    <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
    <Stack.Screen name="Directory" component={DirectoryScreen} options={{ title: 'Village Directory' }} />
    <Stack.Screen name="Polls" component={PollsScreen} options={{ title: 'Polls' }} />
    <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Panchayat Bot' }} />
    <Stack.Screen name="Workers" component={WorkersScreen} options={{ title: 'Workers' }} />
  </Stack.Navigator>
);

// Govt Stack Navigator
const GovtStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen name="GovtDashboard" component={GovtDashboardScreen} options={{ title: 'Command Center', headerShown: false }} />
    <Stack.Screen name="AllComplaints" component={VillageComplaintsScreen} options={{ title: 'All Complaints' }} />
    <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} options={{ title: 'Manage Complaint' }} />
    <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Schemes' }} />
    <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
    <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
    <Stack.Screen name="Polls" component={PollsScreen} options={{ title: 'Polls' }} />
    <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Panchayat Bot' }} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { token, loading, user } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 10, color: '#7f8c8d', fontSize: 15 }}>Loading...</Text>
      </View>
    );
  }

  const getUserStack = () => {
    if (!token) return 'AuthStack';
    const role = user?.role;
    if (role === 'sarpanch' || role === 'admin') return 'SarpanchStack';
    if (role === 'govt') return 'GovtStack';
    return 'CitizenStack'; // citizen or user (legacy)
  };

  const userStack = getUserStack();

  return (
    <NavigationContainer>
      {userStack === 'AuthStack' && <AuthStack />}
      {userStack === 'CitizenStack' && <CitizenStack />}
      {userStack === 'SarpanchStack' && <SarpanchStack />}
      {userStack === 'GovtStack' && <GovtStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
