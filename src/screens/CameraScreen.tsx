
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  usePhotoOutput,
} from 'react-native-vision-camera';
import {CodeScanner} from 'react-native-vision-camera-barcode-scanner';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import colors from '../theme/colors';

type CameraMode = 'photo' | 'scanner';

const CameraScreen = () => {
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const photoOutput = usePhotoOutput();

  const [mode, setMode] = useState<CameraMode>('photo');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [scannedValue, setScannedValue] = useState<string | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const takePhoto = async () => {
    try {
      const photo = await photoOutput.capturePhotoToFile({}, {});

      const uri = photo.filePath.startsWith('file://')
        ? photo.filePath
        : `file://${photo.filePath}`;

      // Save the captured photo to the device gallery.
      await CameraRoll.save(uri, {
        type: 'photo',
      });

      setPhotoUri(uri);
      setIsCameraActive(false);

      Alert.alert(
        'Photo Saved',
        'Your photo has been saved to the gallery.',
      );
    } catch (error) {
      console.warn('Photo capture or save error:', error);

      Alert.alert(
        'Camera Error',
        'Unable to capture or save the photo. Please try again.',
      );
    }
  };

  const handleBarcodeScanned = (barcodes: any[]) => {
    if (hasScanned || barcodes.length === 0) {
      return;
    }

    const barcode = barcodes[0];
    const value = barcode.rawValue ?? barcode.displayValue;

    if (value) {
      setHasScanned(true);
      setScannedValue(value);
      setIsCameraActive(false);
    }
  };

  const startScanning = () => {
    setScannedValue(null);
    setHasScanned(false);
    setPhotoUri(null);
    setMode('scanner');
    setIsCameraActive(true);
  };

  const startCamera = () => {
    setPhotoUri(null);
    setScannedValue(null);
    setHasScanned(false);
    setMode('photo');
    setIsCameraActive(true);
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          Camera permission is required.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.message}>
          No camera device was found.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.modeButtons}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'photo' && styles.selectedMode,
          ]}
          onPress={startCamera}>
          <Text style={styles.modeText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'scanner' && styles.selectedMode,
          ]}
          onPress={startScanning}>
          <Text style={styles.modeText}>Scan QR</Text>
        </TouchableOpacity>
      </View>

      {mode === 'photo' ? (
        <>
          {photoUri ? (
            <ScrollView contentContainerStyle={styles.photoContainer}>
              <Text style={styles.resultTitle}>Captured Photo</Text>

              <Image
                source={{uri: photoUri}}
                style={styles.capturedImage}
                resizeMode="contain"
              />

              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  setPhotoUri(null);
                  setIsCameraActive(true);
                }}>
                <Text style={styles.buttonText}>Take Another Photo</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <>
              <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={isCameraActive}
                outputs={[photoOutput]}
              />

              <View style={styles.controls}>
                <Text style={styles.title}>Camera</Text>

                <TouchableOpacity
                  style={styles.captureButton}
                  onPress={takePhoto}
                  accessibilityLabel="Take photo">
                  <View style={styles.captureCircle} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      ) : (
        <>
          {!hasScanned ? (
            <View style={styles.scannerContainer}>
              <CodeScanner
                style={styles.scanner}
                isActive={isCameraActive}
                barcodeFormats={['qr-code']}
                onBarcodeScanned={handleBarcodeScanned}
                onError={error => {
                  console.warn('QR scanner error:', error);
                }}
              />

              <View style={styles.scannerInstructions}>
                <Text style={styles.scannerInstructionText}>
                  Point the camera at a QR code.
                </Text>
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.resultContainer}>
              <Text style={styles.resultTitle}>QR Code Result</Text>

              <Text selectable style={styles.resultText}>
                {scannedValue}
              </Text>

              <TouchableOpacity
                style={styles.button}
                onPress={startScanning}>
                <Text style={styles.buttonText}>Scan Another Code</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  modeButtons: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
    backgroundColor: colors.background,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: colors.secondary,
  },
  selectedMode: {
    backgroundColor: colors.lime,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.secondary,
  },
  captureCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
  },
  photoContainer: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
  },
  capturedImage: {
    width: '100%',
    height: 420,
    marginTop: 16,
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  scanner: {
    flex: 1,
  },
  scannerInstructions: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    padding: 14,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  scannerInstructionText: {
    color: colors.text,
    fontSize: 15,
  },
  resultContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  resultTitle: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 10,
    width: '100%',
  },
});

export default CameraScreen;
