import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getChurch, saveChurch } from '../services/storage';

export default function ChurchEditScreen({ navigation }) {
  const [church, setChurch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    admin_name: '',
    admin_email: '',
    logo_url: ''
  });

  useEffect(() => {
    loadChurch();
  }, []);

  const loadChurch = async () => {
    try {
      const churchData = await getChurch();
      if (churchData) {
        setChurch(churchData);
        setFormData({
          name: churchData.name || '',
          admin_name: churchData.admin_name || '',
          admin_email: churchData.admin_email || '',
          logo_url: churchData.logo_url || ''
        });
      }
    } catch (error) {
      console.error('Error loading church:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da igreja');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    Alert.alert(
      'Adicionar Logo',
      'Escolha uma opção:',
      [
        {
          text: 'URL da Imagem',
          onPress: handleImageUrl
        },
        {
          text: 'Galeria',
          onPress: pickFromGallery
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const handleImageUrl = () => {
    Alert.prompt(
      'URL da Logo',
      'Cole o link da imagem:',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: (url) => {
            if (url && url.trim()) {
              setFormData(prev => ({ ...prev, logo_url: url.trim() }));
              Alert.alert('Sucesso!', 'Logo atualizada. Clique em "Salvar" para confirmar.');
            }
          }
        }
      ],
      'plain-text',
      formData.logo_url
    );
  };

  const pickFromGallery = async () => {
    try {
      // Pedir permissão para acessar galeria
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos');
        return;
      }

      // Abrir galeria
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        // Por enquanto, usar a URI local
        // TODO: Implementar upload no backend
        setFormData(prev => ({ ...prev, logo_url: result.assets[0].uri }));
        Alert.alert('Sucesso!', 'Logo atualizada. Clique em "Salvar" para confirmar.');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  const handleSave = async () => {
    try {
      // Validação
      if (!formData.name.trim()) {
        Alert.alert('Atenção', 'O nome da igreja é obrigatório');
        return;
      }

      setSaving(true);

      // Atualizar igreja
      const response = await api.put(`/churches/${church._id}`, formData);
      
      // Atualizar storage local
      await saveChurch(response.data);
      
      Alert.alert(
        'Sucesso!',
        'As informações da igreja foram atualizadas',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving church:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Informações da Igreja</Text>

        {/* Logo */}
        <View style={styles.logoSection}>
          <Text style={styles.label}>Logo da Igreja</Text>
          <TouchableOpacity 
            style={styles.logoContainer}
            onPress={handlePickImage}
            disabled={uploadingLogo}
          >
            {formData.logo_url ? (
              <Image 
                source={{ uri: formData.logo_url }} 
                style={styles.logoImage}
              />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.logoPlaceholderIcon}>📷</Text>
                <Text style={styles.logoPlaceholderText}>Adicionar Logo</Text>
              </View>
            )}
            {uploadingLogo && (
              <View style={styles.logoOverlay}>
                <ActivityIndicator color="white" size="large" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.logoHint}>
            Toque para selecionar uma imagem da galeria
          </Text>
        </View>

        {/* Nome da Igreja */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome da Igreja *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Nome da igreja"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        {/* Administrador */}
        <Text style={styles.sectionTitle}>Administrador</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nome do Admin</Text>
          <TextInput
            style={styles.input}
            value={formData.admin_name}
            onChangeText={(text) => setFormData({ ...formData, admin_name: text })}
            placeholder="Nome do administrador"
            placeholderTextColor={colors.textTertiary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email do Admin</Text>
          <TextInput
            style={styles.input}
            value={formData.admin_email}
            onChangeText={(text) => setFormData({ ...formData, admin_email: text })}
            placeholder="email@igreja.com"
            placeholderTextColor={colors.textTertiary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xl,
    letterSpacing: -0.5,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logoPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  logoPlaceholderIcon: {
    fontSize: 40,
    marginBottom: spacing.xs,
  },
  logoPlaceholderText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  logoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'white',
  },
});

