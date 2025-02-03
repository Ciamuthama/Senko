/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import Add from "@/assets/images/add.svg";
import Copy from "@/assets/images/copy-image.svg";
import Background from "@/assets/images/background.svg";
import Svg, { Path } from "react-native-svg";
import * as FileSystem from "expo-file-system";
import {
  StyleSheet,
  Dimensions,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { useKeepAwake } from "expo-keep-awake";
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
  const [isAnimating, setIsAnimating] = useState(true);
  const [sounds, setSounds] = useState<Audio.Sound | null>(null);

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
          quality: 0.2,
          allowsMultipleSelection: true,
          base64: true,
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

  useEffect(() => {
    const createSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("@/assets/audio/song.mp3")
      );
      await sound.setIsLoopingAsync(true);
      setSounds(sound);
      return sound;
    };

    createSound();

    return () => {
      sounds?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    let interval: any;
    if (isAnimating && sounds && image.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((currentIndex + 1) % image.length);
        sounds.playAsync();
      }, 165);
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

  const img = image[currentIndex]?.uri
    ? { uri: image[currentIndex].uri }
    : {
        uri: "https://cdn.jsdelivr.net/gh/Ciamuthama/cdnfiles@main/background.jpg",
      };

  return (
    <View style={styles.container}>
      <View style={{flex:1,position:"absolute",height:"100%", flexDirection: "column",justifyContent:"space-between", alignItems: "center", zIndex: 1,paddingVertical:30,marginHorizontal:"auto",left:0,right:0,}}>
        <BlurView style={styles.blurContainer} tint="dark">
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Montserrat_400Regular",
              textAlign: "center",
              color: "white",
            }}
          >
            Senkō
          </Text>
        </BlurView>
        <BlurView style={styles.ButtonContainer} tint="dark">
          <TouchableOpacity
            onPress={handlePause}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
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
              <Add
                width={30}
                height={30}
                fill={image.length <= 0 || showButtons ? "white" : "gray"}
                disabled={image.length <= 0 || showButtons}
              />
            </Text>
          </Pressable>
          <TouchableOpacity
            activeOpacity={1}
            hitSlop={{ top: 30, bottom: 30, left: 20, right: 30 }}
            onPress={() => {
              Clipboard.setImageAsync(image[currentIndex].base64! || "");
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
            }}
          >
            <Text>
              <Copy
                width={25}
                height={25}
                fill={
                  showButtons ? "white" : image.length <= 0 ? "gray" : "gray"
                }
                disabled={showButtons}
              />
            </Text>
          </TouchableOpacity>
        </BlurView>
      </View>

      <TouchableOpacity
        style={{
          position: "absolute",
          height: Height,
          width: "15%",
          top: 0,
          left: 0,
          zIndex: 100,
        }}
        onPress={handlePrevious}
      ></TouchableOpacity>
      {image.length <= 0 ? (
        <Background />
      ) : (
        <Image source={img} style={{ width: "100%", height: "100%" }} />
      )}

      <TouchableOpacity
        style={{
          position: "absolute",
          height: Height,
          width: "15%",
          top: 0,
          right: 0,
          zIndex: 100,
        }}
        onPress={handleNext}
      ></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },

  blurContainer: {
    left: "auto",
    right: "auto",
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  ButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    color: "white",
    overflow: "hidden",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 50,
    zIndex: 1,
  },
});
