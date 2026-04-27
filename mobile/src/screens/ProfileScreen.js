import React, { useContext } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Alert, Linking, Switch,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'Hindi (हिंदी)' },
  { code: 'ta', label: 'Tamil', native: 'Tamil (தமிழ்)' },
  { code: 'kn', label: 'Kannada', native: 'Kannada (ಕನ್ನಡ)' },
  { code: 'te', label: 'Telugu', native: 'Telugu (తెలుగు)' },
  { code: 'mr', label: 'Marathi', native: 'Marathi (मराठी)' },
  { code: 'gu', label: 'Gujarati', native: 'Gujarati (ગુજરાતી)' },
  { code: 'pa', label: 'Punjabi', native: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'bn', label: 'Bengali', native: 'Bengali (বাংলা)' },
  { code: 'ml', label: 'Malayalam', native: 'Malayalam (മലയാളം)' },
];

const ROLE_CONFIG = {
  citizen: { label: 'Citizen', shortLabel: 'CIT', color: '#27ae60' },
  sarpanch: { label: 'Sarpanch', shortLabel: 'SAR', color: '#e67e22' },
  govt: { label: 'Govt Officer', shortLabel: 'GOV', color: '#8e44ad' },
  user: { label: 'Citizen', shortLabel: 'CIT', color: '#27ae60' },
  admin: { label: 'Sarpanch', shortLabel: 'SAR', color: '#e67e22' },
};

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useContext(AuthContext);
  const { t, locale, changeLanguage } = useContext(LanguageContext);
  const { isDark, toggleTheme, colors } = useContext(ThemeContext);

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.citizen;

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes, Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: roleConfig.color }]}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: roleConfig.color }]}>
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeShort}>{roleConfig.shortLabel}</Text>
          <Text style={styles.roleBadgeLabel}>{roleConfig.label}</Text>
        </View>
        <Text style={styles.villageLabel}>{user?.village}</Text>
      </View>

      {/* Appearance Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>APPEARANCE</Text>
        <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dark Mode</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{isDark ? 'On' : 'Off'}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#dfe6e9', true: '#3498db' }}
            thumbColor={isDark ? '#f5f5f5' : '#f5f5f5'}
          />
        </View>
      </View>

      {/* Info Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT DETAILS</Text>
        <InfoRow label="Name" value={user?.name} colors={colors} />
        <InfoRow label="Email" value={user?.email} colors={colors} />
        <InfoRow label="Phone" value={user?.phone || 'Not set'} colors={colors} />
        <InfoRow label="Village" value={user?.village} colors={colors} />
        <InfoRow label="District" value={user?.district || 'General'} colors={colors} />
        <InfoRow label="Role" value={roleConfig.label} colors={colors} />
      </View>

      {/* Language Section */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>SELECT LANGUAGE</Text>
        <View style={styles.langGrid}>
          {LANGUAGES.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.langBtn,
                { borderColor: colors.border, backgroundColor: colors.inputBg },
                locale === lang.code && { backgroundColor: roleConfig.color, borderColor: roleConfig.color },
              ]}
              onPress={() => changeLanguage(lang.code)}
            >
              <Text style={[styles.langCode, { color: colors.textSecondary }, locale === lang.code && { color: 'rgba(255,255,255,0.8)' }]}>
                {lang.label.toUpperCase().slice(0, 3)}
              </Text>
              <Text style={[styles.langNative, { color: colors.text }, locale === lang.code && { color: '#fff' }]}>
                {lang.native}
              </Text>
              {locale === lang.code && (
                <View style={styles.langSelected}>
                  <Text style={styles.langSelectedText}>ON</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quick Links */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK LINKS</Text>
        <TouchableOpacity style={[styles.linkBtn, { borderBottomColor: colors.border }]} onPress={() => Linking.openURL('https://www.india.gov.in')}>
          <Text style={[styles.linkBtnText, { color: colors.text }]}>India Government Portal</Text>
          <Text style={[styles.linkArrow, { color: roleConfig.color }]}>Go</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkBtn, { borderBottomColor: colors.border }]} onPress={() => Linking.openURL('https://pgportal.gov.in')}>
          <Text style={[styles.linkBtnText, { color: colors.text }]}>Grievance Portal (CPGRAMS)</Text>
          <Text style={[styles.linkArrow, { color: roleConfig.color }]}>Go</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkBtn, { borderBottomColor: colors.border }]} onPress={() => Linking.openURL('https://pmkisan.gov.in')}>
          <Text style={[styles.linkBtnText, { color: colors.text }]}>PM-KISAN Portal</Text>
          <Text style={[styles.linkArrow, { color: roleConfig.color }]}>Go</Text>
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <View style={[styles.section, { backgroundColor: colors.surface }]}>
        <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: '#e74c3c' }]} onPress={handleLogout}>
          <Text style={styles.logoutText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const InfoRow = ({ label, value, colors }) => (
  <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
    <Text style={[styles.infoValue, { color: colors.text }]}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, paddingTop: 50, alignItems: 'center' },
  avatar: {
    width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#fff',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12, elevation: 4,
  },
  avatarText: { fontSize: 40, fontWeight: 'bold' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5, marginBottom: 6,
  },
  roleBadgeShort: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginRight: 5,
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  roleBadgeLabel: { color: '#fff', fontSize: 13, fontWeight: '600' },
  villageLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },

  section: {
    marginHorizontal: 15, marginTop: 15,
    borderRadius: 14, padding: 16, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '800',
    marginBottom: 12, letterSpacing: 1.5,
  },
  infoRow: { paddingVertical: 10, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 11, marginBottom: 3 },
  infoValue: { fontSize: 15, fontWeight: '600' },

  langGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langBtn: {
    width: '47%', borderRadius: 10, borderWidth: 2,
    padding: 10, alignItems: 'center', position: 'relative',
  },
  langCode: { fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 2 },
  langNative: { fontSize: 13, fontWeight: '700', textAlign: 'center' },
  langSelected: { position: 'absolute', top: 4, right: 6, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  langSelectedText: { fontSize: 9, color: '#fff', fontWeight: 'bold' },

  linkBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, borderBottomWidth: 1,
  },
  linkBtnText: { fontSize: 14, fontWeight: '600' },
  linkArrow: { fontSize: 13, fontWeight: 'bold' },

  logoutBtn: { borderRadius: 12, padding: 16, alignItems: 'center' },
  logoutText: { color: '#fff', fontSize: 14, fontWeight: 'bold', letterSpacing: 1.5 },
});

export default ProfileScreen;
