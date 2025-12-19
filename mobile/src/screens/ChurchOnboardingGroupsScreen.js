import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';
import api from '../services/api';
import { getUser } from '../services/storage';

export default function ChurchOnboardingGroupsScreen({ navigation, route }) {
  const { church, onComplete, onSkip } = route.params || {};
  const [creatingCell, setCreatingCell] = useState(false);
  const [creatingMinistry, setCreatingMinistry] = useState(false);
  const [creatingHobby, setCreatingHobby] = useState(false);
  const [cellCreated, setCellCreated] = useState(false);
  const [ministryCreated, setMinistryCreated] = useState(false);
  const [hobbyCreated, setHobbyCreated] = useState(false);

  const handleCreateTestCell = async () => {
    try {
      setCreatingCell(true);
      
      // Buscar o ID do admin/user atual
      const user = await getUser();
      
      const cellData = {
        name: 'Célula de Exemplo',
        description: 'Esta é uma célula de teste. Você pode editá-la ou excluí-la depois.',
        type: 'CELL',
        church_id: church._id,
        location: 'Endereço da célula',
        schedule: 'Toda sexta-feira às 19h30',
        creator_id: user._id // Adiciona o criador
      };

      const response = await api.post('/groups', cellData);
      setCellCreated(true);
      
      console.log('✅ Célula criada:', response.data);
      
      Alert.alert(
        'Célula criada! 🎉',
        'Você criou sua primeira célula de exemplo. Agora pode ver como funciona!'
      );
    } catch (error) {
      console.error('Error creating test cell:', error);
      Alert.alert('Erro', 'Não foi possível criar a célula de teste.');
    } finally {
      setCreatingCell(false);
    }
  };

  const handleCreateTestMinistry = async () => {
    try {
      setCreatingMinistry(true);
      
      // Buscar o ID do admin/user atual
      const user = await getUser();
      
      const ministryData = {
        name: 'Ministério de Louvor',
        description: 'Ministério responsável pelo louvor e adoração. Este é um exemplo que você pode editar.',
        type: 'MINISTRY',
        church_id: church._id,
        schedule: 'Ensaios às quintas-feiras às 19h',
        creator_id: user._id // Adiciona o criador
      };

      const response = await api.post('/groups', ministryData);
      setMinistryCreated(true);
      
      console.log('✅ Ministério criado:', response.data);
      
      Alert.alert(
        'Ministério criado! 🎉',
        'Você criou seu primeiro ministério de exemplo. Explore as possibilidades!'
      );
    } catch (error) {
      console.error('Error creating test ministry:', error);
      Alert.alert('Erro', 'Não foi possível criar o ministério de teste.');
    } finally {
      setCreatingMinistry(false);
    }
  };

  const handleCreateTestHobby = async () => {
    try {
      setCreatingHobby(true);
      
      // Buscar o ID do admin/user atual
      const user = await getUser();
      
      const hobbyData = {
        name: 'Grupo de Futebol',
        description: 'Grupo para quem gosta de jogar futebol. Junte-se para peladas semanais! Este é um exemplo que você pode editar.',
        type: 'HOBBY',
        church_id: church._id,
        schedule: 'Sábados às 16h no campo',
        creator_id: user._id // Adiciona o criador
      };

      const response = await api.post('/groups', hobbyData);
      setHobbyCreated(true);
      
      console.log('✅ Grupo de hobby criado:', response.data);
      
      Alert.alert(
        'Grupo de hobby criado! 🎉',
        'Você criou seu primeiro grupo de interesse. Ótimo para conectar pessoas!'
      );
    } catch (error) {
      console.error('Error creating test hobby:', error);
      Alert.alert('Erro', 'Não foi possível criar o grupo de hobby.');
    } finally {
      setCreatingHobby(false);
    }
  };

  const handleContinue = () => {
    if (cellCreated || ministryCreated || hobbyCreated) {
      // Criou pelo menos um grupo - marca como completo
      Alert.alert(
        'Ótimo trabalho! 👏',
        'Deseja explorar os grupos agora ou finalizar?',
        [
          {
            text: 'Finalizar',
            onPress: () => {
              if (onComplete) onComplete();
              navigation.goBack();
            }
          },
          {
            text: 'Explorar Grupos',
            onPress: () => {
              if (onComplete) onComplete();
              navigation.navigate('AdminApp', { 
                screen: 'Grupos'
              });
            }
          }
        ]
      );
    } else {
      // Não criou nada - apenas pula (NÃO marca como completo)
      Alert.alert(
        'Pular esta etapa?',
        'Você pode criar grupos depois a qualquer momento.',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Pular',
            onPress: () => {
              if (onSkip) onSkip(); // Usa onSkip ao invés de onComplete
              navigation.goBack();
            }
          }
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>👥</Text>
          <Text style={styles.title}>Organize seus Grupos</Text>
          <Text style={styles.subtitle}>
            Entenda os tipos de grupos e crie exemplos para começar
          </Text>
        </View>

        {/* Explicação */}
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Por que organizar grupos?</Text>
            <Text style={styles.infoText}>
              Grupos ajudam a organizar membros por células, ministérios e eventos. Isso facilita a conexão entre pessoas com interesses similares.
            </Text>
          </View>
        </View>

        {/* Tipos de Grupos */}
        <View style={styles.typesSection}>
          <Text style={styles.sectionTitle}>Tipos de Grupos</Text>

          <View style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="home" size={24} color={colors.primary} />
              </View>
              <Text style={styles.typeName}>Células</Text>
            </View>
            <Text style={styles.typeDescription}>
              Pequenos grupos que se reúnem em casas para comunhão, estudo e oração. Ideal para fortalecer relacionamentos.
            </Text>
            <Text style={styles.typeExample}>Ex: Célula Jovens, Célula Casais, Célula Mulheres</Text>
          </View>

          <View style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIconContainer, { backgroundColor: colors.secondary + '15' }]}>
                <Ionicons name="musical-notes" size={24} color={colors.secondary} />
              </View>
              <Text style={styles.typeName}>Ministérios</Text>
            </View>
            <Text style={styles.typeDescription}>
              Grupos de pessoas que servem juntas em uma área específica da igreja.
            </Text>
            <Text style={styles.typeExample}>Ex: Louvor, Intercessão, Crianças, Mídia</Text>
          </View>

          <View style={styles.typeCard}>
            <View style={styles.typeHeader}>
              <View style={[styles.typeIconContainer, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="football" size={24} color={colors.success} />
              </View>
              <Text style={styles.typeName}>Hobbies e Interesses</Text>
            </View>
            <Text style={styles.typeDescription}>
              Grupos para pessoas com interesses e hobbies em comum se conectarem.
            </Text>
            <Text style={styles.typeExample}>Ex: Futebol, Tênis, Artesanato, Leitura, Culinária</Text>
          </View>
        </View>

        {/* Criar Exemplos */}
        <View style={styles.createSection}>
          <Text style={styles.sectionTitle}>Crie exemplos para testar</Text>
          <Text style={styles.sectionSubtitle}>
            Experimente criar grupos de teste para entender como funciona
          </Text>

          {/* Create Cell Button */}
          <TouchableOpacity 
            style={[
              styles.createCard,
              cellCreated && styles.createCardComplete
            ]}
            onPress={handleCreateTestCell}
            disabled={creatingCell || cellCreated}
          >
            <View style={styles.createCardContent}>
              <View style={styles.createCardLeft}>
                {cellCreated ? (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                ) : (
                  <View style={[styles.createIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="home" size={28} color={colors.primary} />
                  </View>
                )}
                <View style={styles.createCardText}>
                  <Text style={[styles.createCardTitle, cellCreated && styles.createCardTitleComplete]}>
                    {cellCreated ? 'Célula de Exemplo Criada!' : 'Criar Célula de Exemplo'}
                  </Text>
                  <Text style={styles.createCardDescription}>
                    {cellCreated ? 'Você pode editá-la ou excluí-la depois' : 'Crie uma célula de teste para entender'}
                  </Text>
                </View>
              </View>
              {!cellCreated && (
                creatingCell ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Ionicons name="add-circle" size={32} color={colors.primary} />
                )
              )}
            </View>
          </TouchableOpacity>

          {/* Create Ministry Button */}
          <TouchableOpacity 
            style={[
              styles.createCard,
              ministryCreated && styles.createCardComplete
            ]}
            onPress={handleCreateTestMinistry}
            disabled={creatingMinistry || ministryCreated}
          >
            <View style={styles.createCardContent}>
              <View style={styles.createCardLeft}>
                {ministryCreated ? (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                ) : (
                  <View style={[styles.createIconContainer, { backgroundColor: colors.secondary + '15' }]}>
                    <Ionicons name="musical-notes" size={28} color={colors.secondary} />
                  </View>
                )}
                <View style={styles.createCardText}>
                  <Text style={[styles.createCardTitle, ministryCreated && styles.createCardTitleComplete]}>
                    {ministryCreated ? 'Ministério de Exemplo Criado!' : 'Criar Ministério de Exemplo'}
                  </Text>
                  <Text style={styles.createCardDescription}>
                    {ministryCreated ? 'Você pode personalizá-lo depois' : 'Crie um ministério de teste para experimentar'}
                  </Text>
                </View>
              </View>
              {!ministryCreated && (
                creatingMinistry ? (
                  <ActivityIndicator size="small" color={colors.secondary} />
                ) : (
                  <Ionicons name="add-circle" size={32} color={colors.secondary} />
                )
              )}
            </View>
          </TouchableOpacity>

          {/* Create Hobby Group Button */}
          <TouchableOpacity 
            style={[
              styles.createCard,
              hobbyCreated && styles.createCardComplete
            ]}
            onPress={handleCreateTestHobby}
            disabled={creatingHobby || hobbyCreated}
          >
            <View style={styles.createCardContent}>
              <View style={styles.createCardLeft}>
                {hobbyCreated ? (
                  <View style={styles.checkmarkCircle}>
                    <Ionicons name="checkmark" size={20} color="white" />
                  </View>
                ) : (
                  <View style={[styles.createIconContainer, { backgroundColor: colors.success + '15' }]}>
                    <Ionicons name="football" size={28} color={colors.success} />
                  </View>
                )}
                <View style={styles.createCardText}>
                  <Text style={[styles.createCardTitle, hobbyCreated && styles.createCardTitleComplete]}>
                    {hobbyCreated ? 'Grupo de Hobby Criado!' : 'Criar Grupo de Futebol'}
                  </Text>
                  <Text style={styles.createCardDescription}>
                    {hobbyCreated ? 'Grupos de hobby conectam pessoas!' : 'Crie um grupo de interesse para testar'}
                  </Text>
                </View>
              </View>
              {!hobbyCreated && (
                creatingHobby ? (
                  <ActivityIndicator size="small" color={colors.success} />
                ) : (
                  <Ionicons name="add-circle" size={32} color={colors.success} />
                )
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica</Text>
            <Text style={styles.tipText}>
              Você pode editar ou excluir esses grupos de teste a qualquer momento na aba "Grupos" do painel administrativo.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={cellCreated || ministryCreated || hobbyCreated ? "Continuar" : "Pular por enquanto"}
          onPress={handleContinue}
          size="large"
          variant={cellCreated || ministryCreated || hobbyCreated ? "primary" : "secondary"}
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
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    letterSpacing: -0.2,
    paddingHorizontal: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '08',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '20',
    marginBottom: spacing.xl,
  },
  infoIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: -0.1,
  },
  typesSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  typeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  typeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  typeName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  typeDescription: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.xs,
    letterSpacing: -0.1,
  },
  typeExample: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontStyle: 'italic',
    letterSpacing: -0.1,
  },
  createSection: {
    marginBottom: spacing.xl,
  },
  createCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.small,
  },
  createCardComplete: {
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '05',
  },
  createCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  createIconContainer: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  checkmarkCircle: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  createCardText: {
    flex: 1,
  },
  createCardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xxs,
    letterSpacing: -0.2,
  },
  createCardTitleComplete: {
    color: colors.success,
  },
  createCardDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: colors.warning + '10',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.warning + '30',
  },
  tipIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.2,
  },
  tipText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
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

