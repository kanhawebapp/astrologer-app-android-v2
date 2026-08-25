import React, {useCallback, useEffect, useState} from 'react';
import {View, StyleSheet, FlatList, ActivityIndicator} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Header} from '../../../../components';
import {AppText} from '../../../../components/common/AppText';
import {ScreenContainer} from '../../../../components/layout/ScreenContainer';
import {useTheme} from '../../../../hooks/useTheme';
import {useRoute, useNavigation} from '@react-navigation/native';
import {messagesApi} from '../../../../services/api/messageSession/messages.service';
import {SessionMessage} from '../../../../services/api/messageSession/messages.types';
import {formatTime} from '../../../../utils/helpers';

const SessionMessagesScreen: React.FC = () => {
  const {theme} = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const sessionId = route.params?.sessionId;
  const userName = route.params?.userName;

  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!sessionId) {
      return;
    }

    setLoading(true);
    setError(null);
    setMessages([]);

    try {
      const response = await messagesApi.getSessionMessages({
        sessionId,
      });

      const messagesData = response?.getSessionMessages;
      if (messagesData?.success) {
        setMessages(messagesData.data || []);
      } else {
        setMessages([]);
      }
    } catch (err) {
      setMessages([]);
      setError(err instanceof Error ? err.message : 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const renderMessage = ({item}: {item: SessionMessage}) => {
    const isAstrologer = item.sender?.toLowerCase() === 'astrologer';

    return (
      <View
        style={[
          styles.messageRow,
          isAstrologer ? styles.astrologerMessage : styles.userMessage,
        ]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isAstrologer
                ? theme.colors.primary
                : theme.colors.surfaceSecondary,
            },
          ]}>
          <AppText
            variant="caption"
            color={
              isAstrologer ? theme.colors.white : theme.colors.textSecondary
            }
            style={styles.senderLabel}>
            {item.sender}
          </AppText>

          {item.image ? (
            <View style={styles.imagePlaceholder}>
              <Icon name="image" size={24} color={theme.colors.textTertiary} />
              <AppText
                variant="caption"
                color={
                  isAstrologer ? theme.colors.white : theme.colors.textSecondary
                }
                style={styles.imageLabel}>
                Image
              </AppText>
            </View>
          ) : null}

          {item.message ? (
            <AppText
              variant="body2"
              color={isAstrologer ? theme.colors.white : theme.colors.text}
              style={item.image ? styles.messageWithImage : undefined}>
              {item.message}
            </AppText>
          ) : null}

          <AppText
            variant="caption"
            color={
              isAstrologer ? 'rgba(255,255,255,0.7)' : theme.colors.textTertiary
            }
            style={styles.messageTime}>
            {formatTime(item.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return null;
    }
    return (
      <View style={styles.emptyContainer}>
        <Icon
          name="chat-bubble-outline"
          size={48}
          color={theme.colors.textTertiary}
        />
        <AppText
          variant="body2"
          color={theme.colors.textSecondary}
          style={styles.emptyText}>
          {error ? error : 'No messages found'}
        </AppText>
      </View>
    );
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <AppText
        variant="body2"
        color={theme.colors.textSecondary}
        style={styles.loadingText}>
        Loading messages...
      </AppText>
    </View>
  );

  return (
    <ScreenContainer scrollable={false} withPadding={false}>
      <Header
        title={userName ? `Messages - ${userName}` : 'Session Messages'}
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {loading ? (
          renderLoading()
        ) : (
          <FlatList
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          />
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
  },
  messageRow: {
    marginBottom: 12,
  },
  astrologerMessage: {
    alignItems: 'flex-end',
  },
  userMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  senderLabel: {
    marginBottom: 4,
    fontWeight: '700',
  },
  messageWithImage: {
    marginTop: 8,
  },
  messageTime: {
    marginTop: 6,
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  imagePlaceholder: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  imageLabel: {
    fontSize: 12,
  },
});

export default SessionMessagesScreen;
