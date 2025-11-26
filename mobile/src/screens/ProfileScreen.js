import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Image,
  TextInput, 
  Switch,
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getUserById, updateUser, getInterests, addUserInterest, removeUserInterest } from '../services/api';
import { getUser, saveUser, clearAll } from '../services/storage';
import { colors, spacing, fontSize, fontWeight, borderRadius, shadows } from '../styles/theme';
import Button from '../components/Button';
import InterestTag from '../components/InterestTag';

export default function ProfileScreen({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [photo, setPhoto] = useState(null);
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [privacy, setPrivacy] = useState({
    show_profile: true,
    show_whatsapp: false,
    show_instagram: false,
    show_linkedin: false,
  });
  const [allInterests, setAllInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await getUser();
      if (!user) return;

      const [userRes, interestsRes] = await Promise.all([
        getUserById(user._id),
        getInterests()
      ]);

      const userData = userRes.data;
      setCurrentUser(userData);
      setName(userData.name || '');
      setProfession(userData.profession || '');
      setPhoto(userData.photo_url);
      setWhatsapp(userData.whatsapp || '');
      setInstagram(userData.instagram || '');
      setLinkedin(userData.linkedin || '');
      setPrivacy({
        show_profile: userData.show_profile,
        show_whatsapp: userData.show_whatsapp,
        show_instagram: userData.show_instagram,
        show_linkedin: userData.show_linkedin,
      });

      setAllInterests(interestsRes.data);
      setSelectedInterests(userData.interests?.map(i => i._id) || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  const togglePrivacy = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleInterest = async (interestId) => {
    try {
      if (selectedInterests.includes(interestId)) {
        await removeUserInterest(currentUser._id, interestId);
        setSelectedInterests(prev => prev.filter(id => id !== interestId));
      } else {
        await addUserInterest(currentUser._id, interestId);
        setSelectedInterests(prev => [...prev, interestId]);
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, digite seu nome.');
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: name.trim(),
        profession: profession.trim(),
        photo_url: photo,
        whatsapp: whatsapp.trim(),
        instagram: instagram.trim(),
        linkedin: linkedin.trim(),
        ...privacy
      };

      await updateUser(currentUser._id, updateData);
      const updatedUser = { ...currentUser, ...updateData };
      await saveUser(updatedUser);
      setCurrentUser(updatedUser);

      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: confirmLogout }
      ]
    );
  };

  const confirmLogout = async () => {
    await clearAll();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Initial' }],
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const groupedInterests = allInterests.reduce((acc, interest) => {
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={pickImage}>
            <Image 
              source={photo ? { uri: photo } : require('../../assets/default-avatar.png')}
              style={styles.avatar}
            />
            <View style={styles.editBadge}>
              <Text style={styles.editIcon}>✏️</Text>
            </View>
          </TouchableOpacity>
          
          {currentUser?.welcome_count > 0 && (
            <Text style={styles.welcomeCount}>
              👋 {currentUser.welcome_count} {currentUser.welcome_count === 1 ? 'pessoa deu' : 'pessoas deram'} boas-vindas
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dados básicos</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Seu nome completo"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Profissão</Text>
            <TextInput
              style={styles.input}
              value={profession}
              onChangeText={setProfession}
              placeholder="Sua profissão"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hobbies e Interesses</Text>
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
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes sociais</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>📱 WhatsApp</Text>
            <TextInput
              style={styles.input}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="(11) 99999-9999"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>📸 Instagram</Text>
            <TextInput
              style={styles.input}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="seuusuario"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>💼 LinkedIn</Text>
            <TextInput
              style={styles.input}
              value={linkedin}
              onChangeText={setLinkedin}
              placeholder="seu-perfil"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacidade</Text>
          
          <PrivacyItem
            title="Mostrar meu perfil"
            value={privacy.show_profile}
            onToggle={() => togglePrivacy('show_profile')}
          />
          <PrivacyItem
            title="Mostrar WhatsApp"
            value={privacy.show_whatsapp}
            onToggle={() => togglePrivacy('show_whatsapp')}
            disabled={!whatsapp}
          />
          <PrivacyItem
            title="Mostrar Instagram"
            value={privacy.show_instagram}
            onToggle={() => togglePrivacy('show_instagram')}
            disabled={!instagram}
          />
          <PrivacyItem
            title="Mostrar LinkedIn"
            value={privacy.show_linkedin}
            onToggle={() => togglePrivacy('show_linkedin')}
            disabled={!linkedin}
          />
        </View>

        <View style={styles.section}>
          <Button
            title="Salvar alterações"
            onPress={handleSave}
            loading={saving}
          />
          <Button
            title="Sair"
            onPress={handleLogout}
            variant="outline"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PrivacyItem({ title, value, onToggle, disabled }) {
  return (
    <View style={[styles.privacyItem, disabled && styles.privacyItemDisabled]}>
      <Text style={styles.privacyTitle}>{title}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primaryLight }}
        thumbColor={value ? colors.primary : colors.card}
        disabled={disabled}
      />
    </View>
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
    alignItems: 'center',
    padding: spacing.xxl,
    paddingBottom: spacing.xl,
    backgroundColor: colors.card,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.round,
    backgroundColor: colors.borderLight,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
    ...shadows.medium,
  },
  editIcon: {
    fontSize: 16,
  },
  welcomeCount: {
    fontSize: fontSize.sm,
    color: colors.primary,
    marginTop: spacing.md + 4,
    fontWeight: fontWeight.medium,
  },
  section: {
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg + 2,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.md + 4,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: spacing.md + 4,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    marginBottom: spacing.xs + 2,
    letterSpacing: -0.1,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md + 4,
    fontSize: fontSize.md,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
    letterSpacing: -0.2,
  },
  category: {
    marginBottom: spacing.xl,
  },
  categoryTitle: {
    fontSize: fontSize.md + 1,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    marginBottom: spacing.sm + 2,
    letterSpacing: -0.2,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  privacyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.md + 4,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm + 2,
    ...shadows.small,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  privacyItemDisabled: {
    opacity: 0.4,
  },
  privacyTitle: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: fontWeight.medium,
    letterSpacing: -0.2,
  },
});

