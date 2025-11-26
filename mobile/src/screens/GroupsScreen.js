import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getChurchGroups } from '../services/api';
import { getChurch } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import GroupCard from '../components/GroupCard';

const GROUP_TYPES = [
  { key: 'ALL', label: 'Todos', icon: 'apps' },
  { key: 'CELL', label: 'Células', icon: 'home' },
  { key: 'SPORT', label: 'Esporte', icon: 'football' },
  { key: 'PROFESSION', label: 'Profissão', icon: 'briefcase' },
  { key: 'HOBBY', label: 'Hobby', icon: 'color-palette' },
  { key: 'MINISTRY', label: 'Ministério', icon: 'heart' },
];

export default function GroupsScreen({ navigation }) {
  const [church, setChurch] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (church && church._id) {
      loadGroups(selectedType);
    }
  }, [selectedType, church]);

  // Recarrega quando a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      if (church && church._id) {
        loadGroups(selectedType);
      }
    }, [church, selectedType])
  );

  const loadData = async () => {
    try {
      const churchData = await getChurch();
      setChurch(churchData);
      if (churchData) {
        await loadGroups('ALL');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadGroups = async (type) => {
    if (!church || !church._id) return;
    
    try {
      const response = await getChurchGroups(church._id, type);
      const groupsData = response.data;
      
      // Debug: verificar estrutura dos dados
      if (groupsData.length > 0) {
        console.log('📊 Exemplo de grupo (lista):', JSON.stringify(groupsData[0], null, 2));
      }
      
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleGroupPress = (group) => {
    navigation.navigate('GroupDetail', { group });
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
        <Text style={styles.title}>Grupos</Text>
        <Text style={styles.subtitle}>
          {groups.length} {groups.length === 1 ? 'grupo' : 'grupos'}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {GROUP_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.filterButton,
              selectedType === type.key && styles.filterButtonActive,
              type.key === 'CELL' && selectedType === type.key && styles.filterButtonCell
            ]}
            onPress={() => setSelectedType(type.key)}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={`${type.icon}-outline`} 
              size={16} 
              color={selectedType === type.key ? colors.primary : colors.text}
              style={styles.filterIcon}
            />
            <Text style={[
              styles.filterText,
              selectedType === type.key && styles.filterTextActive
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.groupsList}>
          {groups.length > 0 ? (
            groups.map(group => (
              <GroupCard
                key={group._id}
                group={group}
                onPress={() => handleGroupPress(group)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyText}>
                Nenhum grupo encontrado nesta categoria
              </Text>
            </View>
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
  filterScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  filterContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  filterButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    backgroundColor: colors.card,
    marginRight: spacing.xs,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: spacing.xs - 2,
  },
  filterButtonActive: {
    backgroundColor: colors.primaryLight + '20',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  filterButtonCell: {
    backgroundColor: colors.primaryLight + '25',
  },
  filterIcon: {
    marginRight: spacing.xs / 2,
  },
  filterText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  groupsList: {
    padding: spacing.lg,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.1,
    marginTop: spacing.md,
  },
});

