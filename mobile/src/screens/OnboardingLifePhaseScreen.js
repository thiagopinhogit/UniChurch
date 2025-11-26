import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView
} from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../styles/theme';
import Button from '../components/Button';
import InterestTag from '../components/InterestTag';

export default function OnboardingLifePhaseScreen({ route, navigation }) {
  const { church, userData, allInterests } = route.params;
  const [selectedPhases, setSelectedPhases] = useState([]);

  // Filtrar apenas estados civis e situações familiares (sem faixas etárias)
  const phases = allInterests.filter(i => 
    i.category === 'FASE_VIDA' && !(
      i.name.includes('(') || 
      i.name.includes('Jovem') || 
      i.name.includes('Adulto') || 
      i.name.includes('Meia') || 
      i.name.includes('Melhor')
    )
  );

  const togglePhase = (phaseId) => {
    setSelectedPhases(prev => {
      if (prev.includes(phaseId)) {
        return prev.filter(id => id !== phaseId);
      } else {
        return [...prev, phaseId];
      }
    });
  };

  const handleNext = () => {
    // Combina todos os interesses selecionados
    const allSelectedInterests = [
      ...(userData.sports || []),
      ...(userData.hobbies || []),
      ...(userData.areas || []),
      ...(userData.ageRange || []),
      ...selectedPhases
    ];

    // Navega para redes sociais passando todos os dados
    navigation.navigate('OnboardingSocial', {
      church,
      userData: {
        name: userData.name,
        interests: allSelectedInterests
      }
    });
  };

  const handleSkip = () => {
    const allSelectedInterests = [
      ...(userData.sports || []),
      ...(userData.hobbies || []),
      ...(userData.areas || []),
      ...(userData.ageRange || [])
    ];

    navigation.navigate('OnboardingSocial', {
      church,
      userData: {
        name: userData.name,
        interests: allSelectedInterests
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Fase da Vida</Text>
        <Text style={styles.subtitle}>
          Em qual momento você está agora?
        </Text>
        <Text style={styles.counter}>
          {selectedPhases.length} {selectedPhases.length === 1 ? 'selecionado' : 'selecionados'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tagsContainer}>
          {phases.map(phase => (
            <InterestTag
              key={phase._id}
              name={phase.name}
              emoji={phase.emoji}
              selected={selectedPhases.includes(phase._id)}
              onPress={() => togglePhase(phase._id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Próximo" 
          onPress={handleNext}
          size="large"
        />
        <Button 
          title="Pular esta etapa" 
          onPress={handleSkip}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  counter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginTop: spacing.sm,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: spacing.xs + 2,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});

