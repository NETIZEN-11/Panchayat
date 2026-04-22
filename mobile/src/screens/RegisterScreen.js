import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const ROLE_OPTIONS = [
  { id: 'citizen', label: 'Citizen', labelHi: 'Nagrik', color: '#27ae60' },
  { id: 'sarpanch', label: 'Sarpanch', labelHi: 'Village Head', color: '#e67e22' },
];

export default function RegisterScreen({ navigation, route }) {
  const defaultRole = route?.params?.defaultRole || 'citizen';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const selectedRole = ROLE_OPTIONS.find(r => r.id === role);

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !village) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    try {
      setLoading(true);
      await register(name.trim(), email.trim().toLowerCase(), phone.trim(), password, village.trim(), role, district.trim() || 'General');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Please try again.';
      Alert.alert('Registration Failed', message);
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
        <View style={[styles.header, { backgroundColor: selectedRole?.color || '#27ae60' }]}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>{selectedRole?.label?.charAt(0) || 'C'}</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Smart Panchayat</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.sectionLabel}>Register As</Text>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[styles.roleBtn, role === r.id && { backgroundColor: r.color, borderColor: r.color }]}
                onPress={() => setRole(r.id)}
              >
                <View style={[styles.roleBadge, { backgroundColor: role === r.id ? 'rgba(255,255,255,0.25)' : '#f0f0f0' }]}>
                  <Text style={[styles.roleBadgeText, role === r.id && { color: '#fff' }]}>{r.label.charAt(0)}</Text>
                </View>
                <Text style={[styles.roleBtnText, role === r.id && { color: '#fff' }]}>{r.label}</Text>
                <Text style={[styles.roleBtnSub, role === r.id && { color: 'rgba(255,255,255,0.8)' }]}>{r.labelHi}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Full Name *</Text>
          <TextInput style={styles.input} placeholder="Enter your full name" value={name} onChangeText={setName} autoCapitalize="words" editable={!loading} />

          <Text style={styles.label}>Email *</Text>
          <TextInput style={styles.input} placeholder="Enter your email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} editable={!loading} />

          <Text style={styles.label}>Phone Number *</Text>
          <TextInput style={styles.input} placeholder="10-digit mobile number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} editable={!loading} />

          <Text style={styles.label}>Village *</Text>
          <TextInput style={styles.input} placeholder="Your village name" value={village} onChangeText={setVillage} autoCapitalize="words" editable={!loading} />

          <Text style={styles.label}>District</Text>
          <TextInput style={styles.input} placeholder="Your district (optional)" value={district} onChangeText={setDistrict} autoCapitalize="words" editable={!loading} />

          <Text style={styles.label}>Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Minimum 6 characters"
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

          <Text style={styles.label}>Confirm Password *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              editable={!loading}
            />
            <TouchableOpacity
              style={styles.showPasswordBtn}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Text style={styles.showPasswordText}>
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: selectedRole?.color || '#27ae60' }, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => navigation.navigate('Login')} disabled={loading}>
            <Text style={styles.loginText}>
              Already have an account? <Text style={[styles.loginBold, { color: selectedRole?.color }]}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollContent: { flexGrow: 1, paddingBottom: 30 },
  header: { padding: 30, paddingTop: 50, alignItems: 'center' },
  logoBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  logoText: { fontSize: 26, fontWeight: 'bold', color: '#fff' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.85)' },
  formContainer: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#2c3e50', marginBottom: 10, textAlign: 'center' },
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleBtn: {
    flex: 1, borderWidth: 2, borderColor: '#dfe6e9', borderRadius: 12,
    padding: 14, alignItems: 'center', backgroundColor: '#f8f9fa',
  },
  roleBadge: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  roleBadgeText: { fontSize: 16, fontWeight: 'bold', color: '#636e72' },
  roleBtnText: { fontSize: 13, fontWeight: '700', color: '#636e72' },
  roleBtnSub: { fontSize: 11, color: '#b2bec3', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#2c3e50', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, borderWidth: 1, borderColor: '#e9ecef', fontSize: 15 },
  passwordContainer: { position: 'relative', marginBottom: 14 },
  passwordInput: { paddingRight: 50 },
  showPasswordBtn: {
    position: 'absolute', right: 12, top: 12, padding: 5,
  },
  showPasswordText: { fontSize: 20 },
  button: { borderRadius: 10, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loginLink: { alignItems: 'center', padding: 14 },
  loginText: { fontSize: 14, color: '#7f8c8d' },
  loginBold: { fontWeight: 'bold' },
});/ /   E m o j i   r e m o v a l   -   C o m m i t   2 0  
 