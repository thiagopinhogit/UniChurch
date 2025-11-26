import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';
import { getUserById } from '../services/api';

export default function PersonProfileScreen({ route, navigation }) {
  const { person: initialPerson, userId } = route.params || {};
  const [person, setPerson] = useState(initialPerson);
  const [loading, setLoading] = useState(!initialPerson && !!userId);

  useEffect(() => {
    // Se não temos person mas temos userId, buscar da API
    if (!initialPerson && userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const response = await getUserById(userId);
      setPerson(response.data);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil do usuário');
    } finally {
      setLoading(false);
    }
  };

  // Se está carregando, mostrar loading
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Se person não existir, mostrar mensagem de erro
  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erro ao carregar perfil</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleOpenWhatsApp = () => {
    if (person?.whatsapp && person?.show_whatsapp) {
      const phone = person.whatsapp.replace(/\D/g, '');
      Linking.openURL(`https://wa.me/55${phone}`);
    }
  };

  const handleOpenInstagram = () => {
    if (person?.instagram && person?.show_instagram) {
      const username = person.instagram.replace('@', '');
      Linking.openURL(`https://instagram.com/${username}`);
    }
  };

  const handleOpenLinkedIn = () => {
    if (person?.linkedin && person?.show_linkedin) {
      Linking.openURL(`https://linkedin.com/in/${person.linkedin}`);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image 
            source={person?.photo_url ? { uri: person.photo_url } : require('../../assets/default-avatar.png')}
            style={styles.avatar}
          />
          <Text style={styles.name}>{person?.name || 'Nome não disponível'}</Text>
          {person?.profession && (
            <Text style={styles.profession}>{person.profession}</Text>
          )}
        </View>

        {person?.interests && person.interests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Interesses</Text>
            <View style={styles.tagsContainer}>
              {person.interests.map((interest, index) => (
                <View key={index} style={styles.tag}>
                  {interest?.emoji && <Text style={styles.emoji}>{interest.emoji}</Text>}
                  <Text style={styles.tagText}>{interest?.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {person?.cell_id && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Célula</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>🏠</Text>
              <Text style={styles.infoText}>{person.cell_id.name}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contato</Text>
          
          {person?.show_whatsapp && person?.whatsapp && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleOpenWhatsApp}
            >
              <Text style={styles.contactIcon}>📱</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>{person.whatsapp}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}

          {person?.show_instagram && person?.instagram && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleOpenInstagram}
            >
              <Text style={styles.contactIcon}>📸</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>Instagram</Text>
                <Text style={styles.contactValue}>@{person.instagram}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}

          {person?.show_linkedin && person?.linkedin && (
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleOpenLinkedIn}
            >
              <Text style={styles.contactIcon}>💼</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>LinkedIn</Text>
                <Text style={styles.contactValue}>{person.linkedin}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          )}

          {(!person?.show_whatsapp && !person?.show_instagram && !person?.show_linkedin) && (
            <View style={styles.noContactContainer}>
              <Text style={styles.noContactText}>
                Este membro não compartilhou informações de contato
              </Text>
            </View>
          )}
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
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  header: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.card,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    marginBottom: spacing.md,
    backgroundColor: colors.border,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  profession: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  welcomeCount: {
    fontSize: fontSize.sm,
    color: colors.primary,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
    marginTop: spacing.sm,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  emoji: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  infoText: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  contactValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },
  arrow: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  noContactContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  noContactText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  backButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  backButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
});

