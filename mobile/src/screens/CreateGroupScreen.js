import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { getUser } from '../services/storage';
import Button from '../components/Button';

const GROUP_TYPES = [
  { key: 'CELL', label: 'Célula', icon: 'home' },
  { key: 'MINISTRY', label: 'Ministério', icon: 'heart' },
  { key: 'SPORT', label: 'Esporte', icon: 'football' },
  { key: 'PROFESSION', label: 'Profissão', icon: 'briefcase' },
  { key: 'HOBBY', label: 'Hobby', icon: 'color-palette' },
];

export default function CreateGroupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreateGroup = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome para o grupo');
      return;
    }

    if (!selectedType) {
      Alert.alert('Erro', 'Por favor, selecione um tipo de grupo');
      return;
    }

    setLoading(true);
    try {
      const user = await getUser();
      
      const groupData = {
        name: name.trim(),
        description: description.trim(),
        type: selectedType,
        church_id: user.church_id,
        created_by: user._id,
        members: [user._id], // Criador já entra como membro
        admins: [user._id], // Criador é automaticamente admin
        is_private: isPrivate,
        pending_requests: []
      };

      console.log('📤 Enviando dados do grupo:', JSON.stringify(groupData, null, 2));

      const response = await api.post('/groups', groupData);
      
      console.log('✅ Grupo criado:', JSON.stringify(response.data, null, 2));
      
      Alert.alert(
        'Sucesso',
        'Grupo criado com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating group:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Erro', 'Não foi possível criar o grupo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.title}>Criar Novo Grupo</Text>
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

        {/* Botão de criar */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? 'Criando...' : 'Criar Grupo'}
            onPress={handleCreateGroup}
            disabled={loading || !name.trim() || !selectedType}
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
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
});

