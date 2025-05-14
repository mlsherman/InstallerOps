import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const { width } = Dimensions.get("window");
const photoSize = (width - 60) / 3; // 3 photos per row with margins

const PhotoGallery = ({ photos = [], onPhotosChange }) => {
  const handleAddPhoto = () => {
    Alert.alert("Add Photo", "Choose an option", [
      { text: "Cancel", style: "cancel" },
      { text: "Camera", onPress: openCamera },
      { text: "Photo Library", onPress: openImageLibrary },
    ]);
  };

  const openCamera = async () => {
    // Request camera permission
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Camera permission is required to take photos. Please enable it in settings.",
        [{ text: "OK" }]
      );
      return;
    }

    // Launch camera with different options
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Disable editing which can cause issues
      quality: 0.8,
      allowsMultipleSelection: false,
      base64: false,
    });

    console.log("Camera result:", result); // Debug log

    if (!result.canceled && result.assets && result.assets[0]) {
      console.log("Photo URI:", result.assets[0].uri); // Debug log
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        fileName: `photo_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
      };
      onPhotosChange([...photos, newPhoto]);
    } else {
      console.log("Camera result was canceled or no assets"); // Debug log
    }
  };

  const openImageLibrary = async () => {
    // Request media library permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Photo library permission is required to select photos. Please enable it in settings.",
        [{ text: "OK" }]
      );
      return;
    }

    // Launch image library
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        fileName: `photo_${Date.now()}.jpg`,
        timestamp: new Date().toISOString(),
      };
      onPhotosChange([...photos, newPhoto]);
    }
  };

  const handleDeletePhoto = (photoId) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const updatedPhotos = photos.filter((photo) => photo.id !== photoId);
          onPhotosChange(updatedPhotos);
        },
      },
    ]);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Job Photos</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPhoto}>
          <Text style={styles.addButtonText}>+ Add Photo</Text>
        </TouchableOpacity>
      </View>

      {photos.length === 0 ? (
        <Text style={styles.noPhotosText}>
          No photos yet. Tap "Add Photo" to get started.
        </Text>
      ) : (
        <ScrollView horizontal={false}>
          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <TouchableOpacity
                key={photo.id}
                style={styles.photoContainer}
                onLongPress={() => handleDeletePhoto(photo.id)}
              >
                <Image source={{ uri: photo.uri }} style={styles.photo} />
                <Text style={styles.photoTimestamp}>
                  {formatDate(photo.timestamp)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.helpText}>Long press any photo to delete</Text>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  noPhotosText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 10,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  photoContainer: {
    marginBottom: 12,
  },
  photo: {
    width: photoSize,
    height: photoSize,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  photoTimestamp: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  helpText: {
    textAlign: "center",
    color: "#999",
    fontSize: 12,
    marginTop: 8,
  },
});

export default PhotoGallery;
