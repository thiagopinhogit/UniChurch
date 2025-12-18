import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { getChurchEvents, sendWelcome } from '../services/api';
import { getUser, getChurch } from '../services/storage';
import { colors, spacing, fontSize, fontWeight } from '../styles/theme';
import MuralFeed from '../components/MuralFeed';

export default function FeedScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const EVENTS_PER_PAGE = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      const user = await getUser();
      const churchData = await getChurch();
      setCurrentUser(user);
      setChurch(churchData);

      if (churchData) {
        const response = await getChurchEvents(churchData._id, 0, EVENTS_PER_PAGE);
        setEvents(response.data);
        setCurrentPage(0);
        setHasMoreEvents(response.data.length >= EVENTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMore || !hasMoreEvents || !church) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const skip = nextPage * EVENTS_PER_PAGE;
      
      const response = await getChurchEvents(church._id, skip, EVENTS_PER_PAGE);
      const newEvents = response.data;

      if (newEvents.length > 0) {
        setEvents(prevEvents => [...prevEvents, ...newEvents]);
        setCurrentPage(nextPage);
        setHasMoreEvents(newEvents.length >= EVENTS_PER_PAGE);
      } else {
        setHasMoreEvents(false);
      }
    } catch (error) {
      console.error('Error loading more events:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleViewProfile = (user) => {
    if (user) {
      // Se temos dados completos, passar person; caso contrário, passar userId
      if (user.interests !== undefined || user.whatsapp !== undefined) {
      navigation.navigate('PersonProfile', { person: user });
      } else {
        navigation.navigate('PersonProfile', { userId: user._id });
      }
    }
  };

  const handleWelcome = async (user, eventId) => {
    if (!currentUser || !user) return;

    try {
      await sendWelcome(user._id, currentUser._id, eventId);
      Alert.alert('Sucesso', `Você deu boas-vindas para ${user.name}! 👋`);
      // Reload to update counts
      await loadData();
    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert('Atenção', 'Você já deu boas-vindas para esta pessoa neste evento.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar boas-vindas.');
      }
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mural</Text>
        <Text style={styles.subtitle}>
          O que está acontecendo na nossa igreja
        </Text>
      </View>

      <MuralFeed
        events={events}
            currentUserId={currentUser?._id}
            onViewProfile={handleViewProfile}
            onWelcome={handleWelcome}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showTitle={false}
        onLoadMore={loadMoreEvents}
        hasMoreEvents={hasMoreEvents}
        loadingMore={loadingMore}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md + 4,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
});
