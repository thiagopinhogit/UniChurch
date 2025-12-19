import 'react-native-gesture-handler';
import 'text-encoding-polyfill';
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';

import { getUser } from './src/services/storage';
import { colors } from './src/styles/theme';

// Initial & Onboarding Screens
import InitialScreen from './src/screens/InitialScreen';
import QRScannerScreen from './src/screens/QRScannerScreen';
import NearbyChurchesScreen from './src/screens/NearbyChurchesScreen';
import ChurchRegistrationScreen from './src/screens/ChurchRegistrationScreen';
import ChurchQRCodeScreen from './src/screens/ChurchQRCodeScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import OnboardingBasicInfoScreen from './src/screens/OnboardingBasicInfoScreen';
import OnboardingSportsScreen from './src/screens/OnboardingSportsScreen';
import OnboardingHobbiesScreen from './src/screens/OnboardingHobbiesScreen';
import OnboardingInterestAreaScreen from './src/screens/OnboardingInterestAreaScreen';
import OnboardingAgeRangeScreen from './src/screens/OnboardingAgeRangeScreen';
import OnboardingLifePhaseScreen from './src/screens/OnboardingLifePhaseScreen';
import OnboardingInterestsScreen from './src/screens/OnboardingInterestsScreen';
import OnboardingSocialScreen from './src/screens/OnboardingSocialScreen';
import OnboardingWhatsAppScreen from './src/screens/OnboardingWhatsAppScreen';
import OnboardingPrivacyScreen from './src/screens/OnboardingPrivacyScreen';

// Main App
import MainNavigator from './src/navigation/MainNavigator';
import AdminNavigator from './src/navigation/AdminNavigator';

// Detail Screens
import PersonProfileScreen from './src/screens/PersonProfileScreen';
import GroupDetailScreen from './src/screens/GroupDetailScreen';

// Admin Screens
import ChurchAdminLoginScreen from './src/screens/ChurchAdminLoginScreen';
import ChurchEditScreen from './src/screens/ChurchEditScreen';
import ChurchLocationScreen from './src/screens/ChurchLocationScreen';
import CreateGroupScreen from './src/screens/CreateGroupScreen';
import EditGroupScreen from './src/screens/EditGroupScreen';
import AdminManagementScreen from './src/screens/AdminManagementScreen';

// Church Onboarding Screens
import ChurchOnboardingWelcomeScreen from './src/screens/ChurchOnboardingWelcomeScreen';
import ChurchOnboardingChecklistScreen from './src/screens/ChurchOnboardingChecklistScreen';
import ChurchOnboardingGroupsScreen from './src/screens/ChurchOnboardingGroupsScreen';
import ChurchImplantationGuideScreen from './src/screens/ChurchImplantationGuideScreen';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [churchData, setChurchData] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const user = await getUser();
      if (user) {
        setIsLoggedIn(true);
        setIsAdmin(user.isAdmin || false);
        
        // Se for admin, prepara os dados da igreja
        if (user.isAdmin && user.church_id) {
          setChurchData({
            _id: user.church_id,
            name: user.church_name,
            qr_code_id: user.qr_code_id,
            admin_name: user.name,
            admin_email: user.email
          });
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={
            !isLoggedIn ? 'Initial' : 
            isAdmin ? 'AdminApp' : 
            'MainApp'
          }
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
          }}
        >
          {/* Initial Selection */}
          <Stack.Screen 
            name="Initial" 
            component={InitialScreen}
            options={{ headerShown: false }}
          />
          
          {/* Onboarding Flow - Member */}
          <Stack.Screen 
            name="QRScanner" 
            component={QRScannerScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="NearbyChurches" 
            component={NearbyChurchesScreen}
            options={{ 
              title: 'Igrejas próximas',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="Welcome" 
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="OnboardingBasicInfo" 
            component={OnboardingBasicInfoScreen}
            options={{ 
              title: 'Seus dados',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingSports" 
            component={OnboardingSportsScreen}
            options={{ 
              title: 'Esportes & Atividades',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingHobbies" 
            component={OnboardingHobbiesScreen}
            options={{ 
              title: 'Hobbies & Lazer',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingInterestArea" 
            component={OnboardingInterestAreaScreen}
            options={{ 
              title: 'Área de Interesse',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingAgeRange" 
            component={OnboardingAgeRangeScreen}
            options={{ 
              title: 'Faixa Etária',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingLifePhase" 
            component={OnboardingLifePhaseScreen}
            options={{ 
              title: 'Fase da Vida',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingInterests" 
            component={OnboardingInterestsScreen}
            options={{ 
              title: 'Seus interesses',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingSocial" 
            component={OnboardingSocialScreen}
            options={{ 
              title: 'Instagram',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingWhatsApp" 
            component={OnboardingWhatsAppScreen}
            options={{ 
              title: 'WhatsApp',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="OnboardingPrivacy" 
            component={OnboardingPrivacyScreen}
            options={{ 
              title: 'Privacidade',
              headerBackTitle: 'Voltar'
            }}
          />

          {/* Church Registration Flow */}
          <Stack.Screen 
            name="ChurchRegistration" 
            component={ChurchRegistrationScreen}
            options={{ 
              title: 'Cadastrar igreja',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="ChurchQRCode" 
            component={ChurchQRCodeScreen}
            options={{ 
              title: 'QR Code da Igreja',
              headerBackTitle: 'Voltar',
            }}
          />

          {/* Church Onboarding Flow */}
          <Stack.Screen 
            name="ChurchOnboardingWelcome" 
            component={ChurchOnboardingWelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="ChurchOnboardingChecklist" 
            component={ChurchOnboardingChecklistScreen}
            options={{ 
              title: 'Configuração da Igreja',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="ChurchOnboardingGroups" 
            component={ChurchOnboardingGroupsScreen}
            options={{ 
              title: 'Organizar Grupos',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="ChurchImplantationGuide" 
            component={ChurchImplantationGuideScreen}
            options={{ 
              title: 'Guia de Implantação',
              headerBackTitle: 'Voltar'
            }}
          />
          
          {/* Admin Screens */}
          <Stack.Screen 
            name="ChurchAdminLogin" 
            component={ChurchAdminLoginScreen}
            options={{ 
              title: 'Login Administrativo',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="ChurchEdit" 
            component={ChurchEditScreen}
            options={{ 
              title: 'Editar Igreja',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="ChurchLocation" 
            component={ChurchLocationScreen}
            options={{ 
              title: 'Localização',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="CreateGroup" 
            component={CreateGroupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditGroup" 
            component={EditGroupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="AdminManagement" 
            component={AdminManagementScreen}
            options={{ headerShown: false }}
          />
          
          {/* Shared Screens */}

          {/* Main App */}
          <Stack.Screen 
            name="MainApp" 
            component={MainNavigator}
            options={{ headerShown: false }}
          />

          {/* Admin App */}
          <Stack.Screen 
            name="AdminApp" 
            component={AdminNavigator}
            options={{ headerShown: false }}
          />

          {/* Detail Screens */}
          <Stack.Screen 
            name="PersonProfile" 
            component={PersonProfileScreen}
            options={{ 
              title: 'Perfil',
              headerBackTitle: 'Voltar'
            }}
          />
          <Stack.Screen 
            name="GroupDetail" 
            component={GroupDetailScreen}
            options={{ 
              title: 'Grupo',
              headerBackTitle: 'Voltar'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}

