import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

const { height } = Dimensions.get('window');

export default function InitialScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(true);
  const [activeTab, setActiveTab] = useState('member');

  // Mostra o modal sempre que a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      setModalVisible(true);
      return () => {
        // Cleanup - opcional
      };
    }, [])
  );

  const handleScanQR = () => {
    setModalVisible(false);
    setTimeout(() => navigation.navigate('QRScanner'), 300);
  };

  const handleMemberLogin = () => {
    // TODO: Implementar login de membro
    console.log('Login de membro');
  };

  const handleChurchRegister = () => {
    setModalVisible(false);
    setTimeout(() => navigation.navigate('ChurchRegistration'), 300);
  };

  const handleChurchLogin = () => {
    setModalVisible(false);
    setTimeout(() => navigation.navigate('ChurchAdminLogin'), 300);
  };

  return (
    <View style={styles.container}>
      {/* Background gradiente */}
      <View style={styles.background}>
        <View style={styles.gradientTop} />
        <View style={styles.gradientBottom} />
      </View>

      {/* Logo e branding */}
      <SafeAreaView style={styles.content}>
        <View style={styles.logoSection}>
          <Image 
            source={require('../../assets/logo-transparent.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
          <Text style={styles.appName}>UniChurch</Text>
          <Text style={styles.tagline}>
            Conectando pessoas na igreja
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            UniChurch © 2025 - Todos os direitos reservados
          </Text>
        </View>
      </SafeAreaView>

      {/* Modal Bottom Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {}}
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContainer}>
                <View style={styles.modal}>
                  {/* Handle do modal */}
                  <View style={styles.modalHandle} />

                  {/* Tabs Pills */}
                  <View style={styles.tabsContainer}>
                    <TouchableOpacity
                      style={[styles.tabPill, activeTab === 'member' && styles.tabPillActive]}
                      onPress={() => setActiveTab('member')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabPillText, activeTab === 'member' && styles.tabPillTextActive]}>
                        👤 Sou membro
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.tabPill, activeTab === 'church' && styles.tabPillActive]}
                      onPress={() => setActiveTab('church')}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tabPillText, activeTab === 'church' && styles.tabPillTextActive]}>
                        ⛪ Sou igreja
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Conteúdo do modal */}
                  <View style={styles.modalContent}>
                    {activeTab === 'member' ? (
                      <>
                        <View style={styles.contentHeader}>
                          <Text style={styles.contentIcon}>👋</Text>
                          <Text style={styles.contentTitle}>Bem-vindo!</Text>
                          <Text style={styles.contentDescription}>
                            Conecte-se com sua igreja
                          </Text>
                        </View>

                        <View style={styles.actionsContainer}>
                          <Button
                            title="Escanear QR Code"
                            onPress={handleScanQR}
                            size="large"
                          />
                          <TouchableOpacity 
                            style={styles.linkButton}
                            onPress={handleMemberLogin}
                          >
                            <Text style={styles.linkButtonText}>Já tenho conta</Text>
                            <Text style={styles.linkButtonArrow}>→</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <View style={styles.contentHeader}>
                          <Text style={styles.contentIcon}>✨</Text>
                          <Text style={styles.contentTitle}>Seja bem-vindo!</Text>
                          <Text style={styles.contentDescription}>
                            Cadastre sua igreja no UniChurch
                          </Text>
                        </View>

                        <View style={styles.actionsContainer}>
                          <Button
                            title="Cadastrar igreja"
                            onPress={handleChurchRegister}
                            size="large"
                          />
                          <TouchableOpacity 
                            style={styles.linkButton}
                            onPress={handleChurchLogin}
                          >
                            <Text style={styles.linkButtonText}>Já tenho conta</Text>
                            <Text style={styles.linkButtonArrow}>→</Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background, // Branco/cinza claro
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: colors.backgroundSecondary,
    opacity: 0.5,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: colors.card,
    opacity: 0.3,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 3,
    borderColor: colors.primaryLight,
    ...shadows.medium,
  },
  logoEmoji: {
    fontSize: 52,
  },
  appName: {
    fontSize: fontSize.xxxl + 4,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.xs,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'transparent',
  },
  modal: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xxl + 8,
    borderTopRightRadius: borderRadius.xxl + 8,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    minHeight: height * 0.45,
    maxHeight: height * 0.75,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 20,
      },
    }),
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.round,
    padding: spacing.xs + 2,
    marginBottom: spacing.xl,
  },
  tabPill: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    alignItems: 'center',
  },
  tabPillActive: {
    backgroundColor: colors.card,
    ...shadows.small,
  },
  tabPillText: {
    fontSize: fontSize.sm + 1,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  tabPillTextActive: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  modalContent: {
    gap: spacing.xl,
  },
  contentHeader: {
    alignItems: 'center',
  },
  contentIcon: {
    fontSize: 56,
    marginBottom: spacing.md,
  },
  contentTitle: {
    fontSize: fontSize.xl + 2,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.4,
  },
  contentDescription: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  actionsContainer: {
    gap: spacing.md,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  linkButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
    letterSpacing: -0.2,
  },
  linkButtonArrow: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    fontWeight: fontWeight.semibold,
  },
});
