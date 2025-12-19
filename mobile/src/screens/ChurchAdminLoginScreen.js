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
  Platform
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';
import api from '../services/api';
import { saveUser } from '../services/storage';

export default function ChurchAdminLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu email.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Atenção', 'Por favor, digite sua senha.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/churches/admin/login', {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });

      // Save church admin data as user
      const adminUser = {
        _id: response.data.church.admin_user_id || response.data.church._id, // Usa admin_user_id se disponível
        name: response.data.church.admin_name,
        email: response.data.church.admin_email,
        church_id: response.data.church._id,
        church_name: response.data.church.name,
        isAdmin: true,
        is_church_admin: true,
        qr_code_id: response.data.church.qr_code_id
      };

      await saveUser(adminUser);

      Alert.alert(
        'Bem-vindo! 👋',
        `Login realizado com sucesso!\n\nVocê está acessando como administrador de ${response.data.church.name}`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.replace('AdminApp', { church: response.data.church })
          }
        ]
      );
    } catch (error) {
      if (error.response?.status === 401) {
        Alert.alert('Erro', 'Email ou senha inválidos.');
      } else {
        Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
      }
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.emoji}>🏛️</Text>
            <Text style={styles.title}>Login Administrativo</Text>
            <Text style={styles.subtitle}>
              Acesse sua conta de administrador da igreja
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Digite seu email"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Senha *</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Digite sua senha"
                placeholderTextColor={colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <Text style={styles.infoText}>
                Use as credenciais que você criou ao cadastrar sua igreja.
              </Text>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
            disabled={!email || !password}
            size="large"
          />
          <Button
            title="Voltar"
            onPress={() => navigation.goBack()}
            variant="secondary"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: spacing.xl * 2,
    marginTop: spacing.xl,
  },
  emoji: {
    fontSize: 80,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl + 4,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.1,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 4,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
    letterSpacing: -0.2,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight + '15',
    padding: spacing.md + 4,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
    marginTop: spacing.md,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});

