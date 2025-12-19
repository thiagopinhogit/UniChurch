import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function ChurchOnboardingWelcomeScreen({ navigation, route }) {
  const { church } = route.params || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Bem-vindo ao UniChurch!</Text>
          <Text style={styles.churchName}>{church?.name}</Text>
          <Text style={styles.subtitle}>
            Sua igreja foi cadastrada com sucesso! Agora vamos te guiar pelos próximos passos para maximizar a conexão na sua comunidade.
          </Text>
        </View>

        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>📍</Text>
            </View>
            <Text style={styles.featureTitle}>Configure a localização</Text>
            <Text style={styles.featureDescription}>
              Adicione o endereço para membros encontrarem sua igreja facilmente
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>👥</Text>
            </View>
            <Text style={styles.featureTitle}>Organize grupos</Text>
            <Text style={styles.featureDescription}>
              Crie grupos de ministérios, células e eventos (opcional)
            </Text>
          </View>

          <View style={styles.featureCard}>
            <View style={styles.featureIconContainer}>
              <Text style={styles.featureIcon}>🚀</Text>
            </View>
            <Text style={styles.featureTitle}>Tutorial de implantação</Text>
            <Text style={styles.featureDescription}>
              Aprenda a estratégia comprovada para aumentar a conexão na igreja
            </Text>
          </View>
        </View>

        <View style={styles.highlightBox}>
          <Text style={styles.highlightIcon}>💡</Text>
          <View style={styles.highlightContent}>
            <Text style={styles.highlightTitle}>Por que isso é importante?</Text>
            <Text style={styles.highlightText}>
              Uma implantação estratégica, começando pelos líderes e cascateando até os membros, garante maior engajamento e fortalece os laços comunitários da sua igreja.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Começar configuração"
          onPress={() => navigation.navigate('ChurchOnboardingChecklist', { church })}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  churchName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: spacing.sm,
  },
  featuresContainer: {
    marginBottom: spacing.xl,
  },
  featureCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primaryLight + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.3,
  },
  featureDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  highlightBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '08',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '20',
    marginTop: spacing.md,
  },
  highlightIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  highlightContent: {
    flex: 1,
  },
  highlightTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  highlightText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});
