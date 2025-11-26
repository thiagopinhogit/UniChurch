import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser } from '../services/storage';
import GroupCard from '../components/GroupCard';

export default function AdminGroupsScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [stats, setStats] = useState({ 
    total: 0, 
    cells: 0, 
    others: 0 
  });

  useEffect(() => {
    loadGroups();
  }, []);

  // Recarrega quando a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      loadGroups();
    }, [])
  );

  const loadGroups = async () => {
    try {
      const user = await getUser();
      if (user && user.church_id) {
        const response = await api.get(`/groups/church/${user.church_id}`);
        const groupsData = response.data;
        
        // Debug: verificar estrutura dos dados
        if (groupsData.length > 0) {
          console.log('📊 Exemplo de grupo:', JSON.stringify(groupsData[0], null, 2));
        }
        
        setGroups(groupsData);
        
        // Calculate stats
        const cellGroups = groupsData.filter(g => g.type === 'CELL').length;
        const otherGroups = groupsData.filter(g => g.type !== 'CELL').length;

        setStats({
          total: groupsData.length,
          cells: cellGroups,
          others: otherGroups
        });
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'ALL' || 
      (selectedFilter === 'CELLS' && group.type === 'CELL') ||
      (selectedFilter === 'OTHERS' && group.type !== 'CELL');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
    }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Header */}
      <View style={styles.header}>
          <Text style={styles.title}>Gestão de Grupos</Text>
        <Text style={styles.subtitle}>{stats.total} grupos cadastrados</Text>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total de Grupos</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.cells}</Text>
            <Text style={styles.statLabel}>Células</Text>
        </View>
          
        <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.others}</Text>
            <Text style={styles.statLabel}>Outros Grupos</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'ALL' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('ALL')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'ALL' && styles.filterTabTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'CELLS' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('CELLS')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="home" 
              size={16} 
              color={selectedFilter === 'CELLS' ? colors.primary : colors.textSecondary} 
              style={styles.filterTabIcon}
            />
            <Text style={[styles.filterTabText, selectedFilter === 'CELLS' && styles.filterTabTextActive]}>
              Células
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterTab, selectedFilter === 'OTHERS' && styles.filterTabActive]}
            onPress={() => setSelectedFilter('OTHERS')}
            activeOpacity={0.7}
          >
            <Text style={[styles.filterTabText, selectedFilter === 'OTHERS' && styles.filterTabTextActive]}>
              Outros
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar grupos..."
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

      {/* Add Group Button */}
      <View style={styles.addButtonContainer}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('CreateGroup')}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={24} color="white" style={styles.addButtonIcon} />
          <Text style={styles.addButtonText}>Criar Novo Grupo</Text>
        </TouchableOpacity>
      </View>

      {/* Groups List */}
        <View style={styles.groupsList}>
          {filteredGroups.length === 0 ? (
          <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'Nenhum grupo encontrado' : 'Nenhum grupo cadastrado ainda'}
              </Text>
            <Text style={styles.emptySubtext}>
                {searchQuery 
                  ? 'Tente ajustar sua busca' 
                  : 'Crie grupos para conectar os membros da sua igreja'
                }
            </Text>
          </View>
        ) : (
            filteredGroups.map((group) => (
              <GroupCard
                key={group._id}
                group={group}
              onPress={() => navigation.navigate('GroupDetail', { groupId: group._id })}
              />
            ))
          )}
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
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  filterTabActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
  },
  filterTabIcon: {
    marginRight: spacing.xs - 2,
  },
  filterTabText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    letterSpacing: -0.2,
  },
  filterTabTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: -0.2,
  },
  addButtonContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  addButtonIcon: {
    marginRight: spacing.sm,
  },
  addButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'white',
    letterSpacing: -0.2,
  },
  groupsList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.1,
    lineHeight: 22,
  },
});

