import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';

export default function PersonCard({ person, onPress }) {
  const displayInterests = person.interests?.slice(0, 3) || [];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image 
        source={person.photo_url ? { uri: person.photo_url } : require('../../assets/default-avatar.png')}
        style={styles.avatar}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{person.name}</Text>
        {person.profession && (
          <Text style={styles.profession}>{person.profession}</Text>
        )}
        {displayInterests.length > 0 && (
          <View style={styles.tagsContainer}>
            {displayInterests.map((interest, index) => (
              <View key={index} style={styles.tag}>
                {interest.emoji && <Text style={styles.emoji}>{interest.emoji}</Text>}
                <Text style={styles.tagText}>{interest.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl, // 24px
    padding: spacing.lg, // Mais espaçamento
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  avatar: {
    width: 68, // Avatar maior para destaque
    height: 68,
    borderRadius: borderRadius.round,
    backgroundColor: colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md + 4, // Mais espaço
    justifyContent: 'center',
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs - 2,
    letterSpacing: -0.3,
  },
  profession: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: -0.1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xxs,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm, // 12px
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    marginRight: spacing.xs,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emoji: {
    fontSize: fontSize.sm,
    marginRight: 4,
  },
  tagText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
});

