
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Region} from 'react-native-maps';
import colors from '../theme/colors';

const MapScreen = () => {
  const [region, setRegion] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Sora needs your location to show it on the map.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(
            'Location Permission',
            'Location access was not granted. The map will show a default location.',
          );
          setDefaultRegion();
          return;
        }
      }

      // Current location will be retrieved in the next step.
      setDefaultRegion();
    } catch (error) {
      console.warn('Location permission error:', error);
      setDefaultRegion();
    }
  };

  const setDefaultRegion = () => {
    setRegion({
      latitude: 3.139,
      longitude: 101.6869,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
    setLoading(false);
  };

  if (loading || !region) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton>
        <Marker
          coordinate={{
            latitude: 3.139,
            longitude: 101.6869,
          }}
          title="Kuala Lumpur"
          description="Default map marker"
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
  },
});

export default MapScreen;
