import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const ROLES = [
  { id: 'citizen', label: 'Citizen', subLabel: 'Nagrik', color: '#27ae60', desc: 'Submit complaints and track status' },
  { id: 'sarpanch', label: 'Sarpanch', subLabel: 'Village Admin', color: '#e67e22', desc: 'Manage village complaints' },
  { id: 'govt', label: 'Govt Officer', subLabel: 'Ministry Level', color: '#8e44ad', desc: 'Ministry-level monitoring' },
];

export default function LoginScreen({ navigation }) {
  const [selectedRole, setSelectedRole] = useState('citizen');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const selectedRoleData = ROLES.find(r => r.id === selectedRole);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    try {
      setLoading(true);
      await login(email.trim().toLowerCase(), password);
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Check credentials.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SP</Text>
          </View>
          <Text style={styles.title}>Smart Panchayat</Text>
          <Text style={styles.subtitle}>Digital Village Governance</Text>
          <Text style={styles.subtitle2}>Government of India Initiative</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSection}>
          <Text style={styles.roleLabel}>Select Your Role</Text>
          <View style={styles.roleRow}>
            {ROLES.map(role => (
              <TouchableOpacity
                key={role.id}
                style={[
                  styles.roleCard,
                  selectedRole === role.id && { borderColor: role.color, backgroundColor: role.color + '12' },
                ]}
                onPress={() => setSelectedRole(role.id)}
              >
                <View style={[styles.roleInitial, { backgroundColor: selectedRole === role.id ? role.color : '#dfe6e9' }]}>
                  <Text style={[styles.roleInitialText, { color: selectedRole === role.id ? '#fff' : '#636e72' }]}>
                    {role.label.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.roleTitle, selectedRole === role.id && { color: role.color }]}>
                  {role.label}
                </Text>
                <Text style={styles.roleSubLabel}>{role.subLabel}</Text>
                {selectedRole === role.id && (
                  <View style={[styles.roleCheck, { backgroundColor: role.color }]}>
                    <Text style={styles.roleCheckText}>OK</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={[styles.roleDescBox, { backgroundColor: selectedRoleData.color + '12', borderColor: selectedRoleData.color }]}>
            <Text style={[styles.roleDescText, { color: selectedRoleData.color }]}>
              {selectedRoleData.desc}
            </Text>
          </View>
        </View>

        {/* Login Form */}
        <View style={[styles.formContainer, { borderTopColor: selectedRoleData.color }]}>
          <Text style={[styles.formTitle, { color: selectedRoleData.color }]}>
            Login as {selectedRoleData.label}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: selectedRoleData.color }, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Login as {selectedRoleData.label}</Text>
            )}
          </TouchableOpacity>

          {selectedRole !== 'govt' && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>
              <TouchableOpacity
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register', { defaultRole: selectedRole })}
                disabled={loading}
              >
                <Text style={styles.registerText}>
                  Don't have an account?{' '}
                  <Text style={[styles.registerBold, { color: selectedRoleData.color }]}>Register</Text>
                </Text>
              </TouchableOpacity>
            </>
          )}

          {selectedRole === 'govt' && (
            <Text style={styles.govtNote}>
              Government Officer accounts are created by the system administrator only.
            </Text>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  header: { backgroundColor: '#1a252f', padding: 30, paddingTop: 50, alignItems: 'center' },
  logoBox: {
    width: 70, height: 70, borderRadius: 20, backgroundColor: '#3498db',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
  subtitle2: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 },

  roleSection: { padding: 15, backgroundColor: '#fff' },
  roleLabel: { fontSize: 13, fontWeight: '700', color: '#2c3e50', marginBottom: 12, textAlign: 'center' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  roleCard: {
    flex: 1, borderRadius: 12, borderWidth: 2, borderColor: '#dfe6e9',
    padding: 10, alignItems: 'center', backgroundColor: '#f8f9fa', position: 'relative',
  },
  roleInitial: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  roleInitialText: { fontSize: 18, fontWeight: 'bold' },
  roleTitle: { fontSize: 12, fontWeight: 'bold', color: '#636e72', textAlign: 'center' },
  roleSubLabel: { fontSize: 10, color: '#b2bec3', textAlign: 'center', marginTop: 2 },
  roleCheck: {
    position: 'absolute', top: -8, right: -8,
    borderRadius: 8, paddingHorizontal: 5, paddingVertical: 2,
  },
  roleCheckText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  roleDescBox: { marginTop: 12, padding: 10, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  roleDescText: { fontSize: 13, fontWeight: '600' },

  formContainer: {
    backgroundColor: '#fff', margin: 15, borderRadius: 16, padding: 20,
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 6, borderTopWidth: 4,
  },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 13, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  input: {
    backgroundColor: '#f8f9fa', borderRadius: 10, padding: 14,
    borderWidth: 1, borderColor: '#dfe6e9', fontSize: 15,
  },
  passwordContainer: { position: 'relative', marginBottom: 16 },
  passwordInput: { paddingRight: 50 },
  showPasswordBtn: {
    position: 'absolute', right: 12, top: 12, padding: 5,
  },
  showPasswordText: { fontSize: 20 },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 4 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ecf0f1' },
  dividerText: { paddingHorizontal: 12, color: '#95a5a6', fontSize: 13 },
  registerLink: { alignItems: 'center', padding: 8 },
  registerText: { fontSize: 14, color: '#7f8c8d' },
  registerBold: { fontWeight: 'bold' },
  govtNote: { fontSize: 12, color: '#636e72', textAlign: 'center', marginTop: 16, fontStyle: 'italic' },
});