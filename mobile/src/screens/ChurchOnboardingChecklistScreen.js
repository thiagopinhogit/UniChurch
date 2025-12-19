import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

const CHECKLIST_STORAGE_KEY = '@church_onboarding_checklist';

export default function ChurchOnboardingChecklistScreen({ navigation, route }) {
  const { church } = route.params || {};
  
  const [checklist, setChecklist] = useState({
    location: false,
    groups: false,
    implantation: false,
  });

  useEffect(() => {
    loadChecklistState();
  }, []);

  // Recarregar sempre que a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      loadChecklistState();
    }, [church])
  );

  const loadChecklistState = async () => {
    try {
      const savedState = await AsyncStorage.getItem(`${CHECKLIST_STORAGE_KEY}_${church?._id}`);
      if (savedState) {
        setChecklist(JSON.parse(savedState));
      }
    } catch (error) {
      console.error('Error loading checklist:', error);
    }
  };

  const saveChecklistState = async (newState) => {
    try {
      await AsyncStorage.setItem(`${CHECKLIST_STORAGE_KEY}_${church?._id}`, JSON.stringify(newState));
      setChecklist(newState);
    } catch (error) {
      console.error('Error saving checklist:', error);
    }
  };

  const markAsComplete = (item) => {
    const newState = { ...checklist, [item]: true };
    saveChecklistState(newState);
  };

  const handleLocationSetup = () => {
    navigation.navigate('ChurchLocation', {
      church,
      onComplete: () => {
        markAsComplete('location');
      }
    });
  };

  const handleGroupsSetup = () => {
    Alert.alert(
      'Grupos e Ministérios',
      'Deseja configurar grupos agora ou deixar para depois?',
      [
        {
          text: 'Deixar para depois',
          onPress: () => markAsComplete('groups'),
          style: 'cancel'
        },
        {
          text: 'Configurar agora',
          onPress: () => {
            navigation.navigate('AdminApp', { 
              screen: 'Grupos',
              params: { fromOnboarding: true }
            });
            markAsComplete('groups');
          }
        }
      ]
    );
  };

  const handleImplantationGuide = () => {
    navigation.navigate('ChurchImplantationGuide', {
      church,
      onComplete: () => {
        markAsComplete('implantation');
      }
    });
  };

  const handleFinish = () => {
    const allComplete = Object.values(checklist).every(item => item);
    
    if (!allComplete) {
      Alert.alert(
        'Itens pendentes',
        'Ainda há itens não concluídos. Deseja finalizar mesmo assim? Você pode completar depois nas configurações.',
        [
          { text: 'Continuar configurando', style: 'cancel' },
          {
            text: 'Finalizar',
            onPress: () => navigation.replace('AdminApp')
          }
        ]
      );
    } else {
      Alert.alert(
        'Parabéns! 🎉',
        'Configuração concluída! Sua igreja está pronta para conectar pessoas.',
        [
          {
            text: 'Ir para o painel',
            onPress: () => navigation.replace('AdminApp')
          }
        ]
      );
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Checklist de Configuração</Text>
          <Text style={styles.subtitle}>
            Complete os passos abaixo para preparar sua igreja
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount} de {totalCount} concluídos
            </Text>
            <Text style={styles.progressPercentage}>
              {Math.round(progress)}%
            </Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Checklist Items */}
        <View style={styles.checklistContainer}>
          {/* Location */}
          <ChecklistItem
            icon="location"
            title="Configurar localização"
            description="Adicione o endereço da sua igreja"
            completed={checklist.location}
            onPress={handleLocationSetup}
            priority="high"
          />

          {/* Groups */}
          <ChecklistItem
            icon="people"
            title="Cadastrar grupos e ministérios"
            description="Organize células, ministérios e eventos (opcional)"
            completed={checklist.groups}
            onPress={handleGroupsSetup}
            priority="medium"
            optional
          />

          {/* Implantation Guide - Most Important */}
          <ChecklistItem
            icon="rocket"
            title="Tutorial de implantação"
            description="A estratégia para aumentar a conexão na sua igreja"
            completed={checklist.implantation}
            onPress={handleImplantationGuide}
            priority="critical"
            badge="Mais importante"
          />
        </View>

        <View style={styles.tipBox}>
          <Text style={styles.tipIcon}>💡</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Dica importante</Text>
            <Text style={styles.tipText}>
              O tutorial de implantação é o passo mais crucial! Ele mostra como implementar o UniChurch de forma estratégica na sua igreja.
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={completedCount === totalCount ? "Finalizar configuração" : "Pular para depois"}
          onPress={handleFinish}
          size="large"
          variant={completedCount === totalCount ? "primary" : "secondary"}
        />
      </View>
    </SafeAreaView>
  );
}

function ChecklistItem({ icon, title, description, completed, onPress, priority, optional, badge }) {
  const getPriorityColor = () => {
    switch (priority) {
      case 'critical': return colors.primary;
      case 'high': return colors.success;
      case 'medium': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity 
      style={[
        styles.checklistItem,
        completed && styles.checklistItemCompleted
      ]}
      onPress={onPress}
      disabled={completed}
    >
      <View style={styles.checklistItemLeft}>
        <View style={[
          styles.checkbox,
          completed && styles.checkboxCompleted
        ]}>
          {completed ? (
            <Ionicons name="checkmark" size={20} color={colors.card} />
          ) : (
            <Ionicons name={icon} size={20} color={getPriorityColor()} />
          )}
        </View>
      </View>

      <View style={styles.checklistItemContent}>
        <View style={styles.checklistItemHeader}>
          <Text style={[
            styles.checklistItemTitle,
            completed && styles.checklistItemTitleCompleted
          ]}>
            {title}
          </Text>
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
          {optional && !badge && (
            <Text style={styles.optionalText}>(Opcional)</Text>
          )}
        </View>
        <Text style={styles.checklistItemDescription}>
          {description}
        </Text>
      </View>

      <View style={styles.checklistItemRight}>
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={completed ? colors.textTertiary : colors.textSecondary} 
        />
      </View>
    </TouchableOpacity>
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
  progressContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.1,
  },
  progressPercentage: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    letterSpacing: -0.3,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  checklistContainer: {
    marginBottom: spacing.lg,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  checklistItemCompleted: {
    opacity: 0.6,
    borderColor: colors.success + '30',
    backgroundColor: colors.success + '05',
  },
  checklistItemLeft: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checklistItemContent: {
    flex: 1,
  },
  checklistItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxs,
    flexWrap: 'wrap',
  },
  checklistItemTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.2,
    marginRight: spacing.xs,
  },
  checklistItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  checklistItemDescription: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  checklistItemRight: {
    marginLeft: spacing.sm,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs + 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: fontSize.xxs,
    fontWeight: fontWeight.semibold,
    color: colors.card,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionalText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '08',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.primary + '20',
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
    marginBottom: spacing.xxs,
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

