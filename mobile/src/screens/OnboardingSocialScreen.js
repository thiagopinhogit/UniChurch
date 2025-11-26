import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function OnboardingSocialScreen({ route, navigation }) {
  const { church, userData } = route.params;
  const [instagram, setInstagram] = useState('');
  const [instagramData, setInstagramData] = useState(null);
  const [loadingInstagram, setLoadingInstagram] = useState(false);

  // Debounce para buscar dados do Instagram
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (instagram && instagram.length > 2) {
        fetchInstagramData(instagram);
      } else {
        setInstagramData(null);
      }
    }, 800); // Espera 800ms após parar de digitar

    return () => clearTimeout(timeoutId);
  }, [instagram]);

  const fetchInstagramData = async (username) => {
    // Remove @ se o usuário digitou
    const cleanUsername = username.replace('@', '').trim();
    if (!cleanUsername) return;

    setLoadingInstagram(true);
    try {
      // Método mais simples e confiável - apenas a foto de perfil
      // A foto pública do Instagram pode ser acessada diretamente
      const profilePicUrl = `https://www.instagram.com/${cleanUsername}/`;
      
      // Tenta verificar se o perfil existe fazendo um fetch simples
      const response = await fetch(profilePicUrl, { method: 'HEAD' });
      
      if (response.ok) {
        // Se o perfil existe, usa a URL padrão da foto
        setInstagramData({
          username: cleanUsername,
          profilePic: `https://instagram.com/${cleanUsername}/profilepic/`,
          fullName: null,
          isVerified: false
        });
      }
    } catch (error) {
      console.log('Erro ao buscar Instagram:', error);
      // Mesmo com erro, tenta mostrar o que conseguir
      setInstagramData({
        username: cleanUsername,
        profilePic: `https://instagram.com/${cleanUsername}/profilepic/`,
        fullName: null,
        isVerified: false
      });
    } finally {
      setLoadingInstagram(false);
    }
  };

  const handleNext = () => {
    navigation.navigate('OnboardingWhatsApp', {
      church,
      userData: {
        ...userData,
        instagram: instagram.replace('@', '').trim(),
        instagramData: instagramData
      }
    });
  };

  const handleSkip = () => {
    navigation.navigate('OnboardingWhatsApp', {
      church,
      userData: {
        ...userData,
        instagram: ''
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conecte seu Instagram</Text>
        <Text style={styles.subtitle}>
          Sua foto será usada no perfil
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Instagram - Destaque */}
        <View style={styles.instagramSection}>
          <View style={[
            styles.instagramInputContainer,
            instagramData && styles.instagramInputSuccess
          ]}>
            <Text style={styles.instagramIcon}>📸</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.atSymbol}>@</Text>
          <TextInput
                style={styles.instagramInput}
            value={instagram}
                onChangeText={(text) => setInstagram(text.replace('@', ''))}
                placeholder="seuusuario"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
                autoCorrect={false}
                autoFocus
          />
        </View>
            {loadingInstagram && (
              <ActivityIndicator size="small" color={colors.primary} style={styles.inputLoader} />
            )}
            {instagramData && !loadingInstagram && (
              <>
                <Image 
                  source={{ uri: instagramData.profilePic }} 
                  style={styles.profilePicSmall}
                />
                <Text style={styles.checkIconInline}>✅</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text style={styles.infoText}>
            Sua foto do Instagram será usada no seu perfil
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Continuar" 
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  instagramSection: {
    marginBottom: spacing.xl,
  },
  instagramInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  instagramInputSuccess: {
    borderColor: colors.success,
  },
  instagramIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  atSymbol: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginRight: spacing.xs,
  },
  instagramInput: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.text,
    padding: 0,
  },
  inputLoader: {
    marginLeft: spacing.sm,
  },
  profilePicSmall: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: colors.border,
    marginLeft: spacing.sm,
  },
  checkIconInline: {
    fontSize: 20,
    marginLeft: spacing.xs,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    padding: spacing.md + 2,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  infoIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
});
