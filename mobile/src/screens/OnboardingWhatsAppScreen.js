import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function OnboardingWhatsAppScreen({ route, navigation }) {
  const { church, userData } = route.params;
  const [whatsapp, setWhatsapp] = useState('');
  const [showWhatsApp, setShowWhatsApp] = useState(false);

  const formatPhoneNumber = (text) => {
    // Remove tudo que não é número
    const numbers = text.replace(/\D/g, '');
    
    // Formata (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (text) => {
    const formatted = formatPhoneNumber(text);
    setWhatsapp(formatted);
  };

  const handleNext = () => {
    navigation.navigate('OnboardingPrivacy', {
      church,
      userData: {
        ...userData,
        whatsapp: whatsapp.replace(/\D/g, ''), // Salva apenas números
        showWhatsApp: showWhatsApp
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingPrivacy', {
      church,
      userData: {
        ...userData,
        whatsapp: '',
        showWhatsApp: false
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adicione seu WhatsApp</Text>
        <Text style={styles.subtitle}>
          Facilite o contato com outros membros
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* WhatsApp Input - Destaque */}
        <View style={styles.whatsappSection}>
          <View style={[
            styles.whatsappInputContainer,
            whatsapp.length >= 14 && styles.whatsappInputSuccess
          ]}>
            <Text style={styles.whatsappIcon}>📱</Text>
            <TextInput
              style={styles.whatsappInput}
              value={whatsapp}
              onChangeText={handlePhoneChange}
              placeholder="(11) 99999-9999"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
              maxLength={15}
            />
            {whatsapp.length >= 14 && (
              <Text style={styles.checkIconInline}>✅</Text>
            )}
          </View>
        </View>

        {/* Opção de visibilidade */}
        <TouchableOpacity 
          style={styles.visibilityOption}
          onPress={() => setShowWhatsApp(!showWhatsApp)}
          activeOpacity={0.7}
        >
          <View style={styles.checkbox}>
            {showWhatsApp && <View style={styles.checkboxFilled} />}
          </View>
          <View style={styles.visibilityText}>
            <Text style={styles.visibilityTitle}>
              Mostrar meu WhatsApp no perfil
            </Text>
            <Text style={styles.visibilitySubtext}>
              Outros membros poderão ver e entrar em contato
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Adicionar WhatsApp facilita a conexão com outros membros da igreja
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
  whatsappSection: {
    marginBottom: spacing.xl,
  },
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 4,
    borderWidth: 2,
    borderColor: colors.success,
    ...shadows.medium,
  },
  whatsappInputSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.success + '08',
  },
  whatsappIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  whatsappInput: {
    flex: 1,
    fontSize: fontSize.xl,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  checkIconInline: {
    fontSize: 24,
    marginLeft: spacing.sm,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md + 2,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.small,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: spacing.xs,
    borderWidth: 2,
    borderColor: colors.primary,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxFilled: {
    width: 14,
    height: 14,
    borderRadius: spacing.xs - 2,
    backgroundColor: colors.primary,
  },
  visibilityText: {
    flex: 1,
  },
  visibilityTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs - 2,
  },
  visibilitySubtext: {
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
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});

