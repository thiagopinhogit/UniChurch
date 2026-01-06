import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';
import api from '../services/api';
import { saveUser, saveChurch } from '../services/storage';
import { addUserInterest } from '../services/api';

export default function MemberSignupScreen({ navigation, route }) {
  const { church, onboardingData } = route.params || {};
  
  const [name, setName] = useState(onboardingData?.name || '');
  const [email, setEmail] = useState(onboardingData?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleEmailSignup = async () => {
    // Validações
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu nome completo.');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Atenção', 'Por favor, digite um email válido.');
      return;
    }

    if (!password) {
      Alert.alert('Atenção', 'Por favor, digite uma senha.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        ...onboardingData,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        church_id: church._id
      };

      const response = await api.post('/users/register', userData);

      // Adiciona os interesses se existirem
      if (onboardingData?.interests && onboardingData.interests.length > 0) {
        await Promise.all(
          onboardingData.interests.map(interestId => 
            addUserInterest(response.data.user._id, interestId)
          )
        );
      }

      // Save user data locally
      await saveUser(response.data.user);

      // Save church data locally
      await saveChurch(church);

      Alert.alert(
        'Bem-vindo! 🎉',
        'Sua conta foi criada com sucesso!',
        [
          {
            text: 'Continuar',
            onPress: () => {
              // Navigate to main app
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' }],
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response?.data?.error) {
        Alert.alert('Erro', error.response.data.error);
      } else {
        Alert.alert('Erro', 'Não foi possível criar sua conta. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    // TODO: Implementar Google Sign-In
    Alert.alert('Em breve', 'Login com Google será implementado em breve.');
  };

  const handleAppleSignup = async () => {
    // TODO: Implementar Apple Sign-In
    Alert.alert('Em breve', 'Login com Apple será implementado em breve.');
  };

  const handleLoginInstead = () => {
    navigation.navigate('MemberLogin', { church, onboardingData });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>
              Complete seu cadastro em {church?.name || 'sua igreja'}
            </Text>
          </View>

          {/* Email/Password Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={colors.text.secondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              title="Criar Conta"
              onPress={handleEmailSignup}
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Login Link */}
          <View style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={handleLoginInstead}>
              <Text style={styles.loginLinkButton}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  socialContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    ...shadows.sm,
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  socialButtonText: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.text.secondary,
    fontSize: fontSize.sm,
  },
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text.primary,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
  },
  passwordInput: {
    flex: 1,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text.primary,
  },
  eyeButton: {
    padding: spacing.md,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginLinkText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  loginLinkButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});

