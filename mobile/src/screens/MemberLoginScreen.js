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

export default function MemberLoginScreen({ navigation, route }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async () => {
    // Validações
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu email.');
      return;
    }

    if (!password) {
      Alert.alert('Atenção', 'Por favor, digite sua senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/login', {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      // Save user data locally
      await saveUser(response.data.user);

      // Busca e salva os dados da igreja
      const churchResponse = await api.get(`/churches/${response.data.user.church_id}`);
      await saveChurch(churchResponse.data);

      Alert.alert(
        'Bem-vindo de volta! 👋',
        'Login realizado com sucesso!',
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
      console.error('Login error:', error);
      if (error.response?.data?.error) {
        Alert.alert('Erro', error.response.data.error);
      } else {
        Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: Implementar Google Sign-In
    Alert.alert('Em breve', 'Login com Google será implementado em breve.');
  };

  const handleAppleLogin = async () => {
    // TODO: Implementar Apple Sign-In
    Alert.alert('Em breve', 'Login com Apple será implementado em breve.');
  };

  const handleSignupInstead = () => {
    navigation.navigate('QRScanner');
  };

  const handleForgotPassword = () => {
    // TODO: Implementar recuperação de senha
    Alert.alert('Em breve', 'Recuperação de senha será implementada em breve.');
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
            <Text style={styles.title}>Fazer Login</Text>
            <Text style={styles.subtitle}>
              Entre com suas credenciais
            </Text>
          </View>

          {/* Email/Password Form */}
          <View style={styles.form}>
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
                  placeholder="Digite sua senha"
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

            {/* Forgot Password Link */}
            <TouchableOpacity 
              onPress={handleForgotPassword}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <Button
              title="Entrar"
              onPress={handleEmailLogin}
              loading={loading}
              style={styles.submitButton}
            />
          </View>

          {/* Signup Link */}
          <View style={styles.signupLink}>
            <Text style={styles.signupLinkText}>Não tem uma conta? </Text>
            <TouchableOpacity onPress={handleSignupInstead}>
              <Text style={styles.signupLinkButton}>Criar Conta (Escaneie QR)</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
  },
  forgotPasswordText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  signupLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  signupLinkText: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
  },
  signupLinkButton: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
});

