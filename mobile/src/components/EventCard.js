import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, fontSize, fontWeight, shadows } from '../styles/theme';

export default function EventCard({ event, onViewProfile, onWelcome, currentUserId }) {
  const getEventText = () => {
    switch (event.type) {
      case 'NEW_MEMBER':
        return `começou a participar da nossa igreja 🎉`;
      case 'FIRST_CELL':
        return `participou da primeira célula 🙌`;
      case 'JOIN_GROUP_FIRST_TIME':
        return `entrou no primeiro grupo ${event.group_id?.emoji || ''} ${event.group_id?.name || ''}`;
      case 'JOIN_GROUP':
        return `entrou no grupo ${event.group_id?.emoji || ''} ${event.group_id?.name || ''}`;
      default:
        return '';
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffInSeconds = Math.floor((now - eventDate) / 1000);
    
    if (diffInSeconds < 60) return 'agora';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    return `há ${Math.floor(diffInSeconds / 604800)} semanas`;
  };

  const welcomeCount = event.welcome_count || 0;
  const isNewMemberEvent = event.type === 'NEW_MEMBER';
  const hasWelcomes = isNewMemberEvent && welcomeCount > 0;
  // Filter out null users (deleted accounts)
  const welcomedBy = (event.welcomed_by || []).filter(user => user && user.name);
  const canWelcome =
    isNewMemberEvent &&
    event.user_id?._id &&
    currentUserId &&
    event.user_id._id !== currentUserId;
  const handleViewProfile = () => {
    if (onViewProfile && event.user_id) {
      onViewProfile(event.user_id);
    }
  };

  const getWelcomeText = () => {
    if (welcomedBy.length === 0) {
      // If we have welcome count but no valid users, show generic message
      if (welcomeCount > 0) {
        return `${welcomeCount} ${welcomeCount === 1 ? 'pessoa deu' : 'pessoas deram'} boas-vindas`;
      }
      return null;
    }
    
    if (welcomedBy.length === 1) {
      return `${welcomedBy[0].name} deu boas-vindas`;
    }
    
    if (welcomedBy.length === 2) {
      return `${welcomedBy[0].name} e ${welcomedBy[1].name} deram boas-vindas`;
    }
    
    // 3 or more
    const remaining = welcomeCount - 2;
    if (remaining > 0) {
      return `${welcomedBy[0].name}, ${welcomedBy[1].name} e mais ${remaining} ${remaining === 1 ? 'pessoa deu' : 'pessoas deram'} boas-vindas`;
    } else {
      // Edge case: we have the names for all
      return `${welcomedBy[0].name}, ${welcomedBy[1].name} e ${welcomedBy[2].name} deram boas-vindas`;
    }
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.header} onPress={handleViewProfile} activeOpacity={0.8}>
        <Image 
          source={event.user_id?.photo_url ? { uri: event.user_id.photo_url } : require('../../assets/default-avatar.png')}
          style={styles.avatar}
        />
        <View style={styles.content}>
          <Text style={styles.text}>
            <Text style={styles.name}>{event.user_id?.name || 'Alguém'}</Text>
            {' '}
            {getEventText()}
          </Text>
          <Text style={styles.time}>{getTimeAgo(event.created_at)}</Text>
        </View>
      </TouchableOpacity>

      {/* Contador de Boas-vindas */}
      {hasWelcomes && (
        <View style={styles.welcomeCountContainer}>
          <View style={styles.welcomeCountBadge}>
            <Text style={styles.welcomeCountEmoji}>👋</Text>
            <Text style={styles.welcomeCountText}>
              {getWelcomeText()}
            </Text>
          </View>
        </View>
      )}

      {canWelcome && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.welcomeButton]}
            onPress={() => onWelcome(event.user_id, event._id)}
          >
            <Text style={styles.welcomeButtonText}>👋 Dar boas-vindas</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl, // 24px para cards principais
    padding: spacing.lg, // Mais espaçamento interno
    marginBottom: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    marginBottom: spacing.md, // Mais espaço entre header e actions
  },
  avatar: {
    width: 56, // Um pouco maior
    height: 56,
    borderRadius: borderRadius.round,
    backgroundColor: colors.borderLight,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24, // Mais altura de linha para legibilidade
    letterSpacing: -0.2,
  },
  name: {
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  time: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  welcomeCountContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  welcomeCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '20',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  welcomeCountEmoji: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  welcomeCountText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.1,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm + 2, // Um pouco mais de altura
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md, // 16px para botões secundários
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  buttonText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
  },
  welcomeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  welcomeButtonText: {
    fontSize: fontSize.sm,
    color: '#FFFFFF',
    fontWeight: fontWeight.semibold,
    letterSpacing: -0.2,
  },
});

