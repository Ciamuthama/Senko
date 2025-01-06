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

import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  Image,
  Text,
  Button,
  TouchableOpacity,
} from "react-native";
import { MotiView, View } from "moti";
import {
  MaterialIcons,
  AntDesign,
  Fontisto,
  FontAwesome5,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Share from "react-native-share";
import ViewShot, { captureRef } from "react-native-view-shot";
import FastImage from "react-native-fast-image";
import { StatusBar } from "expo-status-bar";
import { Audio } from "expo-av";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProvider,
  useBottomSheet,
  useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { Easing } from "react-native-reanimated";
import { BlurView } from "expo-blur";

export default function App() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const Width = Dimensions.get("window").width;
  const Height = Dimensions.get("screen").height;
  const [sounds, setSounds] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<
    DocumentPicker.DocumentPickerAsset[]
  >([]);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["11%", "13%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const open = useMemo(
    () => async () => {
      try {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 1,
          allowsMultipleSelection: true,
        });

        if (!result.canceled) {
          setImage(result.assets);
        }
        if (result.assets) {
          setImage(result.assets);
        } else {
          console.error(result);
        }

        if (result.assets?.length! > 0) {
          setCurrentIndex(0);
        }
      } catch (err) {
        // see error handling
      }
      handleImagePress();
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
        activateKeepAwakeAsync();
      }, 200);
    }

    return () => {
      clearInterval(interval);
    };
  }, [currentIndex, image.length, isAnimating, sounds]);

  const handleImagePress = () => {
    sounds?.pauseAsync();
    setIsAnimating(!isAnimating);
    setShowButtons(!showButtons);
    dismiss();
    activateKeepAwakeAsync();
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
        quality: 1,
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
    ? { uri: image[currentIndex].uri, priority: FastImage.priority.high }
    : require("../assets/images/background.jpg");
  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1, justifyContent: "center" }}>
        <View
          style={{
            position: "absolute",
            top: 40,
            left: Width / 2.27,
            borderBottomWidth: 2,
            borderColor: "white",
            borderRadius: 2,
            zIndex: 30,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontFamily: "Nunito_600SemiBold",
              color: "white",
            }}
          >
            Senkō
          </Text>
        </View>
        <View>
          <BottomSheetModal
            ref={bottomSheetModalRef}
            index={1}
            snapPoints={snapPoints}
          >
            <AntDesign
              name="close"
              color={"black"}
              size={15}
              onPress={dismiss}
              style={{ marginLeft: Width - 30 }}
            />
            <BottomSheetView style={styles.titleContainer}>
              <Pressable
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={open}
              >
                <Text>
                  <MaterialIcons name="add-a-photo" size={24} color="black" />
                </Text>
                <Text style={{ fontFamily: "Nunito_500Medium" }}>Photo</Text>
              </Pressable>

              <Pressable
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={selectAudio}
              >
                <Text>
                  <MaterialIcons name="music-note" size={24} color="black" />
                </Text>
                <Text style={{ fontFamily: "Nunito_500Medium" }}>Music</Text>
              </Pressable>
              <Pressable
                style={{ justifyContent: "center", alignItems: "center" }}
                onPress={share}
              >
                <Text>
                  <MaterialIcons name="share" size={24} color="black" />
                </Text>
                <Text style={{ fontFamily: "Nunito_500Medium" }}>Share</Text>
              </Pressable>
            </BottomSheetView>
          </BottomSheetModal>
          <View>
            <Pressable onPress={handleImagePress}>
              <ViewShot ref={ref}>
                <FastImage
                  source={img}
                  style={{
                    height: Height,
                    width: Width,
                    position: "relative",
                    zIndex: 0,
                    marginHorizontal: "auto",
                  }}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </ViewShot>

              <Image
                source={{ uri: image[0]?.uri }}
                style={{
                  height: Height,
                  width: Width,
                  position: "absolute",
                  zIndex: -1,
                }}
                resizeMode="stretch"
                blurRadius={100}
              />

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.backgroundTwo}
              />
            </Pressable>
          </View>

          {[...Array(1).keys()].map((index) => {
            return (
              <MotiView
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: Width - 230,
                  zIndex: 5,
                  backgroundColor: "white",
                  borderRadius: 10,
                  paddingHorizontal: 27,
                  paddingVertical: 16,
                }}
                key={index}
              />
            );
          })}
          <TouchableOpacity
            style={{
              position: "absolute",
              bottom: 29,
              left: Width - 230,
              zIndex: 50,
              backgroundColor: "white",
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 5,
            }}
            onPress={handlePresentModalPress}
          >
            <MaterialIcons
              name="add"
              size={24}
              color="black"
              onPress={handlePresentModalPress}
            />
          </TouchableOpacity>

          {showButtons && (
            <View
              style={{
                position: "absolute",
                left: Width / 2.2,
                bottom: Height / 2,
                zIndex: 100,
              }}
            >
              <FontAwesome5
                name="play"
                size={50}
                color="rgba(225,255,255,0.2)"
              />
            </View>
          )}
          {showButtons && (
            <View style={styles.ButtonContainer}>
              <AntDesign
                name="swapleft"
                size={25}
                color="white"
                onPress={handlePrevious}
                style={styles.buttonBottom}
              />
              <AntDesign
                name="swapright"
                size={25}
                color="white"
                onPress={handleNext}
                style={styles.buttonBottom}
              />
            </View>
          )}

          <StatusBar style="dark" />
        </View>
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
  },

  titleContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    marginVertical: 10,
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
  ButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 29,
    left: 0,
    right: 0,
    zIndex: 1,
    marginHorizontal: 10,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 500,
    zIndex: 20,
  },
  backgroundTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 700,
    zIndex: 20,
  },
});
