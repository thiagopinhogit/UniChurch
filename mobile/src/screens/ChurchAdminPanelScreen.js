import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser, clearStorage } from '../services/storage';

export default function ChurchAdminPanelScreen({ navigation, route }) {
  const [church, setChurch] = useState(route.params?.church || null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    newMembersThisWeek: 0,
    activeGroups: 0,
    totalGroups: 0,
    upcomingEvents: 0,
    membersWithoutGroup: 0
  });
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadChurchData();
    configureHeader();
  }, []);

  const configureHeader = () => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={handleSettings} style={{ marginRight: 15 }}>
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </TouchableOpacity>
      ),
    });
  };

  const loadChurchData = async () => {
    try {
      const user = await getUser();
      if (user && user.church_id) {
        // Load church data
        const churchResponse = await api.get(`/churches/${user.church_id}`);
        setChurch(churchResponse.data);

        // Load users
        const usersResponse = await api.get(`/users/church/${user.church_id}`);
        const users = usersResponse.data;
        
        // Calculate new members this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newMembers = users.filter(u => new Date(u.created_at) > oneWeekAgo).length;

        // Load groups
        const groupsResponse = await api.get(`/groups/church/${user.church_id}`);
        const groups = groupsResponse.data;

        // Calculate members without group
        const membersInGroups = new Set();
        groups.forEach(group => {
          if (group.members) {
            group.members.forEach(member => membersInGroups.add(member._id || member));
          }
        });
        const membersWithoutGroup = users.length - membersInGroups.size;

        // Load events
        const eventsResponse = await api.get(`/events/church/${user.church_id}`);
        const events = eventsResponse.data;
        
        // Filter upcoming events
        const now = new Date();
        const upcoming = events.filter(e => new Date(e.date) > now).slice(0, 3);
        setUpcomingEvents(upcoming);

        setStats({
          totalMembers: users.length,
          newMembersThisWeek: newMembers,
          activeGroups: groups.filter(g => g.members && g.members.length > 0).length,
          totalGroups: groups.length,
          upcomingEvents: upcoming.length,
          membersWithoutGroup
        });
      }
    } catch (error) {
      console.error('Error loading church data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChurchData();
    setRefreshing(false);
  };

  const handleSettings = () => {
    Alert.alert(
      'Configurações',
      'O que deseja fazer?',
      [
        { text: 'Editar igreja', onPress: () => console.log('Editar igreja') },
        { text: 'Sair da conta', onPress: handleLogout, style: 'destructive' },
        { text: 'Cancelar', style: 'cancel' }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta de administrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await clearStorage();
            navigation.replace('Initial');
          }
        }
      ]
    );
  };

  const handleViewQRCode = () => {
    navigation.navigate('ChurchQRCode', { church });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Amanhã';
    } else {
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
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
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Olá, Admin 👋</Text>
            <Text style={styles.churchName}>{church.name}</Text>
          </View>
          <TouchableOpacity style={styles.qrButton} onPress={handleViewQRCode}>
            <Text style={styles.qrButtonEmoji}>📱</Text>
          </TouchableOpacity>
        </View>

        {/* Main Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCardLarge, { backgroundColor: colors.primary }]}>
            <Text style={styles.statNumberLarge}>{stats.totalMembers}</Text>
            <Text style={styles.statLabelLarge}>Total de Membros</Text>
            {stats.newMembersThisWeek > 0 && (
              <View style={styles.statBadge}>
                <Text style={styles.statBadgeText}>
                  +{stats.newMembersThisWeek} esta semana
                </Text>
              </View>
            )}
          </View>

          <View style={styles.statRow}>
            <View style={styles.statCardSmall}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumberSmall}>{stats.activeGroups}/{stats.totalGroups}</Text>
              <Text style={styles.statLabelSmall}>Grupos Ativos</Text>
            </View>

            <View style={styles.statCardSmall}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumberSmall}>{stats.upcomingEvents}</Text>
              <Text style={styles.statLabelSmall}>Próximos Eventos</Text>
            </View>
          </View>
        </View>

        {/* Alert Card - Membros sem grupo */}
        {stats.membersWithoutGroup > 0 && (
          <TouchableOpacity style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <Text style={styles.alertEmoji}>⚠️</Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={styles.alertTitle}>
                {stats.membersWithoutGroup} {stats.membersWithoutGroup === 1 ? 'membro' : 'membros'} sem grupo
              </Text>
              <Text style={styles.alertDescription}>
                Ajude-os a se conectar criando ou sugerindo grupos
              </Text>
            </View>
            <Text style={styles.alertArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximos Eventos</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
            
            {upcomingEvents.map((event, index) => (
              <TouchableOpacity key={index} style={styles.eventCard}>
                <View style={styles.eventDate}>
                  <Text style={styles.eventDateText}>{formatDate(event.date)}</Text>
                </View>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription} numberOfLines={1}>
                    {event.description}
                  </Text>
                </View>
                <Text style={styles.eventArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>👥</Text>
              <Text style={styles.actionButtonText}>Membros</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>➕</Text>
              <Text style={styles.actionButtonText}>Novo Evento</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>👫</Text>
              <Text style={styles.actionButtonText}>Novo Grupo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonIcon}>📊</Text>
              <Text style={styles.actionButtonText}>Relatórios</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
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
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  qrButtonEmoji: {
    fontSize: 24,
  },

  // Stats Grid
  statsGrid: {
    marginBottom: spacing.xl,
  },
  statCardLarge: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  statNumberLarge: {
    fontSize: 56,
    fontWeight: fontWeight.bold,
    color: 'white',
    marginBottom: spacing.xs,
  },
  statLabelLarge: {
    fontSize: fontSize.md,
    color: 'white',
    opacity: 0.9,
    fontWeight: fontWeight.medium,
  },
  statBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  statBadgeText: {
    color: 'white',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCardSmall: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.small,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statNumberSmall: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  statLabelSmall: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textAlign: 'center',
  },

  // Alert Card
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  alertEmoji: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#E65100',
    marginBottom: spacing.xs / 2,
  },
  alertDescription: {
    fontSize: fontSize.sm,
    color: '#F57C00',
    lineHeight: 18,
  },
  alertArrow: {
    fontSize: 24,
    color: '#F57C00',
    marginLeft: spacing.sm,
  },

  // Section
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },

  // Event Card
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  eventDate: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventDateText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  eventDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  eventArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },

  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  actionButton: {
    width: '47%',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.small,
  },
  actionButtonIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  actionButtonText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
  },
});

