import React, { useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';
import api from '../config/api';

const DashboardScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { t } = useContext(LanguageContext);
  const { colors } = useContext(ThemeContext);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications');
      setUnreadCount(res.data.unreadCount || 0);
    } catch {}
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{t('welcome')}, {user?.name}!</Text>
            <Text style={styles.village}>{user?.village}</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.notifIcon}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.halfCard, { borderTopColor: '#27ae60', backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('NewComplaint')}
          >
            <Text style={[styles.cardLabel, { color: '#27ae60' }]}>FILE</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('file_complaint')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.halfCard, { borderTopColor: '#3498db', backgroundColor: colors.card }]}
            onPress={() => navigation.navigate('MyComplaints')}
          >
            <Text style={[styles.cardLabel, { color: '#3498db' }]}>MY</Text>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('my_complaints')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.card, styles.chatbotCard]}
          onPress={() => navigation.navigate('Chatbot')}
        >
          <View style={styles.cardContent}>
            <View>
              <Text style={[styles.cardTitle, { color: '#fff' }]}>{t('chatbot')}</Text>
              <Text style={{ color: '#ecf0f1', fontSize: 13 }}>Ask anything about Panchayat Services</Text>
            </View>
            <View style={styles.chatbotBadge}>
              <Text style={styles.chatbotBadgeText}>AI</Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderTopColor: '#f39c12', backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Schemes')}
        >
          <Text style={[styles.cardLabel, { color: '#f39c12' }]}>SCHEMES</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('schemes')}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>View available government schemes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, { borderTopColor: '#9b59b6', backgroundColor: colors.card }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={[styles.cardLabel, { color: '#9b59b6' }]}>ACCOUNT</Text>
          <Text style={[styles.cardTitle, { color: colors.text }]}>{t('profile')}</Text>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>Manage your account and language</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 10 }]}>Quick Access</Text>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#e74c3c' }]}
            onPress={() => navigation.navigate('EmergencyAlerts')}
          >
            <Text style={styles.smallCardIcon}>🚨</Text>
            <Text style={styles.smallCardLabel}>Emergency</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#3498db' }]}
            onPress={() => navigation.navigate('WeatherAlerts')}
          >
            <Text style={styles.smallCardIcon}>🌤️</Text>
            <Text style={styles.smallCardLabel}>Weather</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#27ae60' }]}
            onPress={() => navigation.navigate('Meetings')}
          >
            <Text style={styles.smallCardIcon}>📅</Text>
            <Text style={styles.smallCardLabel}>Meetings</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#f39c12' }]}
            onPress={() => navigation.navigate('Documents')}
          >
            <Text style={styles.smallCardIcon}>📄</Text>
            <Text style={styles.smallCardLabel}>Documents</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#9b59b6' }]}
            onPress={() => navigation.navigate('Assets')}
          >
            <Text style={styles.smallCardIcon}>🏢</Text>
            <Text style={styles.smallCardLabel}>Assets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#e67e22' }]}
            onPress={() => navigation.navigate('LostFound')}
          >
            <Text style={styles.smallCardIcon}>🔍</Text>
            <Text style={styles.smallCardLabel}>Lost & Found</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#1abc9c' }]}
            onPress={() => navigation.navigate('PollResults')}
          >
            <Text style={styles.smallCardIcon}>📊</Text>
            <Text style={styles.smallCardLabel}>Polls</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#34495e' }]}
            onPress={() => navigation.navigate('QRScanner')}
          >
            <Text style={styles.smallCardIcon}>📱</Text>
            <Text style={styles.smallCardLabel}>Verify Doc</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.smallCard, { backgroundColor: '#8e44ad' }]}
            onPress={() => navigation.navigate('Grievance')}
          >
            <Text style={styles.smallCardIcon}>📮</Text>
            <Text style={styles.smallCardLabel}>Grievance</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#2c3e50',
    padding: 25, paddingTop: 50,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  notifBtn: { position: 'relative', padding: 8 },
  notifIcon: { fontSize: 24 },
  notifBadge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#e74c3c', borderRadius: 10,
    minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  notifBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  village: { fontSize: 15, color: '#bdc3c7', fontWeight: '500' },
  content: { padding: 15 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  halfCard: {
    borderRadius: 14, padding: 20,
    width: '48%', elevation: 3, borderTopWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  card: {
    borderRadius: 14, padding: 20,
    marginBottom: 15, elevation: 3, borderTopWidth: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  chatbotCard: { backgroundColor: '#8e44ad', borderTopWidth: 0 },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatbotBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  chatbotBadgeText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 5 },
  cardDescription: { fontSize: 13 },
  smallCard: {
    flex: 1, marginHorizontal: 4, borderRadius: 12,
    padding: 15, alignItems: 'center', elevation: 3,
  },
  smallCardIcon: { fontSize: 24, marginBottom: 6 },
  smallCardLabel: { color: '#fff', fontSize: 10, fontWeight: 'bold', textAlign: 'center' },
});

export default DashboardScreen;
