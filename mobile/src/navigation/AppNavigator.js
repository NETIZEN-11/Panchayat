import React, { useContext } from 'react';
import { Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthContext } from '../context/AuthContext';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Citizen Screens
import DashboardScreen from '../screens/DashboardScreen';
import NewComplaintScreen from '../screens/NewComplaintScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import ComplaintsScreen from '../screens/ComplaintsScreen';
import SchemesScreen from '../screens/SchemesScreen';
import SchemeDetailScreen from '../screens/SchemeDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import AnnouncementsScreen from '../screens/AnnouncementsScreen';

// Sarpanch Screens
import SarpanchDashboardScreen from '../screens/SarpanchDashboardScreen';
import VillageComplaintsScreen from '../screens/VillageComplaintsScreen';
import AdminComplaintDetailScreen from '../screens/AdminComplaintDetailScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

// Govt Screens
import GovtDashboardScreen from '../screens/GovtDashboardScreen';

// Shared Screens
import DirectoryScreen from '../screens/DirectoryScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab icon as simple text
const TabIcon = ({ label, color }) => (
  <Text style={{ fontSize: 10, color, fontWeight: '700', letterSpacing: 0.5 }}>{label}</Text>
);

// ─── Auth Stack ───────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ─── Citizen Stack ────────────────────────────────────────────
function CitizenHomeStack() {
  return (
    <Stack.Navigator screenOptions={citizenHeaderStyle}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Smart Panchayat' }} />
      <Stack.Screen name="NewComplaint" component={NewComplaintScreen} options={{ title: 'File Complaint' }} />
      <Stack.Screen name="MyComplaints" component={MyComplaintsScreen} options={{ title: 'My Complaints' }} />
      <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ title: 'Complaint Details' }} />
      <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Govt Schemes' }} />
      <Stack.Screen name="SchemeDetail" component={SchemeDetailScreen} options={{ title: 'Scheme Details' }} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'AI Assistant' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
    </Stack.Navigator>
  );
}

function CitizenTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...citizenTabStyle, headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={CitizenHomeStack}
        options={{ tabBarLabel: 'Home', tabBarIcon: ({ color }) => <TabIcon label="HOME" color={color} /> }}
      />
      <Tab.Screen
        name="ComplaintsTab"
        component={ComplaintsScreen}
        options={{ tabBarLabel: 'Complaints', tabBarIcon: ({ color }) => <TabIcon label="LIST" color={color} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <TabIcon label="ME" color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Sarpanch Stack ───────────────────────────────────────────
function SarpanchHomeStack() {
  return (
    <Stack.Navigator screenOptions={sarpanchHeaderStyle}>
      <Stack.Screen name="SarpanchDashboard" component={SarpanchDashboardScreen} options={{ title: 'Sarpanch Panel' }} />
      <Stack.Screen name="VillageComplaints" component={VillageComplaintsScreen} options={{ title: 'Village Complaints' }} />
      <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} options={{ title: 'Manage Complaint' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
      <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Govt Schemes' }} />
      <Stack.Screen name="Directory" component={DirectoryScreen} options={{ title: 'Village Directory' }} />
    </Stack.Navigator>
  );
}

function SarpanchTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...sarpanchTabStyle, headerShown: false }}>
      <Tab.Screen
        name="SarpanchHomeTab"
        component={SarpanchHomeStack}
        options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => <TabIcon label="DASH" color={color} /> }}
      />
      <Tab.Screen
        name="VillageTab"
        component={VillageComplaintsScreen}
        options={{ tabBarLabel: 'Complaints', tabBarIcon: ({ color }) => <TabIcon label="LIST" color={color} /> }}
      />
      <Tab.Screen
        name="SarpanchProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <TabIcon label="ME" color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Government Stack ─────────────────────────────────────────
function GovtHomeStack() {
  return (
    <Stack.Navigator screenOptions={govtHeaderStyle}>
      <Stack.Screen name="GovtDashboard" component={GovtDashboardScreen} options={{ title: 'Ministry Dashboard' }} />
      <Stack.Screen name="AllComplaints" component={AdminDashboardScreen} options={{ title: 'All Complaints' }} />
      <Stack.Screen name="AdminComplaintDetail" component={AdminComplaintDetailScreen} options={{ title: 'Complaint Detail' }} />
      <Stack.Screen name="Schemes" component={SchemesScreen} options={{ title: 'Manage Schemes' }} />
      <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ title: 'Announcements' }} />
    </Stack.Navigator>
  );
}

function GovtTabs() {
  return (
    <Tab.Navigator screenOptions={{ ...govtTabStyle, headerShown: false }}>
      <Tab.Screen
        name="GovtHomeTab"
        component={GovtHomeStack}
        options={{ tabBarLabel: 'Command', tabBarIcon: ({ color }) => <TabIcon label="CMD" color={color} /> }}
      />
      <Tab.Screen
        name="GovtComplaintsTab"
        component={AdminDashboardScreen}
        options={{ tabBarLabel: 'All Cases', tabBarIcon: ({ color }) => <TabIcon label="ALL" color={color} /> }}
      />
      <Tab.Screen
        name="GovtProfileTab"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color }) => <TabIcon label="ME" color={color} /> }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────
export default function AppNavigator() {
  const { token, loading, isCitizen, isSarpanch, isGovt } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loading}>
        <View style={styles.splashLogo}>
          <Text style={styles.splashLogoText}>SP</Text>
        </View>
        <ActivityIndicator size="large" color="#3498db" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Smart Panchayat</Text>
        <Text style={styles.loadingSubText}>Government of India</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!token ? (
        <AuthStack />
      ) : isSarpanch() ? (
        <SarpanchTabs />
      ) : isGovt() ? (
        <GovtTabs />
      ) : (
        <CitizenTabs />
      )}
    </NavigationContainer>
  );
}

const citizenHeaderStyle = {
  headerStyle: { backgroundColor: '#27ae60' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const sarpanchHeaderStyle = {
  headerStyle: { backgroundColor: '#e67e22' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const govtHeaderStyle = {
  headerStyle: { backgroundColor: '#8e44ad' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: 'bold' },
};

const citizenTabStyle = {
  tabBarActiveTintColor: '#27ae60',
  tabBarInactiveTintColor: '#95a5a6',
  tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
};

const sarpanchTabStyle = {
  tabBarActiveTintColor: '#e67e22',
  tabBarInactiveTintColor: '#95a5a6',
  tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
};

const govtTabStyle = {
  tabBarActiveTintColor: '#8e44ad',
  tabBarInactiveTintColor: '#95a5a6',
  tabBarStyle: { paddingBottom: 5, paddingTop: 5, height: 60 },
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  splashLogo: {
    width: 90, height: 90, borderRadius: 24, backgroundColor: '#2c3e50',
    justifyContent: 'center', alignItems: 'center',
  },
  splashLogoText: { fontSize: 38, fontWeight: 'bold', color: '#fff' },
  loadingText: { marginTop: 16, fontSize: 22, fontWeight: 'bold', color: '#2c3e50' },
  loadingSubText: { marginTop: 4, fontSize: 13, color: '#95a5a6' },
});