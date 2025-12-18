import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser } from '../services/storage';

export default function AdminMembersScreen({ navigation }) {
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, newThisWeek: 0, withoutGroup: 0 });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const loadMembers = async () => {
    try {
      const user = await getUser();
      if (user && user.church_id) {
        const response = await api.get(`/users/church/${user.church_id}`);
        const membersData = response.data;
        setMembers(membersData);
        
        // Calculate stats
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const newMembers = membersData.filter(m => new Date(m.created_at) > oneWeekAgo).length;

        setStats({
          total: membersData.length,
          newThisWeek: newMembers,
          withoutGroup: 0 // TODO: Calculate from groups
        });
      }
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const filterMembers = () => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const filtered = members.filter(member => 
        member.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredMembers(filtered);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getAgeDisplay = (birthDate) => {
    if (!birthDate) return '';
    const age = new Date().getFullYear() - new Date(birthDate).getFullYear();
    return `${age} anos`;
  };

  const handleToggleAdmin = async (member) => {
    const isAdmin = member.is_church_admin;
    Alert.alert(
      isAdmin ? 'Remover Admin da Igreja' : 'Promover a Admin da Igreja',
      isAdmin 
        ? `Remover ${member.name} como administrador da igreja?\n\nEle perderá acesso ao painel administrativo.`
        : `Promover ${member.name} a administrador da igreja?\n\nEle poderá gerenciar membros, grupos e configurações.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: isAdmin ? 'Remover' : 'Promover',
          style: isAdmin ? 'destructive' : 'default',
          onPress: async () => {
            try {
              await api.patch(`/users/${member._id}/toggle-admin`);
              Alert.alert(
                'Sucesso',
                isAdmin 
                  ? `${member.name} não é mais admin da igreja`
                  : `${member.name} agora é admin da igreja`
              );
              await loadMembers();
            } catch (error) {
              console.error('Error toggling admin:', error);
              Alert.alert('Erro', 'Não foi possível atualizar as permissões');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Membros</Text>
        <Text style={styles.subtitle}>{stats.total} membros cadastrados</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.newThisWeek}</Text>
          <Text style={styles.statLabel}>Novos na semana</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar membro..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Members List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredMembers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado ainda'}
            </Text>
          </View>
        ) : (
          filteredMembers.map((member, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.memberCard}
              onPress={() => navigation.navigate('PersonProfile', { userId: member._id })}
              onLongPress={() => handleToggleAdmin(member)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
              </View>
              <View style={styles.memberInfo}>
                <View style={styles.memberNameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.is_church_admin && (
                    <View style={styles.adminBadge}>
                      <Text style={styles.adminBadgeText}>Admin da Igreja</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberDetails}>
                  {getAgeDisplay(member.birth_date)}
                  {member.life_phase && ` • ${member.life_phase}`}
                </Text>
              </View>
              <Text style={styles.memberArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.small,
  },
  statNumber: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
  },
  clearIcon: {
    fontSize: 20,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sm,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: 'white',
  },
  memberInfo: {
    flex: 1,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  adminBadge: {
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  memberDetails: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  memberArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

