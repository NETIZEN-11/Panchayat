import React, { useState, useRef, useContext } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import api from '../config/api';
import { LanguageContext } from '../context/LanguageContext';
import { ThemeContext } from '../context/ThemeContext';

const ChatbotScreen = () => {
  const { t, locale } = useContext(LanguageContext);
  const { colors } = useContext(ThemeContext);
  const [messages, setMessages] = useState([
    { id: '1', text: t('welcome') + '! How can I help you today?', isBot: true },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef();

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const userMessage = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    try {
      const response = await api.post('/chatbot', { message: inputText, language: locale });
      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: response.data.data?.message || 'Sorry, I could not understand that.',
        isBot: true,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: 'Sorry, something went wrong.', isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageBubble,
      item.isBot
        ? [styles.botBubble, { backgroundColor: colors.card }]
        : styles.userBubble,
    ]}>
      <Text style={[styles.messageText, item.isBot ? { color: colors.text } : styles.userText]}>
        {item.text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Typing...</Text>
        </View>
      )}
      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
          placeholder="Ask your question..."
          placeholderTextColor={colors.textSecondary}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={sendMessage}
          disabled={loading || !inputText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  messageList: { padding: 15 },
  messageBubble: {
    maxWidth: '80%', padding: 12, borderRadius: 20, marginBottom: 10,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  botBubble: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  userBubble: { alignSelf: 'flex-end', backgroundColor: '#3498db', borderBottomRightRadius: 4 },
  messageText: { fontSize: 16, lineHeight: 22 },
  userText: { color: '#fff' },
  loadingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10 },
  loadingText: { marginLeft: 8, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', padding: 12, borderTopWidth: 1, alignItems: 'center' },
  input: {
    flex: 1, borderRadius: 25, paddingHorizontal: 20, paddingVertical: 10,
    fontSize: 16, maxHeight: 120, borderWidth: 1,
  },
  sendButton: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#27ae60',
    justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
  sendButtonText: { color: '#fff', fontSize: 22 },
});

export default ChatbotScreen;
