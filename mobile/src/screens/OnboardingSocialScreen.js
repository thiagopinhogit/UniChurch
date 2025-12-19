import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function OnboardingSocialScreen({ route, navigation }) {
  const { church, userData } = route.params;
  const [instagram, setInstagram] = useState('');
  const [instagramData, setInstagramData] = useState(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);

  // Debounce para buscar dados do Instagram
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (instagram && instagram.length > 2) {
        // Apenas valida que o username tem mais de 2 caracteres
        setInstagramData({
          username: instagram.replace('@', '').trim(),
          isValid: true
        });
      } else {
        setInstagramData(null);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [instagram]);

  const handleNext = () => {
    navigation.navigate('OnboardingWhatsApp', {
      church,
      userData: {
        ...userData,
        instagram: instagram.replace('@', '').trim()
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingWhatsApp', {
      church,
      userData: {
        ...userData,
        instagram: ''
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conecte seu Instagram</Text>
        <Text style={styles.subtitle}>
          Sua foto de perfil será importada automaticamente
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Instagram - Destaque */}
        <View style={styles.instagramSection}>
          <View style={[
            styles.instagramInputContainer,
            instagramData && styles.instagramInputSuccess
          ]}>
            <Text style={styles.instagramIcon}>📸</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                style={styles.instagramInput}
                value={instagram}
                onChangeText={(text) => setInstagram(text.replace('@', ''))}
                placeholder="seuusuario"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />
            </View>
            {loadingInstagram && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.inputLoader} />
            )}
            {instagramData && !loadingInstagram && (
              <Text style={styles.checkIconInline}>✅</Text>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Sua foto do Instagram será usada automaticamente no seu perfil. Você pode alterá-la depois se quiser.
          </Text>
        </View>

        <View style={styles.privacyNote}>
          <Text style={styles.privacyIcon}>🔒</Text>
          <Text style={styles.privacyText}>
            Seu Instagram só será visível para outros membros se você escolher compartilhar
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continuar" 
          onPress={handleNext}
          size="large"
        />
        <Button 
          title="Pular esta etapa" 
          onPress={handleSkip}
          variant="secondary"
          style={{ marginTop: spacing.sm }}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  instagramSection: {
    marginBottom: spacing.xl,
  },
  instagramInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 4,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  instagramInputSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.success + '08',
  },
  instagramIcon: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  instagramInput: {
    flex: 1,
    fontSize: fontSize.xl,
    color: colors.text,
    padding: 0,
    fontWeight: fontWeight.medium,
  },
  inputLoader: {
    marginLeft: spacing.sm,
  },
  checkIconInline: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md + 2,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
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
  privacyNote: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  privacyIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  privacyText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});

