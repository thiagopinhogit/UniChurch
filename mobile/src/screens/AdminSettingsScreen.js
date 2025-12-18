import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import { getUser, clearAll } from '../services/storage';
import api from '../services/api';

export default function AdminSettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [allowMembersCreateGroups, setAllowMembersCreateGroups] = useState(false);
  const [isUpdatingPermission, setIsUpdatingPermission] = useState(false);

  useEffect(() => {
    loadUser();
    loadChurch();
  }, []);

  // Recarregar igreja quando a tela ganhar foco
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadChurch();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUser = async () => {
    const userData = await getUser();
    setUser(userData);
  };

  const loadChurch = async () => {
    try {
      const userData = await getUser();
      if (userData && userData.church_id) {
        const response = await api.get(`/churches/${userData.church_id}`);
        setChurch(response.data);
        setAllowMembersCreateGroups(response.data.allow_members_create_groups || false);
      }
    } catch (error) {
      console.error('Error loading church:', error);
    }
  };

  const handleToggleGroupCreation = async (value) => {
    // Evita múltiplas chamadas simultâneas
    if (isUpdatingPermission) return;
    
    setIsUpdatingPermission(true);
    
    try {
      await api.patch(`/churches/${user.church_id}/settings`, {
        allow_members_create_groups: value
      });
      setAllowMembersCreateGroups(value);
      Alert.alert(
        'Configuração atualizada',
        value 
          ? 'Agora todos os membros podem criar grupos'
          : 'Apenas administradores podem criar grupos'
      );
    } catch (error) {
      console.error('Error updating settings:', error);
      Alert.alert('Erro', 'Não foi possível atualizar a configuração');
      // Reverte o valor em caso de erro
      setAllowMembersCreateGroups(!value);
    } finally {
      setIsUpdatingPermission(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta de administrador?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await clearAll();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Initial' }],
            });
          }
        }
      ]
    );
  };

  const handleViewQRCode = () => {
    if (user && user.church_id) {
      navigation.navigate('ChurchQRCode', { 
        church: {
          _id: user.church_id,
          name: user.church_name,
          qr_code_id: user.qr_code_id
        }
      });
    }
  };

  if (!user) {
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Configurações</Text>
          <Text style={styles.subtitle}>Gerenciar igreja e conta</Text>
        </View>

        {/* Church Info Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações da Igreja</Text>
          <View style={styles.churchCard}>
            <View style={styles.churchIcon}>
              {church?.logo_url ? (
                <Image 
                  source={{ uri: church.logo_url }} 
                  style={styles.churchLogo}
                />
              ) : (
                <Text style={styles.churchEmoji}>🏛️</Text>
              )}
            </View>
            <View style={styles.churchInfo}>
              <Text style={styles.churchName}>{user.church_name}</Text>
              <Text style={styles.churchEmail}>{user.email}</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Igreja</Text>
          
          <TouchableOpacity style={styles.settingCard} onPress={handleViewQRCode}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>QR</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>QR Code da Igreja</Text>
              <Text style={styles.settingDescription}>
                Visualizar e compartilhar QR Code
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('ChurchEdit')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>✎</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Editar Informações</Text>
              <Text style={styles.settingDescription}>
                Nome e dados do administrador
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('ChurchLocation', { church })}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⌖</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Localização</Text>
              <Text style={styles.settingDescription}>
                Atualizar endereço e coordenadas
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Permissions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Permissões</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>◉</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Criação de Grupos</Text>
              <Text style={styles.settingDescription}>
                {allowMembersCreateGroups 
                  ? 'Todos os membros podem criar grupos'
                  : 'Apenas administradores podem criar grupos'
                }
              </Text>
            </View>
            <Switch
              value={allowMembersCreateGroups}
              onValueChange={handleToggleGroupCreation}
              disabled={isUpdatingPermission}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={allowMembersCreateGroups ? colors.primary : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🔒</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Alterar Senha</Text>
              <Text style={styles.settingDescription}>
                Atualizar senha de acesso
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingCard}
            onPress={() => navigation.navigate('AdminManagement')}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>⚙</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Administradores</Text>
              <Text style={styles.settingDescription}>
                Gerenciar acesso de outros admins
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sobre</Text>
          
          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>?</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Ajuda e Suporte</Text>
              <Text style={styles.settingDescription}>
                Central de ajuda e contato
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>ⓘ</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Termos e Privacidade</Text>
              <Text style={styles.settingDescription}>
                Políticas do aplicativo
              </Text>
            </View>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.settingCard}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>v</Text>
            </View>
            <View style={styles.settingInfo}>
              <Text style={styles.settingTitle}>Versão do App</Text>
              <Text style={styles.settingDescription}>1.0.0</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair da Conta</Text>
        </TouchableOpacity>

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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  churchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    ...shadows.small,
  },
  churchIcon: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  churchEmoji: {
    fontSize: 32,
  },
  churchLogo: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.round,
  },
  churchInfo: {
    flex: 1,
  },
  churchName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  churchEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  settingEmoji: {
    fontSize: 24,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
  },
  settingDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  settingArrow: {
    fontSize: 24,
    color: colors.textSecondary,
    marginLeft: spacing.sm,
  },
  logoutButton: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5252',
  },
  logoutText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: '#FF5252',
  },
});

