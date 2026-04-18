import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, Modal, Linking,
} from 'react-native';
import { SchemeContext } from '../context/SchemeContext';
import { LanguageContext } from '../context/LanguageContext';

const CATEGORIES = [
  { label: 'All Categories', value: '' },
  { label: 'Agriculture', value: 'Agriculture', url: 'https://www.google.com/search?q=India+Agriculture+government+schemes' },
  { label: 'Education', value: 'Education', url: 'https://www.google.com/search?q=India+Education+government+schemes' },
  { label: 'Health', value: 'Health', url: 'https://www.google.com/search?q=India+Health+government+schemes+Ayushman+Bharat' },
  { label: 'Women and Child', value: 'Women', url: 'https://www.google.com/search?q=India+Women+Child+government+schemes' },
  { label: 'Housing', value: 'Housing', url: 'https://www.google.com/search?q=Pradhan+Mantri+Awas+Yojana+rural+scheme' },
  { label: 'Employment', value: 'Employment', url: 'https://www.google.com/search?q=India+Employment+MGNREGA+government+schemes' },
  { label: 'Pension', value: 'Pension', url: 'https://www.google.com/search?q=India+Pension+senior+citizen+government+schemes' },
  { label: 'Finance', value: 'Finance', url: 'https://www.google.com/search?q=India+financial+inclusion+Jan+Dhan+schemes' },
  { label: 'Skill Development', value: 'Skill', url: 'https://www.google.com/search?q=Pradhan+Mantri+Kaushal+Vikas+Yojana+skill' },
  { label: 'MNREGA', value: 'MNREGA', url: 'https://www.google.com/search?q=MGNREGA+scheme+rural+employment+guarantee' },
  { label: 'Sanitation', value: 'Sanitation', url: 'https://www.google.com/search?q=Swachh+Bharat+Mission+rural+sanitation+scheme' },
  { label: 'Digital India', value: 'Digital', url: 'https://www.google.com/search?q=Digital+India+scheme+rural+connectivity' },
  { label: 'Social Security', value: 'Social', url: 'https://www.google.com/search?q=India+social+security+government+schemes' },
  { label: 'Infrastructure', value: 'Infrastructure', url: 'https://www.google.com/search?q=rural+infrastructure+development+India+schemes' },
  { label: 'Other', value: 'Other', url: 'https://www.india.gov.in/my-government/schemes' },
];

const STATIC_SCHEMES = [
  {
    _id: 'pmkisan', name: 'PM-KISAN', category: 'Agriculture',
    description: 'PM Kisan Samman Nidhi provides Rs.6,000/year to small farmers in 3 instalments.',
    eligibility: 'Small and marginal farmers with less than 2 hectares land',
    googleUrl: 'https://pmkisan.gov.in',
    officialUrl: 'https://pmkisan.gov.in',
    tag: 'AGR',
  },
  {
    _id: 'ayushman', name: 'Ayushman Bharat (PM-JAY)', category: 'Health',
    description: 'Health insurance cover of Rs.5 lakh per family per year for hospitalization.',
    eligibility: 'Poor and vulnerable families as per SECC 2011 data',
    googleUrl: 'https://www.google.com/search?q=Ayushman+Bharat+PM-JAY+scheme+apply',
    officialUrl: 'https://setu.pmjay.gov.in',
    tag: 'HLT',
  },
  {
    _id: 'pmay', name: 'PM Awas Yojana (Gramin)', category: 'Housing',
    description: 'Financial assistance to build pucca houses for BPL households in rural areas.',
    eligibility: 'BPL families without pucca houses in rural areas',
    googleUrl: 'https://www.google.com/search?q=PMAY+Gramin+rural+housing+scheme+apply',
    officialUrl: 'https://pmayg.nic.in',
    tag: 'HSG',
  },
  {
    _id: 'mnrega', name: 'MGNREGA', category: 'Employment',
    description: 'Guarantees 100 days of wage employment per year to rural households.',
    eligibility: 'Adult members of rural households willing to do unskilled manual work',
    googleUrl: 'https://www.google.com/search?q=MGNREGA+job+card+apply+rural',
    officialUrl: 'https://mnregaweb4.nic.in',
    tag: 'EMP',
  },
  {
    _id: 'pmkvy', name: 'PM Kaushal Vikas Yojana', category: 'Skill',
    description: 'Skill training programme to enable Indian youth to take up industry-relevant training.',
    eligibility: 'School/college dropouts or unemployed youth (15-45 years)',
    googleUrl: 'https://www.google.com/search?q=PM+Kaushal+Vikas+Yojana+training+centers+apply',
    officialUrl: 'https://www.pmkvyofficial.org',
    tag: 'SKL',
  },
  {
    _id: 'jandhan', name: 'Jan Dhan Yojana', category: 'Finance',
    description: 'Zero balance bank accounts with RuPay debit card and accident insurance of Rs.2 lakh.',
    eligibility: 'Any Indian citizen above 10 years without a bank account',
    googleUrl: 'https://www.google.com/search?q=Jan+Dhan+Yojana+account+open+bank',
    officialUrl: 'https://pmjdy.gov.in',
    tag: 'FIN',
  },
  {
    _id: 'ujjwala', name: 'PM Ujjwala Yojana', category: 'Social',
    description: 'Provides free LPG connection to women from below-poverty-line households.',
    eligibility: 'Adult women from BPL households without existing LPG connection',
    googleUrl: 'https://www.google.com/search?q=PM+Ujjwala+Yojana+free+LPG+apply',
    officialUrl: 'https://pmuy.gov.in',
    tag: 'SOC',
  },
  {
    _id: 'swachhbharat', name: 'Swachh Bharat Mission', category: 'Sanitation',
    description: 'Free toilet construction for rural households and promotion of sanitation awareness.',
    eligibility: 'Rural households without toilets (BPL and APL listed)',
    googleUrl: 'https://www.google.com/search?q=Swachh+Bharat+Mission+rural+toilet+apply',
    officialUrl: 'https://swachhbharatmission.gov.in',
    tag: 'SAN',
  },
];

const CATEGORY_COLORS = {
  Agriculture: '#27ae60', Education: '#3498db', Health: '#e74c3c',
  Women: '#e91e63', Housing: '#f39c12', Employment: '#9b59b6',
  Pension: '#607d8b', Finance: '#00bcd4', Skill: '#ff5722',
  MNREGA: '#795548', Sanitation: '#2196f3', Digital: '#673ab7',
  Social: '#009688', Infrastructure: '#ff9800', Other: '#95a5a6',
};

const SchemesScreen = ({ navigation }) => {
  const { t } = useContext(LanguageContext);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showStatic, setShowStatic] = useState(true);
  const { schemes, loading, getAllSchemes } = useContext(SchemeContext);

  useEffect(() => { fetchSchemes(); }, [category]);

  const fetchSchemes = async () => {
    try { await getAllSchemes({ category: category || undefined }); } catch {}
  };

  const onRefresh = async () => { setRefreshing(true); await fetchSchemes(); setRefreshing(false); };

  const allSchemes = [
    ...(showStatic ? STATIC_SCHEMES.filter(s => !category || s.category === category) : []),
    ...schemes,
  ];

  const selectedCat = CATEGORIES.find(c => c.value === category);
  const openLink = (url) => { if (url) Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open link')); };

  const renderScheme = ({ item }) => {
    const color = CATEGORY_COLORS[item.category] || '#3498db';
    return (
      <View style={styles.card}>
        <View style={[styles.cardHeader, { borderLeftColor: color, backgroundColor: color + '10' }]}>
          <View style={[styles.tagBox, { backgroundColor: color }]}>
            <Text style={styles.tagText}>{item.tag || item.category?.slice(0, 3).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color }]}>{item.name}</Text>
            <View style={[styles.categoryTag, { backgroundColor: color }]}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.eligibilityBox}>
          <Text style={styles.eligibilityLabel}>Eligibility:</Text>
          <Text style={styles.eligibilityText}>{item.eligibility}</Text>
        </View>

        <View style={styles.cardActions}>
          {item.googleUrl && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#4285f4' }]} onPress={() => openLink(item.googleUrl)}>
              <Text style={styles.actionBtnText}>Search Online</Text>
            </TouchableOpacity>
          )}
          {item.officialUrl && (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: color }]} onPress={() => openLink(item.officialUrl)}>
              <Text style={styles.actionBtnText}>Official Site</Text>
            </TouchableOpacity>
          )}
          {!item.googleUrl && !STATIC_SCHEMES.find(s => s._id === item._id) && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#4285f4' }]}
              onPress={() => openLink(`https://www.google.com/search?q=${encodeURIComponent(item.name + ' government scheme India apply')}`)}
            >
              <Text style={styles.actionBtnText}>Search Online</Text>
            </TouchableOpacity>
          )}
        </View>

        {item._id && !STATIC_SCHEMES.find(s => s._id === item._id) && (
          <TouchableOpacity onPress={() => navigation.navigate('SchemeDetail', { id: item._id })}>
            <Text style={[styles.viewDetails, { color }]}>View Full Details</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
          <Text style={styles.dropdownText}>{selectedCat?.label || 'All Categories'}</Text>
          <Text style={styles.dropdownArrow}>v</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, showStatic && styles.toggleBtnActive]}
          onPress={() => setShowStatic(!showStatic)}
        >
          <Text style={[styles.toggleBtnText, showStatic && { color: '#fff' }]}>
            {showStatic ? 'Featured' : 'DB Only'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category modal */}
      <Modal visible={showDropdown} transparent animationType="slide" onRequestClose={() => setShowDropdown(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Category</Text>
            <FlatList
              data={CATEGORIES}
              keyExtractor={c => c.value}
              renderItem={({ item: cat }) => (
                <TouchableOpacity
                  style={[styles.catOption, category === cat.value && styles.catOptionSelected]}
                  onPress={() => { setCategory(cat.value); setShowDropdown(false); }}
                >
                  <Text style={[styles.catOptionText, category === cat.value && styles.catOptionTextSelected]}>
                    {cat.label}
                  </Text>
                  {cat.url && (
                    <TouchableOpacity onPress={() => { setShowDropdown(false); openLink(cat.url); }}>
                      <Text style={styles.catSearchLink}>Search</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowDropdown(false)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && allSchemes.length === 0 ? (
        <View style={styles.centered}><ActivityIndicator size="large" color="#3498db" /></View>
      ) : allSchemes.length === 0 ? (
        <View style={styles.centered}>
          <View style={styles.emptyBox}><Text style={styles.emptyBoxText}>0</Text></View>
          <Text style={styles.emptyText}>No schemes found</Text>
          <Text style={styles.emptySubtext}>Try a different category</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => openLink('https://www.india.gov.in/my-government/schemes')}>
            <Text style={styles.searchBtnText}>Browse All Schemes on India.gov.in</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={allSchemes}
          renderItem={renderScheme}
          keyExtractor={(item, i) => item._id || i.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  filterBar: {
    backgroundColor: '#fff', padding: 12, flexDirection: 'row', gap: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3,
  },
  dropdown: {
    flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa',
    borderRadius: 10, borderWidth: 1, borderColor: '#dfe6e9', padding: 10,
  },
  dropdownText: { flex: 1, fontSize: 14, color: '#2c3e50', fontWeight: '600' },
  dropdownArrow: { fontSize: 12, color: '#7f8c8d' },
  toggleBtn: { backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#dfe6e9', padding: 10, justifyContent: 'center' },
  toggleBtnActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  toggleBtnText: { fontSize: 12, fontWeight: '600', color: '#7f8c8d' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 15, textAlign: 'center' },
  catOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f2f6' },
  catOptionSelected: { backgroundColor: '#e8f4fd' },
  catOptionText: { flex: 1, fontSize: 15, color: '#2c3e50', fontWeight: '600' },
  catOptionTextSelected: { color: '#3498db' },
  catSearchLink: { fontSize: 13, color: '#4285f4', fontWeight: '700', padding: 4 },
  closeBtn: { backgroundColor: '#3498db', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 12 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  listContent: { padding: 15 },
  card: {
    backgroundColor: '#fff', borderRadius: 16, marginBottom: 15, overflow: 'hidden',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 14, borderLeftWidth: 5 },
  tagBox: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  categoryTag: { alignSelf: 'flex-start', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 2 },
  categoryTagText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  description: { fontSize: 14, color: '#636e72', padding: 14, lineHeight: 20 },
  eligibilityBox: { backgroundColor: '#f0f9f0', marginHorizontal: 14, borderRadius: 8, padding: 10, marginBottom: 12 },
  eligibilityLabel: { fontSize: 12, fontWeight: 'bold', color: '#27ae60', marginBottom: 3 },
  eligibilityText: { fontSize: 13, color: '#2c3e50' },
  cardActions: { flexDirection: 'row', paddingHorizontal: 14, gap: 8, marginBottom: 10 },
  actionBtn: { flex: 1, borderRadius: 8, padding: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  viewDetails: { fontSize: 13, fontWeight: '600', textAlign: 'right', padding: 10, paddingTop: 0 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyBox: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#ecf0f1', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  emptyBoxText: { fontSize: 30, fontWeight: 'bold', color: '#bdc3c7' },
  emptyText: { fontSize: 18, color: '#7f8c8d', fontWeight: '600', marginBottom: 5 },
  emptySubtext: { fontSize: 13, color: '#95a5a6', textAlign: 'center', marginBottom: 20 },
  searchBtn: { backgroundColor: '#4285f4', borderRadius: 10, padding: 14, alignItems: 'center' },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});

export default SchemesScreen;
