import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, Animated } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Location from 'expo-location';
import { getChurchByQR } from '../services/api';
import { saveChurch } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const scanAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    requestCameraPermission();
    startScanAnimation();
  }, []);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  const startScanAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnimation, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnimation, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleChurchCode = async (code) => {
    setLoading(true);
    try {
      const response = await getChurchByQR(code);
      const church = response.data;
      
      await saveChurch(church);
      navigation.navigate('Welcome', { church });
    } catch (error) {
      Alert.alert(
        'Igreja não encontrada',
        'Não conseguimos encontrar uma igreja com este código.',
        [
          { text: 'OK', onPress: () => {
            setScanned(false);
          }}
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBarCodeScanned = async ({ data }) => {
    setScanned(true);
    await handleChurchCode(data);
  };

  const handleFindNearby = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua localização para encontrar igrejas próximas.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Tentar novamente', onPress: handleFindNearby }
          ]
        );
      return;
    }

      // Navega imediatamente para a próxima tela
      // A localização será obtida lá para não bloquear a UI
      navigation.navigate('NearbyChurches');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível acessar a localização.');
      console.error(error);
    }
  };

  const scanLineTranslateY = scanAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingIcon}>📷</Text>
          <Text style={styles.loadingText}>Solicitando acesso à câmera...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionIcon}>🔒</Text>
          <Text style={styles.permissionTitle}>Acesso à câmera negado</Text>
          <Text style={styles.permissionText}>
            Para escanear o QR Code da igreja, precisamos de acesso à sua câmera.
          </Text>
        <Button 
          title="Ir para configurações" 
            onPress={requestCameraPermission}
            style={{ marginTop: spacing.xl }}
          />
          <Button 
            title="Buscar igrejas próximas" 
            onPress={handleFindNearby}
            variant="secondary"
            style={{ marginTop: spacing.md }}
        />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scanner de QR Code */}
      <BarCodeScanner
        onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Overlay escuro */}
      <View style={styles.darkOverlay} />

      {/* Conteúdo */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Escanear QR Code</Text>
          <Text style={styles.subtitle}>
            Aponte a câmera para o QR Code da sua igreja
          </Text>
        </View>

        {/* Área de scan com moldura */}
        <View style={styles.scanAreaContainer}>
          {/* Frame corners */}
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />

          {/* Scan line animada */}
          {!scanned && (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanLineTranslateY }] }
              ]}
            />
          )}

          {/* Centro transparente */}
          <View style={styles.scanAreaCenter} />
        </View>

        {/* Instruções */}
        {!scanned && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Posicione o QR Code dentro da moldura
            </Text>
      </View>
        )}

        {scanned && loading && (
          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsText}>
              Verificando igreja...
            </Text>
          </View>
        )}

        {/* Botões */}
        <View style={styles.buttonsContainer}>
          {scanned && !loading && (
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.retryIcon}>🔄</Text>
              <Text style={styles.retryText}>Escanear novamente</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={styles.locationButton}
            onPress={handleFindNearby}
            disabled={loading}
          >
            <Text style={styles.locationIcon}>📍</Text>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationButtonTitle}>Não tenho QR Code</Text>
              <Text style={styles.locationButtonSubtitle}>
                Buscar igrejas próximas
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.text,
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.card,
    textAlign: 'center',
  },
  permissionContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  permissionIcon: {
    fontSize: 72,
    marginBottom: spacing.xl,
  },
  permissionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.card,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  scanAreaContainer: {
    width: 280,
    height: 280,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanAreaCenter: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: borderRadius.lg,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.card,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: borderRadius.lg,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: borderRadius.lg,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.lg,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: borderRadius.lg,
  },
  scanLine: {
    position: 'absolute',
    width: 240,
    height: 2,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  instructionsContainer: {
    alignItems: 'center',
  },
  instructionsText: {
    fontSize: fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  buttonsContainer: {
    gap: spacing.md,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  retryIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  retryText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.card,
    letterSpacing: -0.2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingVertical: spacing.md + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  locationIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  locationTextContainer: {
    flex: 1,
  },
  locationButtonTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xxs,
    letterSpacing: -0.2,
  },
  locationButtonSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    letterSpacing: -0.1,
  },
});
