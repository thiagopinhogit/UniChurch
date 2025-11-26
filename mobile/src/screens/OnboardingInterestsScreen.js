import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { getInterests } from '../services/api';
import { colors, spacing, fontSize, fontWeight, borderRadius } from '../styles/theme';
import Button from '../components/Button';
import InterestTag from '../components/InterestTag';

export default function OnboardingInterestsScreen({ route, navigation }) {
  const { church, userData } = route.params;
  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      const response = await getInterests();
      setInterests(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar os interesses.');
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId);
      } else {
        return [...prev, interestId];
      }
    });
  };

  const handleNext = () => {
    if (selectedInterests.length < 3) {
      Alert.alert('Atenção', 'Selecione pelo menos 3 interesses.');
      return;
    }

    navigation.navigate('OnboardingSocial', {
      church,
      userData: {
        ...userData,
        interests: selectedInterests
      }
    });
  };

  const groupedInterests = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {});

  const categoryLabels = {
    'ESPORTE': '⚽ Esportes & Atividades',
    'HOBBY': '🎨 Hobbies & Lazer',
    'FASE_VIDA': '👥 Fase da Vida',
    'AREA_INTERESSE': '💼 Área de Interesse'
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
        <Text style={styles.title}>O que tem a ver com você?</Text>
        <Text style={styles.subtitle}>
          Selecione entre 3 e 10 opções que mais combinam com você
        </Text>
        <Text style={styles.counter}>
          {selectedInterests.length} selecionado{selectedInterests.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(groupedInterests).map(([category, items]) => (
          <View key={category} style={styles.category}>
            <Text style={styles.categoryTitle}>{categoryLabels[category] || category}</Text>
            <View style={styles.tagsContainer}>
              {items.map(interest => (
                <InterestTag
                  key={interest._id}
                  name={interest.name}
                  emoji={interest.emoji}
                  selected={selectedInterests.includes(interest._id)}
                  onPress={() => toggleInterest(interest._id)}
                />
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continuar" 
          onPress={handleNext}
          size="large"
          disabled={selectedInterests.length < 3 || selectedInterests.length > 10}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs + 2,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.md + 1,
    color: colors.textSecondary,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  counter: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginTop: spacing.md + 4,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  category: {
    marginBottom: spacing.xl + 4,
  },
  categoryTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md + 4,
    letterSpacing: -0.3,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: spacing.xl,
  },
});

