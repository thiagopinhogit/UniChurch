import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser } from '../services/storage';
import MuralFeed from '../components/MuralFeed';

const CHECKLIST_STORAGE_KEY = '@church_onboarding_checklist';

export default function AdminDashboardScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    membersInGroups: 0,
    membersInGroupsPercent: 0,
    membersWithoutGroup: 0,
    newMembersThisWeek: 0,
    growthRate: 0,
    activeGroups: 0,
    totalGroups: 0,
  });
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [onboardingChecklist, setOnboardingChecklist] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const EVENTS_PER_PAGE = 20;

  useEffect(() => {
    loadChurchData();
    loadOnboardingProgress();
  }, []);

  // Recarregar progresso do onboarding quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadOnboardingProgress();
    }, [])
  );

  const loadOnboardingProgress = async () => {
    try {
      const user = await getUser();
      if (user && user.church_id) {
        const savedState = await AsyncStorage.getItem(`${CHECKLIST_STORAGE_KEY}_${user.church_id}`);
        if (savedState) {
          const checklist = JSON.parse(savedState);
          const allComplete = Object.values(checklist).every(item => item);
          setOnboardingChecklist(checklist);
          setShowOnboarding(!allComplete); // Só mostra se não estiver tudo completo
        } else {
          // Primeira vez - mostrar onboarding
          setOnboardingChecklist({ location: false, groups: false, implantation: false });
          setShowOnboarding(true);
        }
      }
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    }
  };

  const loadChurchData = async () => {
    try {
      const user = await getUser();
      if (user && user.church_id) {
        setCurrentUser(user);

        // Load church data
        const churchResponse = await api.get(`/churches/${user.church_id}`);
        setChurch(churchResponse.data);

        // Load users
        const usersResponse = await api.get(`/users/church/${user.church_id}`);
        const users = usersResponse.data;
        
        // Calculate new members this week
        const now = new Date();
        const oneWeekAgo = new Date(now);
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const twoWeeksAgo = new Date(now);
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        
        const newMembersThisWeek = users.filter(u => new Date(u.created_at) > oneWeekAgo);
        const newMembersLastWeek = users.filter(u => {
          const createdAt = new Date(u.created_at);
          return createdAt > twoWeeksAgo && createdAt <= oneWeekAgo;
        });

        // Calculate growth rate
        const growthRate = newMembersLastWeek.length > 0
          ? ((newMembersThisWeek.length - newMembersLastWeek.length) / newMembersLastWeek.length) * 100
          : newMembersThisWeek.length > 0 ? 100 : 0;

        // Load groups
        const groupsResponse = await api.get(`/groups/church/${user.church_id}`);
        const groups = groupsResponse.data;

        console.log('🔍 Total de grupos:', groups.length);
        
        // Calculate members in CELLS specifically
        // IMPORTANTE: O backend retorna member_count mas não popula o array members na listagem
        const cellGroups = groups.filter(g => g.type === 'CELL');
        
        console.log('🏠 Grupos tipo CELL encontrados:', cellGroups.length);
        
        // Somar member_count de todas as células
        // Nota: pode ter duplicatas se alguém está em múltiplas células
        const membersInCellsCount = cellGroups.reduce((total, group) => {
          const count = group.member_count || 0;
          console.log(`📍 ${group.name}: ${count} membros`);
          return total + count;
        }, 0);
        
        const membersInCellsPercent = users.length > 0 
          ? Math.round((membersInCellsCount / users.length) * 100)
          : 0;

        console.log('📊 Dashboard Stats Final:', {
          totalMembers: users.length,
          totalGroups: groups.length,
          cellGroups: cellGroups.length,
          membersInCells: membersInCellsCount,
          percentage: membersInCellsPercent
        });

        setStats({
          totalMembers: users.length,
          membersInGroups: membersInCellsCount,
          membersInGroupsPercent: membersInCellsPercent,
          membersWithoutGroup: Math.max(0, users.length - membersInCellsCount),
          newMembersThisWeek: newMembersThisWeek.length,
          growthRate: Math.round(growthRate),
          activeGroups: cellGroups.filter(g => (g.member_count || 0) > 0).length,
          totalGroups: groups.length,
        });

        // Load events (mural)
        const eventsResponse = await api.get(`/events/church/${user.church_id}`, {
          params: { skip: 0, limit: EVENTS_PER_PAGE }
        });
        setEvents(eventsResponse.data);
        setCurrentPage(0);
        setHasMoreEvents(eventsResponse.data.length >= EVENTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading church data:', error);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMore || !hasMoreEvents || !currentUser?.church_id) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const skip = nextPage * EVENTS_PER_PAGE;
      
      const eventsResponse = await api.get(`/events/church/${currentUser.church_id}`, {
        params: { skip, limit: EVENTS_PER_PAGE }
      });
      const newEvents = eventsResponse.data;

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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChurchData();
    await loadOnboardingProgress();
    setRefreshing(false);
  };

  const handleViewQRCode = () => {
    navigation.navigate('ChurchQRCode', { church });
  };

  const handleOpenChecklist = () => {
    navigation.navigate('ChurchOnboardingChecklist', { church });
  };

  const handleDismissOnboarding = async () => {
    try {
      // Marcar todos como completo para esconder
      const completeChecklist = { location: true, groups: true, implantation: true };
      await AsyncStorage.setItem(`${CHECKLIST_STORAGE_KEY}_${church._id}`, JSON.stringify(completeChecklist));
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error dismissing onboarding:', error);
    }
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
      await api.post(`/users/${user._id}/welcome`, {
        from_user_id: currentUser._id,
        event_id: eventId
      });

      Alert.alert(
        'Boas-vindas enviadas! 👋',
        `${user.name} receberá sua mensagem de boas-vindas.`
      );

      // Reload to update counts
      await loadChurchData();
    } catch (error) {
      if (error.response?.status === 400) {
        Alert.alert('Atenção', 'Você já deu boas-vindas para esta pessoa neste evento.');
      } else {
        Alert.alert('Erro', 'Não foi possível enviar boas-vindas.');
      }
      console.error(error);
    }
  };

  if (!church) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <MuralFeed
        events={events}
        currentUserId={currentUser?._id}
        onViewProfile={handleViewProfile}
        onWelcome={handleWelcome}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showTitle={true}
        onLoadMore={loadMoreEvents}
        hasMoreEvents={hasMoreEvents}
        loadingMore={loadingMore}
        headerComponent={
          <>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Olá, Admin</Text>
            <Text style={styles.churchName}>{church.name}</Text>
          </View>
          <TouchableOpacity style={styles.qrButton} onPress={handleViewQRCode}>
            <Text style={styles.qrButtonText}>QR</Text>
          </TouchableOpacity>
        </View>

        {/* Onboarding Progress Card */}
        {showOnboarding && onboardingChecklist && (
          <View style={styles.onboardingCard}>
            <View style={styles.onboardingHeader}>
              <View style={styles.onboardingTitleRow}>
                <Text style={styles.onboardingIcon}>🚀</Text>
                <View style={styles.onboardingTitleContent}>
                  <Text style={styles.onboardingTitle}>Configure sua igreja</Text>
                  <Text style={styles.onboardingSubtitle}>
                    Complete os passos para começar
                  </Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.dismissButton}
                onPress={handleDismissOnboarding}
              >
                <Ionicons name="close" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.onboardingProgress}>
              <View style={styles.onboardingProgressBar}>
                {Object.values(onboardingChecklist).map((completed, index) => (
                  <View 
                    key={index}
                    style={[
                      styles.onboardingProgressSegment,
                      completed && styles.onboardingProgressSegmentComplete
                    ]} 
                  />
                ))}
              </View>
              <Text style={styles.onboardingProgressText}>
                {Object.values(onboardingChecklist).filter(Boolean).length} de 3
              </Text>
            </View>

            {/* Quick Items */}
            <View style={styles.onboardingItems}>
              {!onboardingChecklist.location && (
                <View style={styles.onboardingItem}>
                  <Ionicons name="location" size={16} color={colors.success} />
                  <Text style={styles.onboardingItemText}>Configurar localização</Text>
                </View>
              )}
              {!onboardingChecklist.implantation && (
                <View style={styles.onboardingItem}>
                  <Ionicons name="rocket" size={16} color={colors.primary} />
                  <Text style={styles.onboardingItemText}>Tutorial de implantação</Text>
                  <View style={styles.importantBadge}>
                    <Text style={styles.importantBadgeText}>!</Text>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={styles.onboardingButton}
              onPress={handleOpenChecklist}
            >
              <Text style={styles.onboardingButtonText}>Continuar configuração</Text>
              <Ionicons name="arrow-forward" size={18} color="white" />
            </TouchableOpacity>
          </View>
        )}

        {/* Total Members Card */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>Total de Membros</Text>
            <Text style={styles.heroNumber}>{stats.totalMembers}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaText}>
                +{stats.newMembersThisWeek} esta semana
              </Text>
              {stats.growthRate !== 0 && (
                <View style={[styles.growthBadge, stats.growthRate > 0 ? styles.growthPositive : styles.growthNegative]}>
                  <Text style={styles.growthText}>
                    {stats.growthRate > 0 ? '↑' : '↓'} {Math.abs(stats.growthRate)}%
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Members Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCardMedium}>
            <View style={styles.statHeader}>
              <View style={styles.statBadgeContainer}>
                <Text style={styles.statPercentage}>{stats.membersInGroupsPercent}%</Text>
              </View>
            </View>
            <Text style={styles.statNumberMedium}>{stats.membersInGroups}</Text>
            <Text style={styles.statLabelMedium}>Em Grupos de Célula</Text>
          </View>

          <View style={styles.statCardMedium}>
            <View style={styles.statHeader}>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>!</Text>
              </View>
            </View>
            <Text style={styles.statNumberMedium}>{stats.membersWithoutGroup}</Text>
            <Text style={styles.statLabelMedium}>Fora de Células</Text>
          </View>
        </View>
          </>
        }
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
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs / 2,
  },
  churchName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  qrButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  qrButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  // Hero Card (Total Members)
  heroCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    marginHorizontal: spacing.lg,
    ...shadows.medium,
  },
  heroContent: {
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: fontSize.md,
    color: 'white',
    opacity: 0.9,
    fontWeight: fontWeight.medium,
    marginBottom: spacing.xs,
  },
  heroNumber: {
    fontSize: 72,
    fontWeight: fontWeight.bold,
    color: 'white',
    marginBottom: spacing.sm,
    lineHeight: 72,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroMetaText: {
    fontSize: fontSize.sm,
    color: 'white',
    opacity: 0.9,
    fontWeight: fontWeight.medium,
  },
  growthBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  growthPositive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  growthNegative: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
  },
  growthText: {
    color: 'white',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  statCardMedium: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.small,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statBadgeContainer: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  statPercentage: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  alertBadge: {
    backgroundColor: '#FFE0B2',
    width: 24,
    height: 24,
    borderRadius: borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: '#E65100',
  },
  statNumberMedium: {
    fontSize: 36,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  statLabelMedium: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },

  // Onboarding Card
  onboardingCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    ...shadows.medium,
  },
  onboardingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  onboardingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  onboardingIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  onboardingTitleContent: {
    flex: 1,
  },
  onboardingTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xxs,
    letterSpacing: -0.3,
  },
  onboardingSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
  dismissButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
  onboardingProgress: {
    marginBottom: spacing.md,
  },
  onboardingProgressBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  onboardingProgressSegment: {
    flex: 1,
    height: 6,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xs,
  },
  onboardingProgressSegmentComplete: {
    backgroundColor: colors.primary,
  },
  onboardingProgressText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
  onboardingItems: {
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  onboardingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  onboardingItemText: {
    fontSize: fontSize.sm,
    color: colors.text,
    flex: 1,
    letterSpacing: -0.1,
  },
  importantBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importantBadgeText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  onboardingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  onboardingButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'white',
    letterSpacing: -0.2,
  },
});
