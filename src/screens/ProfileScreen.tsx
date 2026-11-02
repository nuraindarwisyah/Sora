
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CommonActions, useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';
import {CompositeScreenProps} from '@react-navigation/native';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import {GoogleSignin} from '@react-native-google-signin/google-signin';

import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import {logout} from '../services/authService';
import {getUser, type StoredUser} from '../services/authStorage';
import {
  RootStackParamList,
  TabParamList,
} from '../navigation/AppNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Profile'>,
  NativeStackScreenProps<RootStackParamList>
>;

function ProfileScreen({navigation}: Props) {
  const [loggingOut, setLoggingOut] = useState(false);
  const [user, setUser] = useState<StoredUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const savedUser = await getUser();
      setUser(savedUser);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setUser(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [loadUser]),
  );

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Sora?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoggingOut(true);

            try {
              await GoogleSignin.signOut();
            } catch (error) {
              // A Google session may not exist for email/password users.
              console.log('Google sign-out skipped:', error);
            }

            await logout();

            setUser(null);

            navigation.getParent()?.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'Login'}],
              }),
            );
          } catch (error) {
            console.error('Logout error:', error);

            Alert.alert(
              'Logout failed',
              'Something went wrong while logging out. Please try again.',
            );
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const displayName = user?.name?.trim() || 'Name not available';
  const displayEmail = user?.email?.trim() || 'Email not available';

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.brand}>sora.</Text>

      <View style={styles.heading}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>
          Manage your personal information.
        </Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons
            name="person-outline"
            size={32}
            color={colors.primary}
          />
        </View>

        {loadingProfile ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.email}>{displayEmail}</Text>
          </>
        )}
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>PERSONAL INFORMATION</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Full name</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {loadingProfile ? 'Loading...' : displayName}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email address</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {loadingProfile ? 'Loading...' : displayEmail}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.editButton}
        onPress={() => navigation.navigate('EditProfile')}
        activeOpacity={0.8}>
        <Ionicons
          name="create-outline"
          size={20}
          color={colors.primary}
        />
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Your profile information is saved securely on this device.
      </Text>

      <View style={styles.logoutSection}>
        <Text style={styles.logoutHeading}>ACCOUNT</Text>

        <TouchableOpacity
          style={[
            styles.logoutButton,
            loggingOut && styles.logoutButtonDisabled,
          ]}
          onPress={handleLogout}
          disabled={loggingOut}
          activeOpacity={0.8}>
          {loggingOut ? (
            <ActivityIndicator color="#B84D4D" />
          ) : (
            <>
              <Ionicons
                name="log-out-outline"
                size={21}
                color="#B84D4D"
              />
              <Text style={styles.logoutText}>Log out</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.logoutHint}>
          You can sign back in whenever you need to.
        </Text>
      </View>
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
    paddingBottom: 35,
  },

  brand: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.xl,
  },

  heading: {
    marginBottom: spacing.lg,
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
  },

  profileCard: {
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },

  name: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textAlign: 'center',
  },

  email: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },

  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    letterSpacing: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: 12,
  },

  infoLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },

  infoValue: {
    flex: 1.5,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
    textAlign: 'right',
  },

  divider: {
    height: 1,
    backgroundColor: colors.border,
  },

  editButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.secondary,
    borderRadius: 14,
    marginTop: spacing.md,
  },

  editButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },

  footer: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },

  logoutSection: {
    marginTop: 35,
  },

  logoutHeading: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 12,
  },

  logoutButton: {
    minHeight: 53,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E8C8C5',
    borderRadius: 15,
    paddingHorizontal: 16,
  },

  logoutButtonDisabled: {
    opacity: 0.6,
  },

  logoutText: {
    color: '#B84D4D',
    fontSize: 15,
    fontWeight: '700',
  },

  logoutHint: {
    color: colors.textSecondary,
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    marginTop: 12,
  },
});

export default ProfileScreen;
