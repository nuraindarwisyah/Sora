
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Ionicons} from '@react-native-vector-icons/ionicons';

import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import {
  getUser,
  saveUser,
  type StoredUser,
} from '../services/authStorage';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'EditProfile'
>;

function EditProfileScreen({navigation}: Props) {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const savedUser = await getUser();

        if (savedUser) {
          setUser(savedUser);
          setName(savedUser.name ?? '');
        } else {
          Alert.alert(
            'Profile unavailable',
            'We could not find your saved profile information.',
          );
        }
      } catch (error) {
        console.error('Failed to load profile for editing:', error);

        Alert.alert(
          'Error',
          'Unable to load your profile. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      Alert.alert(
        'Name required',
        'Please enter your full name.',
      );
      return;
    }

    if (!user) {
      Alert.alert(
        'Profile unavailable',
        'Please sign in again and try again.',
      );
      return;
    }

    if (trimmedName === user.name.trim()) {
      Alert.alert(
        'No changes',
        'Your name has not been changed.',
      );
      return;
    }

    try {
      setSaving(true);

      await saveUser({
        ...user,
        name: trimmedName,
      });

      setUser({
        ...user,
        name: trimmedName,
      });

      Alert.alert(
        'Saved on this device',
        'Your name has been updated on this device. It has not been synchronised with the server.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (error) {
      console.error('Failed to save profile:', error);

      Alert.alert(
        'Save failed',
        'Your profile could not be saved. Please try again.',
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />
        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      <Text style={styles.brand}>sora.</Text>

      <View style={styles.heading}>
        <Text style={styles.title}>Edit profile</Text>
        <Text style={styles.subtitle}>
          Manage your personal information.
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={34}
            color={colors.primary}
          />
        </View>

        <Text style={styles.avatarHint}>
          Personal information
        </Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.sectionTitle}>
          PERSONAL INFORMATION
        </Text>

        <Text style={styles.label}>Full name</Text>

        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="words"
          autoCorrect={false}
          returnKeyType="done"
          maxLength={100}
        />

        <Text style={[styles.label, styles.emailLabel]}>
          Email address
        </Text>

        <View style={[styles.input, styles.readOnlyInput]}>
          <Text
            style={styles.emailText}
            numberOfLines={2}>
            {user?.email || 'Email not available'}
          </Text>

          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={colors.textSecondary}
          />
        </View>

        <Text style={styles.helperText}>
          Your registered email address cannot be changed here.
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.saveButton,
          saving && styles.buttonDisabled,
        ]}
        onPress={handleSave}
        disabled={saving}
        activeOpacity={0.8}>
        {saving ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <>
            <Ionicons
              name="checkmark-circle-outline"
              size={20}
              color={colors.white}
            />
            <Text style={styles.saveButtonText}>
              Save Changes
            </Text>
          </>
        )}
      </TouchableOpacity>

      <Text style={styles.footer}>
        Your registered email remains unchanged.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  container: {
    padding: spacing.lg,
    paddingBottom: 36,
  },

  brand: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },

  loadingText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.sm,
  },

  heading: {
    marginBottom: spacing.xl,
  },

  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },

  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    lineHeight: 22,
  },

  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },

  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarHint: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },

  formCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: spacing.lg,
  },

  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: spacing.lg,
  },

  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },

  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    color: colors.primary,
    fontSize: typography.fontSize.md,
    backgroundColor: colors.white,
  },

  emailLabel: {
    marginTop: spacing.lg,
  },

  readOnlyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    gap: spacing.sm,
  },

  emailText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: typography.fontSize.md,
  },

  helperText: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    marginTop: spacing.sm,
    lineHeight: 18,
  },

  saveButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 14,
    marginTop: spacing.lg,
  },

  saveButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  footer: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 18,
  },
});

export default EditProfileScreen;
