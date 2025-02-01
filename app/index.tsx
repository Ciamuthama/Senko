/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";

import Add from "@/assets/images/add.svg";

import Grid from "@/assets/images/grid.svg";
import Svg, { Path } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import {
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  FlatList,
  ImageBackground,
  Image,
  TouchableOpacity,
  View
} from "react-native";

import { FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Share from "react-native-share";
import ViewShot, { captureRef } from "react-native-view-shot";


import { Audio } from "expo-av";
import { useKeepAwake } from 'expo-keep-awake';


import { BlurView } from "expo-blur";
const Width = Dimensions.get("screen").width;
const Height = Dimensions.get("screen").height;

const cacheImage = async (uri: string, fileName: string): Promise<string> => {
  const cacheDir = `${FileSystem.cacheDirectory}cached_images/`;
  await FileSystem.makeDirectoryAsync(cacheDir, { intermediates: true });
  const cachedPath = `${cacheDir}${fileName}`;
  const fileInfo = await FileSystem.getInfoAsync(cachedPath);

  if (!fileInfo.exists) {
    if (uri.startsWith("file://")) {
      await FileSystem.copyAsync({ from: uri, to: cachedPath });
    } else {
      await FileSystem.downloadAsync(uri, cachedPath);
    }
  }
  return cachedPath;
};

export default function App() {
  useKeepAwake();
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const [sounds, setSounds] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);

  useEffect(() => {
    const cacheFallback = async () => {
      const fallbackUrl =
        "https://cdn.jsdelivr.net/gh/Ciamuthama/cdnfiles@main/background.jpg";
      const fileName = fallbackUrl.split("/").pop() || "fallback.jpg";
      await cacheImage(fallbackUrl, fileName);
    };
    cacheFallback();
  }, []);

  // Modified open function
  const open = useMemo(
    () => async () => {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          selectionLimit: 4,
          allowsMultipleSelection: true,
        });

        if (!result.canceled && result.assets) {
          const cachedAssets = await Promise.all(
            result.assets.map(async (asset) => ({
              ...asset,
              uri: await cacheImage(
                asset.uri,
                asset.fileName || Date.now().toString()
              ),
            }))
          );
          setImage(cachedAssets);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Image picker error:", err);
      }
      handlePause();
    },
    []
  );
  let audio = {};
  const selectAudio = useMemo(
    () => async () => {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: "audio/*",
          copyToCacheDirectory: true,
          multiple: true,
        });

        if (result.assets) {
          const audioArr = result.assets;
          setAudioUri(audioArr);
          console.log(audioUri);
        }

        if (result.assets?.length! > 0) {
          setImgIndex(0);
        }
      } catch (err) {
        // see error handling
      }
    },
    []
  );

  useEffect(() => {
    const createSound = async (audioUri: any) => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audio/ed.mp3") || { uri: audioUri[imgIndex].uri }
      );
      await sound.setIsLoopingAsync(true);
      setSounds(sound);
      return sound;
    };

    createSound(audioUri);

    return () => {
      sounds?.unloadAsync();
    };
  }, [audioUri]);

  useEffect(() => {
    let interval: any;
    if (isAnimating && sounds && image.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((currentIndex + 1) % image.length);
        sounds.playAsync();
        
      }, 120);

    }

    return () => {
      clearInterval(interval);
    };
  }, [currentIndex, image.length, isAnimating, sounds]);

  const handlePause = () => {
    sounds?.pauseAsync();
    setIsAnimating(!isAnimating);
    setShowButtons(!showButtons);
   
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + image.length) % image.length);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % image.length);
  };

  const ref = useRef(null);
  const share = async () => {
    try {
      const uri = await captureRef(ref, {
        format: "jpg",
        quality: 0.5,
        result: "base64",
      });

      Share.open({
        title: image[currentIndex].fileName!,
        url: image[currentIndex].uri,
      })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } catch (error) {}
  };

  const img = image[currentIndex]?.uri
    ? { uri: image[currentIndex].uri }
    : {uri: "https://cdn.jsdelivr.net/gh/Ciamuthama/cdnfiles@main/background.jpg"};

  const renderItem = ({ item }: { item: ImagePicker.ImagePickerAsset }) => {
    return (
      <View>
        <Image source={{ uri: item.uri }} width={Width} height={Height} />
      </View>
    );
  };
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri:
            image[0]?.uri ||
            "https://cdn.jsdelivr.net/gh/Ciamuthama/cdnfiles@main/background.jpg",
        }}
        style={{
          zIndex: -1,
          position: "absolute",
        }}
        width={Width}
        height={Height}
        blurRadius={100}
      />
      <BlurView style={styles.blurContainer} tint="dark">
        <Text
          style={{
            fontSize: 18,
            fontFamily: "Nunito_600SemiBold",
            textAlign: "center",
            color: "white",
          }}
        >
          Senkō
        </Text>
      </BlurView>
      <TouchableOpacity
        style={{
          position: "absolute",
          height: Height,
          width: Width / 3,
          top: 0,
          left: 0,
          zIndex:100,
        }}
        onPress={handlePrevious}
      >
      </TouchableOpacity>
      <Image source={img} width={Width} height={Height} />
      <TouchableOpacity
        style={{
          position: "absolute",
          height: Height,
          width: Width / 3,
          top: 0,
          right: 0,
        }}
        onPress={handleNext}
      >
      </TouchableOpacity>
      <BlurView style={styles.ButtonContainer} tint="dark">
        <TouchableOpacity onPress={handlePause} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          {showButtons ? (
            <Text>
              <Svg
                id="Outline"
                viewBox="0 0 24 24"
                width={25}
                height={25}
                fill={"white"}
              >
                <Path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z" />
              </Svg>
            </Text>
          ) : image.length == 0 ? (
            <Text>
              <Svg
                id="Outline"
                viewBox="0 0 24 24"
                width={25}
                height={25}
                fill={"white"}
              >
                <Path d="M20.494,7.968l-9.54-7A5,5,0,0,0,3,5V19a5,5,0,0,0,7.957,4.031l9.54-7a5,5,0,0,0,0-8.064Zm-1.184,6.45-9.54,7A3,3,0,0,1,5,19V5A2.948,2.948,0,0,1,6.641,2.328,3.018,3.018,0,0,1,8.006,2a2.97,2.97,0,0,1,1.764.589l9.54,7a3,3,0,0,1,0,4.836Z" />
              </Svg>
            </Text>
          ) : (
            <Text>
              <Svg
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 24 24"
                width={25}
                height={25}
                fill={"white"}
              >
                <Path d="m12,0C5.383,0,0,5.383,0,12s5.383,12,12,12,12-5.383,12-12S18.617,0,12,0Zm0,22c-5.514,0-10-4.486-10-10S6.486,2,12,2s10,4.486,10,10-4.486,10-10,10Zm-1-13v6c0,.552-.448,1-1,1s-1-.448-1-1v-6c0-.552.448-1,1-1s1,.448,1,1Zm4,0v6c0,.552-.448,1-1,1s-1-.448-1-1v-6c0-.552.448-1,1-1s1,.448,1,1Z" />
              </Svg>
            </Text>
          )}
        </TouchableOpacity>
        <Pressable onPress={open}>
          <Text>
            <Add width={30} height={30} fill={"white"} />
          </Text>
        </Pressable>
        <TouchableOpacity>
          <Text>
            <Grid width={25} height={25} fill={"white"} />
          </Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  buttonOpen: {
    margin: 24,
    backgroundColor: "#fff",
    padding: 12,
    alignItems: "center",
    width: 48,
  },
  textOpen: {
    fontWeight: "bold",
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  buttonBottom: {
    backgroundColor: "rgba(255, 255, 255, 0.30)",
    paddingHorizontal: 15,
    paddingVertical: 5,
    shadowColor: "rgba(31, 38, 135, 0),",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 5,
    borderRadius: 10,
  },
  blurContainer: {
    position: "absolute",
    top: 20,
    left: Width / 2.6,
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
    flex: 1,
    margin: 16,
    textAlign: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  blurContainer2: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: 100,
  },
  backgroundLiner: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  background2: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },

  ButtonContainer: {
    flex: 1,
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    color: "white",
    overflow: "hidden",
    left: Width / 3,
    bottom: 30,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    zIndex: 1,
  },

  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 500,
    zIndex: 20,
  },
});
