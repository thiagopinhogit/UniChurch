import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  RefreshControl
} from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../styles/theme';
import EventCard from './EventCard';

export default function MuralFeed({ 
  events = [],
  currentUserId,
  onViewProfile,
  onWelcome,
  refreshing = false,
  onRefresh,
  showTitle = true,
  headerComponent = null
}) {
  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item._id}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
      ListHeaderComponent={
        <>
          {headerComponent}
          {showTitle && (
            <View style={styles.header}>
              <Text style={styles.title}>Mural</Text>
              <Text style={styles.subtitle}>
                O que está acontecendo na nossa igreja
              </Text>
            </View>
          )}
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.cardWrapper}>
          <EventCard
            event={item}
            currentUserId={currentUserId}
            onViewProfile={onViewProfile}
            onWelcome={onWelcome}
          />
        </View>
      )}
      contentContainerStyle={styles.content}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>
            Nenhum evento ainda.
          </Text>
          <Text style={styles.emptySubtext}>
            Quando pessoas entrarem em grupos ou células, aparecerá aqui!
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl * 2,
  },
  cardWrapper: {
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.1,
  },
});

