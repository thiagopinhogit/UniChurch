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

export default function OnboardingInterestAreaScreen({ route, navigation }) {
  const { church, userData, allInterests } = route.params;
  const [selectedAreas, setSelectedAreas] = useState([]);

  const areas = allInterests.filter(i => i.category === 'AREA_INTERESSE');

  const toggleArea = (areaId) => {
    setSelectedAreas(prev => {
      if (prev.includes(areaId)) {
        return prev.filter(id => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  const handleFinish = async () => {
    navigation.navigate('OnboardingAgeRange', {
      church,
      allInterests,
      userData: {
        ...userData,
        areas: selectedAreas
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingAgeRange', {
      church,
      allInterests,
      userData: {
        ...userData,
        areas: []
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Área de Interesse</Text>
        <Text style={styles.subtitle}>
          Quais assuntos você gosta de conversar?
        </Text>
        <Text style={styles.counter}>
          {selectedAreas.length} {selectedAreas.length === 1 ? 'selecionado' : 'selecionados'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tagsContainer}>
          {areas.map(area => (
            <InterestTag
              key={area._id}
              name={area.name}
              emoji={area.emoji}
              selected={selectedAreas.includes(area._id)}
              onPress={() => toggleArea(area._id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Próximo" 
          onPress={handleFinish}
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

