import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { getUserSuggestions, getChurchMembers } from '../services/api';
import { getUser, getChurch } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import PersonCard from '../components/PersonCard';
import Button from '../components/Button';

export default function PeopleScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [church, setChurch] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);
  const [allMembers, setAllMembers] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getUser();
      const churchData = await getChurch();
      setCurrentUser(user);
      setChurch(churchData);

      if (user && churchData) {
        const [suggestionsRes, membersRes] = await Promise.all([
          getUserSuggestions(user._id),
          getChurchMembers(churchData._id)
        ]);

        setSuggestions(suggestionsRes.data);
        setAllMembers(membersRes.data.filter(m => m._id !== user._id));
      }
    } catch (error) {
      console.error('Error loading people:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePersonPress = (person) => {
    navigation.navigate('PersonProfile', { person });
  };

  const handleNextSuggestion = () => {
    if (currentSuggestionIndex < suggestions.length - 1) {
      setCurrentSuggestionIndex(currentSuggestionIndex + 1);
    } else {
      setShowAll(true);
    }
  };

  const handleRemoveSuggestion = () => {
    const newSuggestions = suggestions.filter((_, index) => index !== currentSuggestionIndex);
    setSuggestions(newSuggestions);
    
    if (currentSuggestionIndex >= newSuggestions.length && newSuggestions.length > 0) {
      setCurrentSuggestionIndex(newSuggestions.length - 1);
    }
    
    if (newSuggestions.length === 0) {
      setShowAll(true);
    }
  };

  const currentSuggestion = suggestions[currentSuggestionIndex];

  const filteredMembers = allMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {!showAll && suggestions.length > 0 && currentSuggestion ? (
        <>
          {/* Header discreto no topo */}
          <View style={styles.topHeader}>
            <View style={styles.topHeaderLeft}>
              <Text style={styles.topHeaderCounter}>
                {currentSuggestionIndex + 1} de {suggestions.length}
        </Text>
              <Text style={styles.topHeaderSubtitle}>Pessoas parecidas com você</Text>
            </View>
            {allMembers.length > 0 && (
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => setShowAll(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllButtonText}>Ver todos</Text>
              </TouchableOpacity>
            )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
            <View style={styles.suggestionContainer}>
              <View style={styles.cardShadowContainer}>
                <View style={styles.suggestionCard}>
                  {/* Botão X para remover dentro do card */}
                  <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={handleRemoveSuggestion}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>

                <ScrollView 
                  style={styles.cardScrollView}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.cardScrollContent}
                >
                  <View style={styles.avatarContainer}>
                    {currentSuggestion.photo_url ? (
                      <Image 
                    source={{ uri: currentSuggestion.photo_url }} 
                    style={styles.avatar}
                      />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                          {currentSuggestion.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>

                      <Text style={styles.suggestionName}>{currentSuggestion.name}</Text>

                  {currentSuggestion.commonInterests && currentSuggestion.commonInterests.length > 0 && (
                    <View style={styles.commonInterestsSection}>
                      <Text style={styles.commonInterestsTitle}>
                        ✨ {currentSuggestion.commonInterests.length} {currentSuggestion.commonInterests.length === 1 ? 'interesse' : 'interesses'} em comum
                      </Text>
                      <View style={styles.interestsList}>
                    {currentSuggestion.commonInterests.slice(0, 6).map((interest, index) => (
                      <View key={index} style={styles.interestTag}>
                        <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                        <Text style={styles.interestName}>{interest.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                  )}

                  {currentSuggestion.interests && currentSuggestion.interests.length > 0 && (
                    <View style={styles.allInterestsSection}>
                      <Text style={styles.sectionTitle}>Interesses</Text>
                      <View style={styles.interestsList}>
                    {currentSuggestion.interests.map((interest, index) => (
                      <View key={index} style={styles.interestTagSmall}>
                        <Text style={styles.interestEmojiSmall}>{interest.emoji}</Text>
                        <Text style={styles.interestNameSmall}>{interest.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                  )}
                </ScrollView>

                {/* Barra de botões fixa na parte inferior */}
                <View style={styles.cardActionsContainer}>
              {/* Perfil */}
              <TouchableOpacity
                style={styles.cardActionButton}
                onPress={() => handlePersonPress(currentSuggestion)}
                activeOpacity={0.7}
              >
                <View style={styles.cardActionIconContainer}>
                  <Ionicons name="person" size={22} color={colors.text} />
                </View>
                <Text style={styles.cardActionLabel}>Perfil</Text>
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity
                style={[
                  styles.cardActionButton,
                  !currentSuggestion.instagram && styles.cardActionButtonDisabled
                ]}
                onPress={() => {
                  if (currentSuggestion.instagram) {
                    // TODO: Abrir Instagram
                    console.log('Abrir Instagram:', currentSuggestion.instagram);
                  }
                }}
                activeOpacity={0.7}
                disabled={!currentSuggestion.instagram}
              >
                <View style={styles.cardActionIconContainer}>
                  <FontAwesome5 
                    name="instagram" 
                    size={22} 
                    color={currentSuggestion.instagram ? '#E4405F' : colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.cardActionLabel,
                  !currentSuggestion.instagram && styles.cardActionLabelDisabled
                ]}>Instagram</Text>
              </TouchableOpacity>

              {/* WhatsApp */}
              <TouchableOpacity
                style={[
                  styles.cardActionButton,
                  (!currentSuggestion.whatsapp || !currentSuggestion.show_whatsapp) && styles.cardActionButtonDisabled
                ]}
                onPress={() => {
                  if (currentSuggestion.whatsapp && currentSuggestion.show_whatsapp) {
                    // TODO: Abrir WhatsApp
                    console.log('Abrir WhatsApp:', currentSuggestion.whatsapp);
                  }
                }}
                activeOpacity={0.7}
                disabled={!currentSuggestion.whatsapp || !currentSuggestion.show_whatsapp}
              >
                <View style={styles.cardActionIconContainer}>
                  <FontAwesome5 
                    name="whatsapp" 
                    size={22} 
                    color={(currentSuggestion.whatsapp && currentSuggestion.show_whatsapp) ? '#25D366' : colors.textSecondary} 
                  />
                </View>
                <Text style={[
                  styles.cardActionLabel,
                  (!currentSuggestion.whatsapp || !currentSuggestion.show_whatsapp) && styles.cardActionLabelDisabled
                ]}>WhatsApp</Text>
              </TouchableOpacity>
              </View>
              </View>
            </View>

            {/* Barra de navegação (só setas) */}
            <View style={styles.navigationBar}>
              <TouchableOpacity
                style={[styles.navButton, currentSuggestionIndex === 0 && styles.navButtonDisabled]}
                onPress={() => setCurrentSuggestionIndex(Math.max(0, currentSuggestionIndex - 1))}
                disabled={currentSuggestionIndex === 0}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonIcon, currentSuggestionIndex === 0 && styles.navButtonIconDisabled]}>←</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.navButton, currentSuggestionIndex === suggestions.length - 1 && styles.navButtonDisabled]}
                onPress={handleNextSuggestion}
                disabled={currentSuggestionIndex === suggestions.length - 1}
                activeOpacity={0.7}
              >
                <Text style={[styles.navButtonIcon, currentSuggestionIndex === suggestions.length - 1 && styles.navButtonIconDisabled]}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </>
      ) : !showAll && suggestions.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>
              Nenhuma sugestão ainda
            </Text>
            <Text style={styles.emptyText}>
              Complete seus interesses para receber sugestões personalizadas
            </Text>
          </View>

          {allMembers.length > 0 && (
            <Button
              title={`Ver todos os ${allMembers.length} membros`}
              onPress={() => setShowAll(true)}
              style={styles.showAllButton}
            />
          )}
          </View>
      ) : (
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.section}>
            <View style={styles.header}>
              <Text style={styles.title}>Todos os membros</Text>
              <Text style={styles.subtitle}>
                {allMembers.length} {allMembers.length === 1 ? 'membro' : 'membros'}
              </Text>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {filteredMembers.length > 0 ? (
              filteredMembers.map(person => (
                <PersonCard
                  key={person._id}
                  person={person}
                  onPress={() => handlePersonPress(person)}
                />
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyText}>
                  Nenhum membro encontrado
                </Text>
              </View>
            )}

            {suggestions.length > 0 && (
            <Button
              title="Voltar para sugestões"
              variant="secondary"
              onPress={() => {
                setShowAll(false);
                setSearchQuery('');
              }}
              style={styles.showAllButton}
            />
            )}
          </View>
        </ScrollView>
        )}
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
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
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
  },
  suggestionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  // Top Header
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  topHeaderLeft: {
    flex: 1,
  },
  topHeaderCounter: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  topHeaderSubtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  viewAllButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
  },
  viewAllButtonText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  // Card Shadow
  cardShadowContainer: {
    width: '100%',
    borderRadius: borderRadius.xxl,
    ...shadows.medium,
    marginBottom: spacing.lg,
  },
  suggestionCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xxl,
    height: Dimensions.get('window').height * 0.58,
    overflow: 'hidden',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: fontSize.lg,
    color: colors.text,
    fontWeight: fontWeight.bold,
    lineHeight: fontSize.lg,
  },
  cardScrollView: {
    flex: 1,
  },
  cardScrollContent: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.sm,
  },
  avatarContainer: {
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: fontSize.xxl,
    color: colors.card,
    fontWeight: fontWeight.bold,
  },
  suggestionName: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
    letterSpacing: -0.5,
  },
  commonInterestsSection: {
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.primaryLight + '10',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  commonInterestsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  allInterestsSection: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    letterSpacing: -0.2,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  interestEmoji: {
    fontSize: fontSize.md,
    marginRight: spacing.xs,
  },
  interestName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
    letterSpacing: -0.1,
  },
  interestTagSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
  },
  interestEmojiSmall: {
    fontSize: fontSize.sm,
    marginRight: spacing.xs - 2,
  },
  interestNameSmall: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.text,
    letterSpacing: -0.1,
  },
  cardActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cardActionButton: {
    alignItems: 'center',
    paddingVertical: spacing.xs - 2,
    paddingHorizontal: spacing.xs,
    gap: spacing.xs - 2,
    minWidth: 60,
  },
  cardActionButtonDisabled: {
    opacity: 0.4,
  },
  cardActionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs - 4,
  },
  cardActionLabel: {
    fontSize: fontSize.xs - 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardActionLabelDisabled: {
    color: colors.textSecondary,
  },
  navigationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    maxWidth: 300,
    alignSelf: 'center',
    width: '100%',
    marginTop: spacing.sm,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.small,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonIcon: {
    fontSize: fontSize.xxl,
    color: colors.text,
    fontWeight: fontWeight.bold,
  },
  navButtonIconDisabled: {
    color: colors.textSecondary,
  },
  seeAllButton: {
    marginTop: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  sectionCount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    backgroundColor: colors.primaryLight + '20',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md + 4,
    marginBottom: spacing.md + 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchIcon: {
    fontSize: 22,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md + 2,
    fontSize: fontSize.md,
    color: colors.text,
    letterSpacing: -0.2,
  },
  showAllButton: {
    marginTop: spacing.md + 4,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    letterSpacing: -0.1,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
});
