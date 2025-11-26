import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_KEY = '@unichurch:user';
const CHURCH_KEY = '@unichurch:church';

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error('Error removing user:', error);
  }
};

export const saveChurch = async (church) => {
  try {
    await AsyncStorage.setItem(CHURCH_KEY, JSON.stringify(church));
  } catch (error) {
    console.error('Error saving church:', error);
  }
};

export const getChurch = async () => {
  try {
    const church = await AsyncStorage.getItem(CHURCH_KEY);
    return church ? JSON.parse(church) : null;
  } catch (error) {
    console.error('Error getting church:', error);
    return null;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([USER_KEY, CHURCH_KEY]);
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

