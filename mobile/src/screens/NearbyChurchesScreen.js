import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  TextInput
} from 'react-native';
import * as Location from 'expo-location';
import { getAllChurches } from '../services/api';
import { saveChurch } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';

export default function NearbyChurchesScreen({ route, navigation }) {
  const [churches, setChurches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      // Obtém a localização atual
      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      
      setLocation(locationData.coords);
      
      // Busca igrejas próximas
      await loadNearbyChurches(locationData.coords.latitude, locationData.coords.longitude);
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
        [
          { text: 'Tentar novamente', onPress: getCurrentLocation },
          { text: 'Voltar', onPress: () => navigation.goBack() }
        ]
      );
      setLoading(false);
    }
  };

  const loadNearbyChurches = async (latitude, longitude) => {
    try {
      // Busca TODAS as igrejas do banco, com distância calculada se possível
      const response = await getAllChurches(latitude, longitude);
      
      setChurches(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar as igrejas.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChurch = async (church) => {
    try {
      await saveChurch(church);
      navigation.navigate('Welcome', { church });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar a igreja.');
      console.error(error);
    }
  };

  const calculateDistance = (dist) => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)}m`;
    }
    return `${dist.toFixed(1)}km`;
  };

  // Filtra igrejas por nome ou código
  const filteredChurches = churches.filter((church) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const name = church.name?.toLowerCase() || '';
    const code = church.code?.toLowerCase() || '';
    const city = church.city?.toLowerCase() || '';
    
    return name.includes(query) || code.includes(query) || city.includes(query);
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Buscando igrejas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Igrejas disponíveis</Text>
        <Text style={styles.subtitle}>
          {filteredChurches.length} {filteredChurches.length === 1 ? 'igreja encontrada' : 'igrejas encontradas'}
        </Text>
      </View>

      {churches.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <Text style={styles.searchIconText}>🔍</Text>
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome, código ou cidade..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {churches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Nenhuma igreja cadastrada</Text>
          <Text style={styles.emptyText}>
            Não encontramos igrejas cadastradas no momento.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
        </View>
      ) : filteredChurches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>Nenhum resultado</Text>
          <Text style={styles.emptyText}>
            Não encontramos igrejas com "{searchQuery}". Tente buscar por outro nome, código ou cidade.
          </Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.backButtonText}>Limpar busca</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredChurches}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.churchCard}
              onPress={() => handleSelectChurch(item)}
              activeOpacity={0.7}
            >
              <View style={styles.churchIcon}>
                <Text style={styles.churchEmoji}>⛪</Text>
              </View>
              <View style={styles.churchContent}>
                <Text style={styles.churchName}>{item.name}</Text>
                {item.code && (
                  <Text style={styles.churchCode}>Código: {item.code}</Text>
                )}
                <View style={styles.churchInfo}>
                  <Text style={styles.churchCity}>📍 {item.city}</Text>
                  {item.distance && (
                    <>
                      <Text style={styles.separator}>•</Text>
                      <Text style={styles.churchDistance}>
                        {calculateDistance(item.distance)}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>→</Text>
              </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
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
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchIconText: {
    fontSize: 18,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
    letterSpacing: -0.2,
  },
  clearButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: fontWeight.bold,
  },
  listContent: {
    padding: spacing.lg,
  },
  churchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  churchIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  churchEmoji: {
    fontSize: 28,
  },
  churchContent: {
    flex: 1,
  },
  churchName: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs - 2,
    letterSpacing: -0.3,
  },
  churchCode: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.xs - 2,
  },
  churchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  churchCity: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  separator: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginHorizontal: spacing.xs,
  },
  churchDistance: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  arrowContainer: {
    marginLeft: spacing.sm,
  },
  arrow: {
    fontSize: 24,
    color: colors.textTertiary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
  },
  backButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.card,
  },
});

