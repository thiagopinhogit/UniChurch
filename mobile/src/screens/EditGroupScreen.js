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
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getGroupById, updateGroup, toggleGroupAdmin } from '../services/api';
import Button from '../components/Button';

const GROUP_TYPES = [
  { key: 'CELL', label: 'Célula', icon: 'home' },
  { key: 'MINISTRY', label: 'Ministério', icon: 'heart' },
  { key: 'SPORT', label: 'Esporte', icon: 'football' },
  { key: 'PROFESSION', label: 'Profissão', icon: 'briefcase' },
  { key: 'HOBBY', label: 'Hobby', icon: 'color-palette' },
];

export default function EditGroupScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [whatsappLink, setWhatsappLink] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    loadGroup();
  }, []);

  const loadGroup = async () => {
    try {
      const response = await getGroupById(groupId);
      const group = response.data;
      
      setName(group.name);
      setDescription(group.description || '');
      setWhatsappLink(group.whatsapp_link || '');
      setSelectedType(group.type);
      setIsPrivate(group.is_private || false);
      setMembers(group.members || []);
      setAdmins(group.admins || []);
    } catch (error) {
      console.error('Error loading group:', error);
      Alert.alert('Erro', 'Não foi possível carregar o grupo.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMemberAdmin = async (memberId) => {
    try {
      const isAdmin = admins.some(adminId => {
        const id = typeof adminId === 'string' ? adminId : adminId._id;
        return id === memberId;
      });

      await toggleGroupAdmin(groupId, memberId);

      // Update local state
      if (isAdmin) {
        setAdmins(admins.filter(adminId => {
          const id = typeof adminId === 'string' ? adminId : adminId._id;
          return id !== memberId;
        }));
      } else {
        setAdmins([...admins, memberId]);
      }

      const member = members.find(m => m._id === memberId);
      Alert.alert(
        'Sucesso',
        isAdmin 
          ? `${member?.name} removido como admin do grupo`
          : `${member?.name} promovido a admin do grupo`
      );
    } catch (error) {
      console.error('Error toggling admin:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as permissões');
    }
  };

  const handleUpdateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o grupo');
      return;
    }

    if (!selectedType) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de grupo');
      return;
    }

    setSaving(true);
    try {
      const groupData = {
        name: name.trim(),
        description: description.trim(),
        whatsapp_link: whatsappLink.trim(),
        type: selectedType,
        is_private: isPrivate,
      };

      await updateGroup(groupId, groupData);
      
      Alert.alert(
        'Sucesso',
        'Grupo atualizado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating group:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o grupo. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Grupo</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Nome do Grupo */}
        <View style={styles.section}>
          <Text style={styles.label}>Nome do Grupo *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Células Zona Norte, Futebol Masculino..."
            placeholderTextColor={colors.textSecondary}
            value={name}
            onChangeText={setName}
            maxLength={50}
          />
        </View>

        {/* Tipo de Grupo */}
        <View style={styles.section}>
          <Text style={styles.label}>Tipo de Grupo *</Text>
          <View style={styles.typeGrid}>
            {GROUP_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeCard,
                  selectedType === type.key && styles.typeCardSelected,
                  type.key === 'CELL' && styles.typeCardCell
                ]}
                onPress={() => setSelectedType(type.key)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.typeIconContainer,
                  selectedType === type.key && styles.typeIconContainerSelected,
                  type.key === 'CELL' && selectedType === type.key && styles.typeIconContainerCell
                ]}>
                  <Ionicons
                    name={`${type.icon}-outline`}
                    size={24}
                    color={
                      selectedType === type.key
                        ? type.key === 'CELL'
                          ? colors.primary
                          : colors.primary
                        : colors.textSecondary
                    }
                  />
                </View>
                <Text style={[
                  styles.typeLabel,
                  selectedType === type.key && styles.typeLabelSelected
                ]}>
                  {type.label}
                </Text>
                {type.key === 'CELL' && (
                  <View style={styles.cellBadge}>
                    <Text style={styles.cellBadgeText}>Especial</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Privacidade do Grupo */}
        <View style={styles.section}>
          <Text style={styles.label}>Privacidade do Grupo *</Text>
          <Text style={styles.helperText}>
            Escolha quem pode entrar no grupo
          </Text>
          
          <View style={styles.privacyContainer}>
            <TouchableOpacity
              style={[
                styles.privacyOption,
                !isPrivate && styles.privacyOptionActive
              ]}
              onPress={() => setIsPrivate(false)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.privacyIconContainer,
                !isPrivate && styles.privacyIconContainerActive
              ]}>
                <Ionicons 
                  name="globe-outline" 
                  size={28} 
                  color={!isPrivate ? colors.primary : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.privacyTitle,
                !isPrivate && styles.privacyTitleActive
              ]}>
                Aberto
              </Text>
              <Text style={styles.privacyDescription}>
                Qualquer membro pode entrar diretamente
              </Text>
              {!isPrivate && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.privacyOption,
                isPrivate && styles.privacyOptionActive
              ]}
              onPress={() => setIsPrivate(true)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.privacyIconContainer,
                isPrivate && styles.privacyIconContainerActive
              ]}>
                <Ionicons 
                  name="lock-closed-outline" 
                  size={28} 
                  color={isPrivate ? colors.primary : colors.textSecondary} 
                />
              </View>
              <Text style={[
                styles.privacyTitle,
                isPrivate && styles.privacyTitleActive
              ]}>
                Privado
              </Text>
              <Text style={styles.privacyDescription}>
                Requer aprovação de um administrador
              </Text>
              {isPrivate && (
                <View style={styles.selectedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Descrição */}
        <View style={styles.section}>
          <Text style={styles.label}>Descrição (opcional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descreva o propósito e objetivos do grupo..."
            placeholderTextColor={colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={200}
            textAlignVertical="top"
          />
          <Text style={styles.charCounter}>
            {description.length}/200 caracteres
          </Text>
        </View>

        {/* Link do WhatsApp */}
        <View style={styles.section}>
          <Text style={styles.label}>Link do Grupo no WhatsApp (opcional)</Text>
          <Text style={styles.helperText}>
            Cole aqui o link de convite do grupo do WhatsApp
          </Text>
          <View style={styles.whatsappInputContainer}>
            <Ionicons name="logo-whatsapp" size={20} color={colors.success} style={styles.whatsappIcon} />
            <TextInput
              style={[styles.input, styles.whatsappInput]}
              placeholder="https://chat.whatsapp.com/..."
              placeholderTextColor={colors.textSecondary}
              value={whatsappLink}
              onChangeText={setWhatsappLink}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>
        </View>

        {/* Gerenciar Administradores */}
        {members.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.label}>Administradores do Grupo</Text>
            <Text style={styles.helperText}>
              Administradores podem gerenciar membros e configurações deste grupo
            </Text>
            
            <View style={styles.adminsList}>
              {members.filter(member => member != null).map((member, index) => {
                const isAdmin = admins.some(adminId => {
                  const id = typeof adminId === 'string' ? adminId : adminId._id;
                  return id === member._id;
                });

                return (
                  <TouchableOpacity
                    key={index}
                    style={styles.memberCard}
                    onPress={() => handleToggleMemberAdmin(member._id)}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={member.photo_url ? { uri: member.photo_url } : require('../../assets/default-avatar.png')}
                      style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                      <Text style={styles.memberName}>{member.name}</Text>
                      {isAdmin && (
                        <View style={styles.adminBadgeSmall}>
                          <Ionicons name="shield-checkmark" size={12} color={colors.primary} />
                          <Text style={styles.adminBadgeTextSmall}>Admin do Grupo</Text>
                        </View>
                      )}
                    </View>
                    <View style={[
                      styles.checkbox,
                      isAdmin && styles.checkboxChecked
                    ]}>
                      {isAdmin && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Info Card para Células */}
        {selectedType === 'CELL' && (
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.infoText}>
              Células são grupos especiais de comunhão e discipulado que se reúnem regularmente em casas ou locais específicos.
            </Text>
          </View>
        )}

        {/* Info Card para Grupos Privados */}
        {isPrivate && (
          <View style={[styles.infoCard, styles.infoCardPrivate]}>
            <Ionicons name="shield-checkmark" size={20} color={colors.warning} />
            <Text style={styles.infoText}>
              Você será o administrador e poderá aprovar ou recusar solicitações de entrada no grupo.
            </Text>
          </View>
        )}

        {/* Botão de salvar */}
        <View style={styles.buttonContainer}>
          <Button
            title={saving ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleUpdateGroup}
            disabled={saving || !name.trim() || !selectedType}
          />
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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg + spacing.md,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    letterSpacing: -0.1,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    letterSpacing: -0.2,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
  },
  charCounter: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeCard: {
    width: '48%',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
  },
  typeCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
    ...shadows.small,
  },
  typeCardCell: {
    borderColor: colors.primary + '30',
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeIconContainerSelected: {
    backgroundColor: colors.primaryLight + '30',
  },
  typeIconContainerCell: {
    backgroundColor: colors.primaryLight + '40',
  },
  typeLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  typeLabelSelected: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  cellBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  cellBadgeText: {
    fontSize: fontSize.xs - 2,
    fontWeight: fontWeight.semibold,
    color: 'white',
    letterSpacing: -0.1,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight + '15',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    gap: spacing.sm,
  },
  infoCardPrivate: {
    backgroundColor: colors.warning + '15',
    borderColor: colors.warning + '30',
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  privacyContainer: {
    gap: spacing.md,
  },
  privacyOption: {
    backgroundColor: colors.card,
    padding: spacing.md + 2,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    position: 'relative',
  },
  privacyOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight + '10',
    ...shadows.small,
  },
  privacyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  privacyIconContainerActive: {
    backgroundColor: colors.primaryLight + '30',
  },
  privacyTitle: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs / 2,
    letterSpacing: -0.2,
  },
  privacyTitleActive: {
    color: colors.primary,
  },
  privacyDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  adminsList: {
    gap: spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.round,
    backgroundColor: colors.border,
    marginRight: spacing.md,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.text,
    letterSpacing: -0.2,
  },
  adminBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.primaryLight + '20',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs / 2,
  },
  adminBadgeTextSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  whatsappInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  whatsappIcon: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 1,
  },
  whatsappInput: {
    flex: 1,
    paddingLeft: spacing.md + spacing.lg,
  },
});

