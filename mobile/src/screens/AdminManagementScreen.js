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
  Alert,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser } from '../services/storage';

export default function AdminManagementScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, admins: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, members]);

  const loadData = async () => {
    try {
      const user = await getUser();
      setCurrentUser(user);

      if (user && user.church_id) {
        const response = await api.get(`/users/church/${user.church_id}`);
        const membersData = response.data;
        setMembers(membersData);
        
        // Calculate stats
        const adminsCount = membersData.filter(m => m.is_church_admin).length;

        setStats({
          total: membersData.length,
          admins: adminsCount
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
    await loadData();
    setRefreshing(false);
  };

  const getInitials = (name) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleToggleAdmin = async (member) => {
    // Não pode remover a si mesmo como admin
    if (member._id === currentUser._id) {
      Alert.alert(
        'Ação não permitida',
        'Você não pode remover seu próprio status de administrador.'
      );
      return;
    }

    const isAdmin = member.is_church_admin;
    
    Alert.alert(
      isAdmin ? 'Remover Administrador' : 'Promover a Administrador',
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
                  ? `${member.name} não é mais administrador`
                  : `${member.name} agora é administrador`
              );
              await loadData();
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
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Administradores</Text>
          <Text style={styles.subtitle}>{stats.admins} de {stats.total} membros</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={styles.infoText}>
          Administradores têm acesso total ao painel de gestão da igreja e podem gerenciar membros, grupos e configurações.
        </Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          <Text style={styles.statNumber}>{stats.admins}</Text>
          <Text style={styles.statLabel}>Administradores</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={28} color={colors.textSecondary} />
          <Text style={styles.statNumber}>{stats.total - stats.admins}</Text>
          <Text style={styles.statLabel}>Membros</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar membro..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
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
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado ainda'}
            </Text>
          </View>
        ) : (
          filteredMembers.map((member, index) => {
            const isCurrentUser = member._id === currentUser?._id;
            
            return (
              <TouchableOpacity 
                key={index} 
                style={styles.memberCard}
                onPress={() => !isCurrentUser && handleToggleAdmin(member)}
                activeOpacity={isCurrentUser ? 1 : 0.7}
              >
                {member.photo_url ? (
                  <Image 
                    source={{ uri: member.photo_url }} 
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
                  </View>
                )}
                
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    {isCurrentUser && (
                      <View style={styles.youBadge}>
                        <Text style={styles.youBadgeText}>Você</Text>
                      </View>
                    )}
                  </View>
                  {member.email && (
                    <Text style={styles.memberEmail}>{member.email}</Text>
                  )}
                </View>

                <View style={[
                  styles.checkbox,
                  member.is_church_admin && styles.checkboxChecked
                ]}>
                  {member.is_church_admin && (
                    <Ionicons name="shield-checkmark" size={18} color="white" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={styles.bottomHint}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textTertiary} />
          <Text style={styles.hintText}>
            Toque em um membro para promover ou remover como administrador
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs / 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight + '15',
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    padding: spacing.md + spacing.xs,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  statCardPrimary: {
    backgroundColor: colors.primaryLight + '15',
    borderColor: colors.primary + '30',
  },
  statNumber: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xs,
    marginBottom: spacing.xs / 2,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: fontWeight.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.md,
    color: colors.text,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
  memberEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  youBadge: {
    backgroundColor: colors.primaryLight + '30',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  youBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  bottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  hintText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    flex: 1,
  },
});

