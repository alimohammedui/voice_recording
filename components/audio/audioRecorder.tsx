import { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Image,
  TouchableOpacity,
  Text,
} from "react-native";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

export default function AudioRecorder({
  callback,
}: {
  callback: (path: string) => void;
}) {
  const [recording, setRecording] = useState<Audio.Recording | undefined>(
    undefined
  );
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI() || "";
    if (uri) {
      console.log("Recording stopped and stored at", uri);
      callback(uri);
    }
  }

  // async function getBlobFromStorage(uri: string) {
  //   try {
  //     const blob = await FileSystem.readAsStringAsync(uri, {
  //       encoding: FileSystem.EncodingType.Base64,
  //     });
  //     const decodedBlob = atob(blob); // Decode Base64
  //     return decodedBlob;
  //   } catch (error) {
  //     console.error("Error fetching blob:", error);
  //   }
  // }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
        <Image
          source={{
            uri: recording
              ? "https://cdn4.iconfinder.com/data/icons/flat-pro-multimedia-set-1/32/btn-blue-play-pause-512.png"
              : "https://cdn-icons-png.flaticon.com/512/5667/5667341.png",
            width: 100,
            height: 100,
          }}
        />
        <Text style={{ fontSize: 22, textAlign: "center" }}>
          {recording ? "Stop" : "Play"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#ecf0f1",
    padding: 10,
  },
});
