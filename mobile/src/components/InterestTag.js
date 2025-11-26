import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight } from '../styles/theme';

export default function InterestTag({ name, emoji, selected, onPress }) {
  return (
    <TouchableOpacity 
      style={[styles.tag, selected && styles.tagSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.text, selected && styles.textSelected]}>{name}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.round, // Pill shape
    paddingVertical: spacing.sm + 2, // Mais altura
    paddingHorizontal: spacing.md + 4, // Mais largura
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    minHeight: 44, // Touch target adequado
  },
  tagSelected: {
    backgroundColor: colors.primaryLight + '20', // 20% de opacidade
    borderColor: colors.primary,
    borderWidth: 2,
  },
  emoji: {
    fontSize: fontSize.md + 2,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
  },
  textSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
});

