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

export default function OnboardingHobbiesScreen({ route, navigation }) {
  const { church, userData, allInterests } = route.params;
  const [selectedHobbies, setSelectedHobbies] = useState([]);

  const hobbies = allInterests.filter(i => i.category === 'HOBBY');

  const toggleHobby = (hobbyId) => {
    setSelectedHobbies(prev => {
      if (prev.includes(hobbyId)) {
        return prev.filter(id => id !== hobbyId);
      } else {
        return [...prev, hobbyId];
      }
    });
  };

  const handleNext = () => {
    navigation.navigate('OnboardingInterestArea', {
      church,
      allInterests,
      userData: {
        ...userData,
        hobbies: selectedHobbies
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingInterestArea', {
      church,
      allInterests,
      userData: {
        ...userData,
        hobbies: []
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hobbies & Lazer</Text>
        <Text style={styles.subtitle}>
          O que você gosta de fazer no seu tempo livre?
        </Text>
        <Text style={styles.counter}>
          {selectedHobbies.length} {selectedHobbies.length === 1 ? 'selecionado' : 'selecionados'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.tagsContainer}>
          {hobbies.map(hobby => (
            <InterestTag
              key={hobby._id}
              name={hobby.name}
              emoji={hobby.emoji}
              selected={selectedHobbies.includes(hobby._id)}
              onPress={() => toggleHobby(hobby._id)}
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

