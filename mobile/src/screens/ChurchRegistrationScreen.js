import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput,
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert,
  TouchableOpacity,
  Image
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { createChurch } from '../services/api';
import { saveUser } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function ChurchRegistrationScreen({ navigation }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [qrCodeId, setQrCodeId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const generateQRCode = () => {
    if (name && city) {
      const slug = `${name}-${city}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setQrCodeId(slug);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoUrl(result.assets[0].uri);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, digite o nome da igreja.');
      return;
    }

    if (!city.trim()) {
      Alert.alert('Atenção', 'Por favor, digite a cidade.');
      return;
    }

    if (!qrCodeId.trim()) {
      Alert.alert('Atenção', 'Por favor, defina um código único para o QR Code.');
      return;
    }

    if (!adminName.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu nome completo.');
      return;
    }

    if (!adminEmail.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu email.');
      return;
    }

    if (!adminPassword.trim()) {
      Alert.alert('Atenção', 'Por favor, crie uma senha.');
      return;
    }

    if (adminPassword.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      Alert.alert('Atenção', 'As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      const churchData = {
        name: name.trim(),
        city: city.trim(),
        qr_code_id: qrCodeId.trim(),
        logo_url: logoUrl || 'https://via.placeholder.com/150',
        admin_name: adminName.trim(),
        admin_email: adminEmail.trim().toLowerCase(),
        admin_password: adminPassword
      };

      const response = await createChurch(churchData);
      
      // Autenticar automaticamente o administrador
      const adminUser = {
        _id: response.data._id,
        name: response.data.admin_name,
        email: response.data.admin_email,
        church_id: response.data._id,
        church_name: response.data.name,
        isAdmin: true,
        qr_code_id: response.data.qr_code_id
      };

      await saveUser(adminUser);

      Alert.alert(
        'Sucesso! 🎉',
        `Igreja cadastrada com sucesso!`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.replace('ChurchOnboardingWelcome', { church: response.data })
          }
        ]
      );
    } catch (error) {
      if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.error || 'Já existe uma igreja com este código QR ou email. Tente outro.';
        Alert.alert('Erro', errorMsg);
      } else {
        Alert.alert('Erro', 'Não foi possível cadastrar a igreja. Tente novamente.');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cadastre sua igreja</Text>
          <Text style={styles.subtitle}>
            Preencha os dados para criar o perfil da sua igreja no UniChurch
          </Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity style={styles.logoButton} onPress={pickImage}>
            {logoUrl ? (
              <Image source={{ uri: logoUrl }} style={styles.logoPreview} />
            ) : (
              <>
                <Text style={styles.logoIcon}>📷</Text>
                <Text style={styles.logoText}>Adicionar logo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome da igreja *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Igreja Comunidade Cristã"
              placeholderTextColor={colors.textSecondary}
              onBlur={generateQRCode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Cidade *</Text>
            <TextInput
              style={styles.input}
              value={city}
              onChangeText={setCity}
              placeholder="Ex: São Paulo"
              placeholderTextColor={colors.textSecondary}
              onBlur={generateQRCode}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Código único do QR Code *</Text>
            <Text style={styles.helperText}>
              Este código será usado pelos membros para encontrar sua igreja
            </Text>
            <TextInput
              style={styles.input}
              value={qrCodeId}
              onChangeText={setQrCodeId}
              placeholder="Ex: igreja-comunidade-sp"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>Dados do Administrador</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seu nome completo *</Text>
            <TextInput
              style={styles.input}
              value={adminName}
              onChangeText={setAdminName}
              placeholder="Ex: João Silva"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Seu email *</Text>
            <Text style={styles.helperText}>
              Use este email para fazer login e gerenciar a igreja
            </Text>
            <TextInput
              style={styles.input}
              value={adminEmail}
              onChangeText={setAdminEmail}
              placeholder="Ex: admin@igreja.com"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha *</Text>
            <Text style={styles.helperText}>
              Mínimo de 6 caracteres
            </Text>
            <TextInput
              style={styles.input}
              value={adminPassword}
              onChangeText={setAdminPassword}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar senha *</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Digite sua senha novamente"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Após o cadastro, você receberá um QR Code para compartilhar com os membros da sua igreja.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cadastrar igreja"
          onPress={handleRegister}
          loading={loading}
          disabled={!name || !city || !qrCodeId || !adminName || !adminEmail || !adminPassword || !confirmPassword}
          size="large"
        />
        <Button
          title="Voltar"
          onPress={() => navigation.goBack()}
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
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  form: {
    marginBottom: spacing.xl,
  },
  logoButton: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.xl,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: spacing.xs,
  },
  logoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.xxl,
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
  helperText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    lineHeight: 18,
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
    fontSize: 24,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  divider: {
    marginVertical: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
  },
  dividerText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
});

