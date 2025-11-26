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

export default function OnboardingSportsScreen({ route, navigation }) {
  const { church, userData, allInterests } = route.params;
  const [selectedSports, setSelectedSports] = useState([]);

  const sports = allInterests.filter(i => i.category === 'ESPORTE');

  const toggleSport = (sportId) => {
    setSelectedSports(prev => {
      if (prev.includes(sportId)) {
        return prev.filter(id => id !== sportId);
      } else {
        return [...prev, sportId];
      }
    });
  };

  const handleNext = () => {
    navigation.navigate('OnboardingHobbies', {
      church,
      allInterests,
      userData: {
        ...userData,
        sports: selectedSports
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingHobbies', {
      church,
      allInterests,
      userData: {
        ...userData,
        sports: []
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Esportes & Atividades</Text>
        <Text style={styles.subtitle}>
          Você pratica algum esporte ou atividade física?
        </Text>
        <Text style={styles.counter}>
          {selectedSports.length} {selectedSports.length === 1 ? 'selecionado' : 'selecionados'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tagsContainer}>
          {sports.map(sport => (
            <InterestTag
              key={sport._id}
              name={sport.name}
              emoji={sport.emoji}
              selected={selectedSports.includes(sport._id)}
              onPress={() => toggleSport(sport._id)}
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

