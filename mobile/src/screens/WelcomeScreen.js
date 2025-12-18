import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView } from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import Button from '../components/Button';

export default function WelcomeScreen({ route, navigation }) {
  const { church } = route.params || {};

  const handleStart = () => {
    navigation.navigate('OnboardingBasicInfo', { church });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            {church?.logo_url ? (
              <Image source={{ uri: church.logo_url }} style={styles.logo} />
            ) : (
              <Image 
                source={require('../../assets/logo-transparent.png')} 
                style={styles.logo}
                resizeMode="contain"
              />
            )}
          </View>
        </View>

        <Text style={styles.title}>Bem-vindo à</Text>
        <Text style={styles.churchName}>{church?.name || 'UniChurch'}</Text>

        <Text style={styles.subtitle}>
          Vamos te ajudar a se conectar com pessoas e grupos da igreja
        </Text>

        <View style={styles.features}>
          <FeatureItem icon="👥" text="Conheça novos membros" />
          <FeatureItem icon="🤝" text="Encontre grupos de afinidade" />
          <FeatureItem icon="🏠" text="Participe de células" />
          <FeatureItem icon="📱" text="Acompanhe a comunidade" />
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          title="Começar" 
          onPress={handleStart}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    paddingTop: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  logoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 52,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.xs - 2,
    letterSpacing: -0.3,
  },
  churchName: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.6,
    paddingHorizontal: spacing.md,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  features: {
    width: '100%',
    marginTop: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    backgroundColor: colors.card,
    padding: spacing.sm + 4,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  featureIcon: {
    fontSize: 22,
    marginRight: spacing.sm + 2,
    width: 28,
  },
  featureText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
    flex: 1,
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
});

