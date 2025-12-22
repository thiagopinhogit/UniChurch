import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { colors, spacing, fontSize, fontWeight } from '../styles/theme';
import Button from '../components/Button';
import InterestTag from '../components/InterestTag';

export default function OnboardingAgeRangeScreen({ route, navigation }) {
  const { church, userData, allInterests } = route.params;
  const [selectedAge, setSelectedAge] = useState(null);

  // Filtrar apenas as faixas etárias
  const ageRanges = allInterests.filter(i => i.category === 'FAIXA_ETARIA');

  const toggleAge = (ageId) => {
    // Só permite selecionar uma faixa etária
    setSelectedAge(ageId === selectedAge ? null : ageId);
  };

  const handleNext = () => {
    const ageArray = selectedAge ? [selectedAge] : [];
    navigation.navigate('OnboardingLifePhase', {
      church,
      allInterests,
      userData: {
        ...userData,
        ageRange: ageArray
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingLifePhase', {
      church,
      allInterests,
      userData: {
        ...userData,
        ageRange: []
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Faixa Etária</Text>
        <Text style={styles.subtitle}>
          Qual a sua idade?
        </Text>
        {selectedAge && (
          <Text style={styles.counter}>
            1 selecionado
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tagsContainer}>
          {ageRanges.map(age => (
            <InterestTag
              key={age._id}
              name={age.name}
              emoji={age.emoji}
              selected={selectedAge === age._id}
              onPress={() => toggleAge(age._id)}
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

