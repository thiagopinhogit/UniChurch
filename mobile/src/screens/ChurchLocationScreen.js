import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import api from '../services/api';
import { saveChurch } from '../services/storage';

export default function ChurchLocationScreen({ route, navigation }) {
  const { church, onComplete } = route.params || {};
  const webViewRef = useRef(null);
  const [cep, setCep] = useState('');
  const [searchingCep, setSearchingCep] = useState(false);
  const [address, setAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: ''
  });
  const [coordinates, setCoordinates] = useState({
    latitude: church?.location?.coordinates?.[1] || -23.5505,
    longitude: church?.location?.coordinates?.[0] || -46.6333
  });
  const [saving, setSaving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [locatingAddress, setLocatingAddress] = useState(false);

  useEffect(() => {
    loadChurchData();
  }, []);

  // Atualizar mapa quando coordenadas mudarem
  useEffect(() => {
    if (mapReady) {
      updateMapMarker(coordinates);
    }
  }, [coordinates, mapReady]);

  const loadChurchData = () => {
    if (church) {
      if (church.address) {
        // Verificar se é o novo formato (com ||) ou antigo (com vírgula)
        if (church.address.includes('||')) {
          // Novo formato: "Rua||Número||Complemento||Bairro||Estado"
          const parts = church.address.split('||');
          
          setAddress({
            street: parts[0] || '',
            number: parts[1] || '',
            complement: parts[2] || '',
            neighborhood: parts[3] || '',
            city: church.city || '',
            state: parts[4] || '',
            cep: church.cep || ''
          });
          
          // Formatar CEP se existir
          if (church.cep) {
            setCep(formatCep(church.cep));
          }
        } else {
          // Formato antigo (para compatibilidade): tentar parsear
          const parts = church.address.split(',').map(p => p.trim());
          
          setAddress({
            street: parts[0] || '',
            number: parts[1] || '',
            complement: parts[2] || '',
            neighborhood: parts[3] || '',
            city: church.city || parts[4] || '',
            state: parts[5] || '',
            cep: church.cep || ''
          });
          
          if (church.cep) {
            setCep(formatCep(church.cep));
          }
        }
      }
      
      if (church.location?.coordinates?.[0] !== 0 && church.location?.coordinates?.[1] !== 0) {
        const loadedCoords = {
          latitude: church.location.coordinates[1],
          longitude: church.location.coordinates[0]
        };
        
        setCoordinates(loadedCoords);
        setShowMap(true); // Mostrar mapa se já tem coordenadas
        setMapKey(prev => prev + 1); // Forçar reload do mapa
      }
    }
  };

  const formatCep = (text) => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const handleCepChange = (text) => {
    const formatted = formatCep(text);
    setCep(formatted);
  };

  const searchCep = async () => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      Alert.alert('Atenção', 'Digite um CEP válido com 8 dígitos');
      return;
    }

    try {
      setSearchingCep(true);
      
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        Alert.alert('CEP não encontrado', 'Verifique o CEP digitado e tente novamente');
        return;
      }

      setAddress({
        street: data.logradouro || '',
        number: '',
        complement: data.complemento || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
        cep: cleanCep
      });

      Alert.alert('CEP encontrado! ✅', 'Complete o número e clique em "Localizar no Mapa"');
      
    } catch (error) {
      console.error('Error searching CEP:', error);
      Alert.alert('Erro', 'Não foi possível buscar o CEP.');
    } finally {
      setSearchingCep(false);
    }
  };

  const handleLocateOnMap = async () => {
    if (!address.street || !address.number || !address.city) {
      Alert.alert('Atenção', 'Preencha Rua, Número e Cidade antes de localizar no mapa');
      return;
    }

    try {
      setLocatingAddress(true);
      
      // Tentar diferentes formatos de endereço
      const addressFormats = [
        // Formato 1: Número + Rua, Bairro, Cidade, Estado
        `${address.number} ${address.street}, ${address.neighborhood}, ${address.city}, ${address.state}, Brasil`,
        // Formato 2: Rua + Número, Cidade, Estado
        `${address.street} ${address.number}, ${address.city}, ${address.state}, Brasil`,
        // Formato 3: Rua, Número, Bairro, Cidade
        `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city}, Brasil`,
        // Formato 4: Apenas Rua, Cidade
        `${address.street}, ${address.city}, ${address.state}, Brasil`,
      ];

      let foundCoords = null;

      for (const addressFormat of addressFormats) {
        console.log('🔍 Tentando formato:', addressFormat);
        
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(addressFormat)}&format=json&limit=1&countrycodes=br`;
        
        try {
          const geoResponse = await fetch(geocodeUrl, {
            headers: { 'User-Agent': 'UniChurch App' }
          });
          const geoData = await geoResponse.json();
          
          console.log('📍 Response:', geoData);
          
          if (geoData && geoData.length > 0) {
            foundCoords = {
              latitude: parseFloat(geoData[0].lat),
              longitude: parseFloat(geoData[0].lon),
              displayName: geoData[0].display_name
            };
            console.log('✅ Coordenadas encontradas:', foundCoords);
            break;
          }
        } catch (err) {
          console.log('❌ Erro neste formato:', err.message);
          continue;
        }
      }

      if (foundCoords) {
        setCoordinates({
          latitude: foundCoords.latitude,
          longitude: foundCoords.longitude
        });
        setMapKey(prev => prev + 1);
        setShowMap(true);
        
        Alert.alert(
          'Localização encontrada! 📍',
          'Arraste o marcador no mapa para ajustar a posição exata se necessário.'
        );
      } else {
        // Última tentativa: centralizar na cidade
        const cityAddress = `${address.city}, ${address.state}, Brasil`;
        console.log('⚠️ Tentando centralizar na cidade:', cityAddress);
        
        const cityUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityAddress)}&format=json&limit=1`;
        const cityResponse = await fetch(cityUrl, {
          headers: { 'User-Agent': 'UniChurch App' }
        });
        const cityData = await cityResponse.json();
        
        if (cityData && cityData.length > 0) {
          setCoordinates({
            latitude: parseFloat(cityData[0].lat),
            longitude: parseFloat(cityData[0].lon)
          });
          setMapKey(prev => prev + 1);
          setShowMap(true);
          
          Alert.alert(
            'Localização aproximada 📍',
            'Não encontrei o endereço exato. O mapa foi centralizado na cidade.\n\nArraste o marcador para a posição correta.'
          );
        } else {
          Alert.alert('Erro', 'Não foi possível encontrar as coordenadas. Tente ajustar o endereço.');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar coordenadas:', error);
      Alert.alert('Erro', 'Não foi possível buscar a localização. Tente novamente.');
    } finally {
      setLocatingAddress(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permissão Necessária', 'Permita o acesso à localização.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const newCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude
      };
      setCoordinates(newCoords);
      setMapKey(prev => prev + 1);
      setShowMap(true);
      
      Alert.alert('Sucesso', 'Mapa atualizado com sua localização!');
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    }
  };

  const updateMapMarker = (coords) => {
    if (webViewRef.current && mapReady) {
      webViewRef.current.injectJavaScript(`
        updateMarker(${coords.latitude}, ${coords.longitude});
        true;
      `);
    }
  };

  const handleMapMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'MAP_READY') {
        setMapReady(true);
      } else if (data.type === 'MARKER_MOVED') {
        setCoordinates({
          latitude: data.latitude,
          longitude: data.longitude
        });
      }
    } catch (error) {
      console.error('Error handling map message:', error);
    }
  };

  const mapHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { width: 100%; height: 100vh; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${coordinates.latitude}, ${coordinates.longitude}], 16);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    var marker = L.marker([${coordinates.latitude}, ${coordinates.longitude}], {
      draggable: true
    }).addTo(map);

    marker.on('dragend', function(e) {
      var pos = marker.getLatLng();
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MARKER_MOVED',
        latitude: pos.lat,
        longitude: pos.lng
      }));
    });

    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MARKER_MOVED',
        latitude: e.latlng.lat,
        longitude: e.latlng.lng
      }));
    });

    function updateMarker(lat, lng) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 16);
    }

    setTimeout(function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MAP_READY'
      }));
    }, 1000);
  </script>
</body>
</html>
  `;

  const handleSave = async () => {
    if (!address.street || !address.city || !address.number) {
      Alert.alert('Atenção', 'Preencha o endereço completo incluindo o número');
      return;
    }

    if (!showMap || (coordinates.latitude === -23.5505 && coordinates.longitude === -46.6333)) {
      Alert.alert(
        'Atenção', 
        'Você precisa localizar o endereço no mapa antes de salvar.\n\nClique em "Localizar no Mapa".',
        [{ text: 'OK' }]
      );
      return;
    }

    saveData();
  };

  const saveData = async () => {
    try {
      setSaving(true);

      // Salvar com marcadores para facilitar parsing
      const addressParts = {
        street: address.street,
        number: address.number,
        complement: address.complement || '',
        neighborhood: address.neighborhood || '',
        state: address.state || ''
      };
      
      // Formato: Rua||Número||Complemento||Bairro||Estado
      const fullAddress = `${addressParts.street}||${addressParts.number}||${addressParts.complement}||${addressParts.neighborhood}||${addressParts.state}`;

      const response = await api.put(`/churches/${church._id}`, {
        address: fullAddress,
        city: address.city,
        cep: address.cep, // Salvar CEP
        location: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude]
        }
      });

      await saveChurch(response.data);

      Alert.alert('Sucesso!', 'Localização atualizada', [
        { 
          text: 'OK', 
          onPress: () => {
            if (onComplete) {
              onComplete(); // Notifica o checklist
            }
            navigation.goBack();
          } 
        }
      ]);
    } catch (error) {
      console.error('Error saving:', error);
      Alert.alert('Erro', 'Não foi possível salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Localização da Igreja</Text>
        <Text style={styles.subtitle}>
          Busque pelo CEP e ajuste a localização
        </Text>

        {/* CEP Search */}
        <View style={styles.cepContainer}>
          <View style={styles.cepInputContainer}>
            <Text style={styles.label}>CEP</Text>
            <TextInput
              style={styles.cepInput}
              value={cep}
              onChangeText={handleCepChange}
              placeholder="00000-000"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              maxLength={9}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, searchingCep && styles.searchButtonDisabled]}
            onPress={searchCep}
            disabled={searchingCep}
          >
            {searchingCep ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Buscar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Address Fields */}
        {address.street && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Rua/Avenida</Text>
              <TextInput
                style={styles.input}
                value={address.street}
                onChangeText={(text) => setAddress({ ...address, street: text })}
                placeholder="Nome da rua"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.label}>Número *</Text>
                <TextInput
                  style={styles.input}
                  value={address.number}
                  onChangeText={(text) => setAddress({ ...address, number: text })}
                  placeholder="Nº"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={styles.label}>Bairro</Text>
                <TextInput
                  style={styles.input}
                  value={address.neighborhood}
                  onChangeText={(text) => setAddress({ ...address, neighborhood: text })}
                  placeholder="Bairro"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={address.city}
                onChangeText={(text) => setAddress({ ...address, city: text })}
                placeholder="Cidade"
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            {/* Locate on Map Button */}
            <TouchableOpacity
              style={[styles.locateButton, (!address.number || locatingAddress) && styles.locateButtonDisabled]}
              onPress={handleLocateOnMap}
              disabled={!address.number || locatingAddress}
            >
              {locatingAddress ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Text style={styles.locateButtonIcon}>📍</Text>
                  <Text style={styles.locateButtonText}>Localizar no Mapa</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Map */}
            {showMap && (
              <>
                <View style={styles.mapSection}>
                  <View style={styles.mapHeader}>
                    <Text style={styles.mapLabel}>Ajuste a localização exata</Text>
                    <TouchableOpacity onPress={handleUseCurrentLocation}>
                      <Text style={styles.useGpsLink}>📍 Usar GPS</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.mapContainer}>
                    <WebView
                      key={mapKey}
                      ref={webViewRef}
                      source={{ html: mapHTML }}
                      style={styles.webView}
                      onMessage={handleMapMessage}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                    />
                  </View>
                  <Text style={styles.mapHint}>
                    🖱️ Clique no mapa ou arraste o marcador vermelho
                  </Text>
                </View>
              </>
            )}

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Salvando...' : 'Salvar'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {!address.street && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyText}>
              Digite o CEP para começar
            </Text>
            <Text style={styles.emptySubtext}>
              O endereço e localização serão preenchidos automaticamente
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 48,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  cepContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  cepInputContainer: {
    flex: 1,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cepInput: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.lg,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    letterSpacing: 2,
  },
  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    minWidth: 100,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
  },
  locateButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md + 2,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  locateButtonDisabled: {
    opacity: 0.5,
  },
  locateButtonIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  locateButtonText: {
    color: 'white',
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  mapSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  mapLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  useGpsLink: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.semibold,
  },
  mapContainer: {
    height: 350,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.primary,
    ...shadows.medium,
  },
  webView: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  mapHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: 48,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: 'white',
  },
});
