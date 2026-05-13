import {
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Text,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import type { LocalPhoto } from '../lib/types';

type Props = {
  photos: LocalPhoto[];
  onPhotosChange: (photos: LocalPhoto[]) => void;
  maxPhotos?: number;
};

export default function PhotoGallery({ photos, onPhotosChange, maxPhotos = 10 }: Props) {
  const canAdd = photos.length < maxPhotos;

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow access to your photo library.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: maxPhotos - photos.length,
    });

    if (!result.canceled) {
      const newPhotos: LocalPhoto[] = result.assets.map((a) => ({
        uri: a.uri,
        width: a.width,
        height: a.height,
      }));
      onPhotosChange([...photos, ...newPhotos]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please allow camera access.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.85,
      allowsEditing: true,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      onPhotosChange([...photos, { uri: asset.uri, width: asset.width, height: asset.height }]);
    }
  };

  const removePhoto = (index: number) => {
    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const showAddOptions = () => {
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }
    Alert.alert('Add Photo', 'Choose a source', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {photos.map((photo, index) => (
        <View key={index} style={styles.photoWrap}>
          <Image source={{ uri: photo.uri }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removePhoto(index)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={22} color="#EF4444" />
          </TouchableOpacity>
        </View>
      ))}

      {canAdd && (
        <TouchableOpacity style={styles.addBtn} onPress={showAddOptions}>
          <Ionicons name="camera-outline" size={24} color="#6B7280" />
          <Text style={styles.addText}>Add Photo</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10, paddingVertical: 4, paddingRight: 4 },
  photoWrap: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 10 },
  removeBtn: { position: 'absolute', top: -6, right: -6 },
  addBtn: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F9FAFB',
  },
  addText: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
});
