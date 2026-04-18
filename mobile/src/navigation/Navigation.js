import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { AuthContext } from '../context/AuthContext';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateComplaintScreen from '../screens/CreateComplaintScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import SchemesScreen from '../screens/SchemesScreen';
import SchemeDetailScreen from '../screens/SchemeDetailScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import AdminComplaintDetailScreen from '../screens/AdminComplaintDetailScreen';

const Stack = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const UserStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Smart Panchayat' }}
      />
      <Stack.Screen
        name="CreateComplaint"
        component={CreateComplaintScreen}
        options={{ title: 'File Complaint' }}
      />
      <Stack.Screen
        name="MyComplaints"
        component={MyComplaintsScreen}
        options={{ title: 'My Complaints' }}
      />
      <Stack.Screen
        name="ComplaintDetail"
        component={ComplaintDetailScreen}
        options={{ title: 'Complaint Details' }}
      />
      <Stack.Screen
        name="Schemes"
        component={SchemesScreen}
        options={{ title: 'Government Schemes' }}
      />
      <Stack.Screen
        name="SchemeDetail"
        component={SchemeDetailScreen}
        options={{ title: 'Scheme Details' }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ title: 'Admin Panel' }}
      />
      <Stack.Screen
        name="AdminComplaintDetail"
        component={AdminComplaintDetailScreen}
        options={{ title: 'Manage Complaint' }}
      />
    </Stack.Navigator>
  );
};

const Navigation = () => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <UserStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default Navigation;
