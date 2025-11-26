import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';

export default function GroupCard({ group, onPress }) {
  const getGroupIcon = (type) => {
    const icons = {
      'CELL': 'home',
      'HOBBY': 'color-palette',
      'PROFESSION': 'briefcase',
      'MINISTRY': 'heart',
      'SPORT': 'football',
    };
    return icons[type] || 'people';
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress} 
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons 
            name={`${getGroupIcon(group.type)}-outline`} 
            size={24} 
            color={colors.text} 
          />
        </View>
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={1}>{group.name}</Text>
          
          {/* Categoria discreta */}
          <View style={styles.categoryRow}>
            {/* <Ionicons name="pricetag-outline" size={12} color={colors.textTertiary} rrrrrrrrrr> */}
            <Text style={styles.categoryText}>{getGroupTypeLabel(group.type)}</Text>
          </View>
          
          {/* Metadados */}
          <View style={styles.footer}>
            <View style={styles.metaItem}>
              <Ionicons 
                name={group.is_private ? 'lock-closed' : 'globe'} 
                size={14} 
                color={group.is_private ? colors.warning : colors.success} 
              />
              <Text style={[
                styles.privacyText,
                group.is_private ? styles.privacyTextPrivate : styles.privacyTextPublic
              ]}>
                {group.is_private ? 'Privado' : 'Aberto'}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.members}>
                {(group.members && group.members.length > 0) 
                  ? group.members.filter(m => m != null).length 
                  : (group.member_count || 0)}
              </Text>
            </View>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </View>
      {group.description && (
        <Text style={styles.description} numberOfLines={2}>
          {group.description}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function getGroupTypeLabel(type) {
  const labels = {
    'CELL': 'Célula',
    'HOBBY': 'Hobby',
    'PROFESSION': 'Profissão',
    'MINISTRY': 'Ministério',
    'SPORT': 'Esporte',
  };
  return labels[type] || type;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: spacing.xs / 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    marginBottom: spacing.xs + 2,
  },
  categoryText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    letterSpacing: -0.1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  separator: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textTertiary,
    marginHorizontal: spacing.sm + 2,
    opacity: 0.5,
  },
  members: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: -0.1,
    fontWeight: fontWeight.medium,
  },
  privacyText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },
  privacyTextPublic: {
    color: colors.success,
  },
  privacyTextPrivate: {
    color: colors.warning,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
});

