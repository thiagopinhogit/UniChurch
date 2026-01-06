import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function OnboardingPrivacyScreen({ route, navigation }) {
  const { church, userData } = route.params;
  const [privacy, setPrivacy] = useState({
    show_profile: true,
    show_whatsapp: true,
    show_instagram: true,
    show_linkedin: true,
  });

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleComplete = async () => {
    // Prepara todos os dados do onboarding
    const onboardingData = {
      church_id: church._id,
      name: userData.name,
      whatsapp: userData.whatsapp || '',
      instagram: userData.instagram || '',
      interests: userData.interests || [],
      ...privacy
    };

    // Navega para a tela de criação de conta
    navigation.navigate('MemberSignup', { 
      church, 
      onboardingData 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Controle sua privacidade</Text>
        <Text style={styles.subtitle}>
          Escolha o que você quer compartilhar com outros membros
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <PrivacyItem
          icon="👁️"
          title="Mostrar meu perfil para outros membros"
          description="Permite que outros membros vejam seu perfil"
          value={privacy.show_profile}
          onToggle={() => togglePrivacy('show_profile')}
        />

        <PrivacyItem
          icon="📱"
          title="Mostrar meu WhatsApp"
          description="Outros podem ver e entrar em contato pelo WhatsApp"
          value={privacy.show_whatsapp}
          onToggle={() => togglePrivacy('show_whatsapp')}
          disabled={!userData.whatsapp}
        />

        <PrivacyItem
          icon="📸"
          title="Mostrar meu Instagram"
          description="Outros podem ver seu perfil do Instagram"
          value={privacy.show_instagram}
          onToggle={() => togglePrivacy('show_instagram')}
          disabled={!userData.instagram}
        />

        <PrivacyItem
          icon="💼"
          title="Mostrar meu LinkedIn"
          description="Outros podem ver seu perfil do LinkedIn"
          value={privacy.show_linkedin}
          onToggle={() => togglePrivacy('show_linkedin')}
          disabled={!userData.linkedin}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Você pode mudar essas configurações a qualquer momento no seu perfil.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continuar" 
          onPress={handleComplete}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

function PrivacyItem({ icon, title, description, value, onToggle, disabled }) {
  return (
    <View style={[styles.privacyItem, disabled && styles.privacyItemDisabled]}>
      <View style={styles.privacyLeft}>
        <Text style={styles.privacyIcon}>{icon}</Text>
        <View style={styles.privacyText}>
          <Text style={styles.privacyTitle}>{title}</Text>
          <Text style={styles.privacyDescription}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.card}
        disabled={disabled}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  privacyItemDisabled: {
    opacity: 0.5,
  },
  privacyLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  privacyIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  privacyDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
  },
});

