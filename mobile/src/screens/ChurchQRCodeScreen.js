import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Share, ScrollView, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function ChurchQRCodeScreen({ route, navigation }) {
  const { church } = route.params;
  const qrCodeRef = useRef();

  const handleShare = async () => {
    try {
      // Tentar obter a imagem do QR Code como base64
      if (qrCodeRef.current) {
        qrCodeRef.current.toDataURL(async (dataURL) => {
          try {
            // Em produção, você poderia salvar isso e compartilhar a imagem
            // Por enquanto, compartilharemos o texto
            await Share.share({
              message: `🏛️ Junte-se à ${church.name} no UniChurch!\n\n📍 ${church.city}\n\n🔑 Código da Igreja: ${church.qr_code_id}\n\n📱 Baixe o app UniChurch e use este código para se conectar com a nossa comunidade!`,
              title: `Junte-se à ${church.name}`,
            });
          } catch (error) {
            console.error('Error sharing:', error);
          }
        });
      } else {
        // Fallback se não conseguir obter o QR Code
        await Share.share({
          message: `🏛️ Junte-se à ${church.name} no UniChurch!\n\n📍 ${church.city}\n\n🔑 Código da Igreja: ${church.qr_code_id}\n\n📱 Baixe o app UniChurch e use este código para se conectar com a nossa comunidade!`,
          title: `Junte-se à ${church.name}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>📱</Text>
          <Text style={styles.title}>QR Code da Igreja</Text>
          <Text style={styles.subtitle}>
            Compartilhe com os membros da sua igreja
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={church.qr_code_id}
              size={220}
              backgroundColor="white"
              color={colors.primary}
              getRef={(ref) => (qrCodeRef.current = ref)}
            />
          </View>
          <Text style={styles.qrCode}>{church.qr_code_id}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Igreja:</Text>
            <Text style={styles.infoValue}>{church.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Cidade:</Text>
            <Text style={styles.infoValue}>{church.city}</Text>
          </View>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Como usar:</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Compartilhe este QR Code ou código com os membros
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Membros devem baixar o app UniChurch
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Escanear o QR Code ou digitar o código para entrar
            </Text>
          </View>
        </View>

        <View style={styles.shareSection}>
          <Button
            title="Compartilhar Código"
            onPress={handleShare}
            size="large"
          />
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
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
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrWrapper: {
    backgroundColor: colors.card,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadows.medium,
  },
  qrCode: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  infoCard: {
    backgroundColor: colors.card,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.semibold,
    flex: 1,
    textAlign: 'right',
  },
  instructions: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.xl,
  },
  instructionsTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.2,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  instructionNumber: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.primary,
    marginRight: spacing.sm,
    width: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  shareSection: {
    marginTop: spacing.md,
  },
});

