
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Ionicons} from '@react-native-vector-icons/ionicons';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import '../config/googleSignIn';
import colors from '../theme/colors';
import {login, googleLogin} from '../services/authService';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

function LoginScreen({navigation}: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (loading) {
      return;
    }

    if (!email.trim() || !password) {
      Alert.alert(
        'Missing details',
        'Please enter your email and password.',
      );
      return;
    }

    try {
      setLoading(true);

      await login({
        email: email.trim(),
        password,
      });

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Email login error:', error);

      Alert.alert(
        'Login failed',
        'Please check your email and password, then try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Clear the previous Google Sign-In session.
      try {
        await GoogleSignin.signOut();
      } catch (error) {
        console.log(
          'No previous Google session to clear:',
          error,
        );
      }

      // Start a new Google sign-in attempt.
      const response = await GoogleSignin.signIn();

      if (response.type === 'cancelled') {
        return;
      }

      const googleIdToken = response.data.idToken;

      if (!googleIdToken) {
        Alert.alert(
          'Google sign-in failed',
          'Google did not return an ID token. Please try again.',
        );
        return;
      }

      // Send the selected Google account's ID token to the backend.
      await googleLogin(googleIdToken);

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Google login error:', error);

      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            return;

          case statusCodes.IN_PROGRESS:
            Alert.alert(
              'Sign-in in progress',
              'Please wait for the current sign-in attempt to finish.',
            );
            return;

          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            Alert.alert(
              'Google Play Services unavailable',
              'Please update or enable Google Play Services, then try again.',
            );
            return;
        }
      }

      Alert.alert(
        'Google login failed',
        'Unable to sign in with Google. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/login-wallpaper.jpg')}
      style={styles.background}
      resizeMode="cover">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.heading}>
              <Text style={styles.brand}>sora.</Text>

              <Text style={styles.tagline}>
                Better habits. Brighter future.
              </Text>

              <Text style={styles.title}>Welcome back</Text>

              <Text style={styles.subtitle}>
                Sign in to keep your finances in view.
              </Text>
            </View>

            <View style={styles.formCard}>
              <Text style={styles.label}>Email address</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#666666"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  returnKeyType="next"
                />
              </View>

              <Text style={styles.label}>Password</Text>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={colors.textSecondary}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#666666"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  onSubmitEditing={handleLogin}
                  returnKeyType="go"
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(previous => !previous)
                  }
                  disabled={loading}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }>
                  <Ionicons
                    name={
                      showPassword
                        ? 'eye-off-outline'
                        : 'eye-outline'
                    }
                    size={21}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Sign in</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#FFFFFF"
                    />
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.divider} />
              </View>

              <TouchableOpacity
                style={[
                  styles.googleButton,
                  loading && styles.buttonDisabled,
                ]}
                onPress={handleGoogleSignIn}
                disabled={loading}
                activeOpacity={0.8}>
                {loading ? (
                  <ActivityIndicator color={colors.primary} />
                ) : (
                  <>
                    <Ionicons
                      name="logo-google"
                      size={19}
                      color={colors.primary}
                    />
                    <Text style={styles.googleButtonText}>
                      Continue with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>
                  Don't have an account?
                </Text>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Register')}
                  disabled={loading}>
                  <Text style={styles.registerLink}>
                    Create account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.footer}>
              A little more clarity, one expense at a time.
            </Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#FEFBEA',
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(254, 251, 234, 0.12)',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },

  heading: {
    marginBottom: 25,
  },

  brand: {
    color: '#392B20',
    fontSize: 43,
    fontWeight: '800',
    letterSpacing: -1.8,
  },

  tagline: {
    color: '#77604D',
    fontSize: 13,
    letterSpacing: 1,
    marginTop: 3,
    marginBottom: 30,
  },

  title: {
    color: '#392B20',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },

  subtitle: {
    color: '#776B61',
    fontSize: 14,
    lineHeight: 21,
  },

  formCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(238, 218, 230, 0.9)',
  },

  label: {
    color: '#392B20',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 9,
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E1F3F5',
    borderColor: '#C3E9FE',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 13,
    marginBottom: 19,
    gap: 10,
  },

  input: {
    flex: 1,
    minWidth: 0,
    color: '#392B20',
    fontSize: 14,
    paddingVertical: 13,
  },

  button: {
    minHeight: 52,
    backgroundColor: '#392B20',
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 21,
  },

  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9DFD2',
  },

  dividerText: {
    color: '#887F76',
    fontSize: 11,
    fontWeight: '600',
    marginHorizontal: 13,
  },

  googleButton: {
    minHeight: 51,
    backgroundColor: '#FFFFFF',
    borderColor: '#E9DFD2',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  googleButtonText: {
    color: '#392B20',
    fontSize: 14,
    fontWeight: '700',
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 22,
  },

  registerText: {
    color: '#887F76',
    fontSize: 12,
  },

  registerLink: {
    color: '#392B20',
    fontSize: 12,
    fontWeight: '800',
  },

  footer: {
    color: '#776B61',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 22,
  },
});

export default LoginScreen;
