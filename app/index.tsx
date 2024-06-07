/* eslint-disable react-native/no-inline-styles */
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { pick, types } from "react-native-document-picker";

import {
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  ImageBackground,
  Text,
  Button,
} from "react-native";
import { View } from "moti";
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

export default function App() {
  const [image, setImage] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showButtons, setShowButtons] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const Width = Dimensions.get("screen").width;
  const Height = Dimensions.get("screen").height;
  const [sounds, setSounds] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<any[]>([]);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["11%", "12%"], []);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    bottomSheetModalRef.current?.close();
  }, []);

  const open = useMemo(
    () => async () => {
      try {
        const results = await pick({
          mode: "open",
          allowMultiSelection: true,
          type: [types.images],
        });

        if (results) {
          const ImgArr = results;
          setImage(ImgArr);
        } else {
          console.error(results);
        }

        if (results.length > 0) {
          setCurrentIndex(0);
        }
      } catch (err) {
        // see error handling
      }
    },
    []
  );

  const selectAudio = useMemo(
    () => async () => {
      try {
        const result = await pick({
          mode: "open",
          type: [types.audio],
        });

        if (result) {
          const audioArr = result;
          setAudioUri(audioArr);
        }

        if (result.length > 0) {
          setImgIndex(0);
        }
      } catch (err) {
        // see error handling
      }
      handleImagePress();
    },
    []
  );

  useEffect(() => {
    const createSound = async (audioUri: any) => {
      const { sound } = await Audio.Sound.createAsync({
        uri: audioUri[imgIndex]?.uri,
      });
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
      }, 200); // Change the interval duration as needed
    }

    return () => {
      clearInterval(interval);
    };
  }, [currentIndex, image.length, isAnimating, sounds]);

  const handleImagePress = () => {
    setIsAnimating(!isAnimating);
    setShowButtons(!showButtons);
    dismiss();
    sounds?.pauseAsync();
    deactivateKeepAwake();
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
      });

      Share.open({ title: image[currentIndex].fileName, url: uri })
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          err && console.log(err);
        });
    } catch (error) {}
  };

  const img = image[currentIndex]?.uri;

  return (
    <BottomSheetModalProvider>
      <ImageBackground
        source={{}}
        style={{ flex: 1, justifyContent: "center" }}
        resizeMode="contain"
      >
        <View
          style={{
            position: "absolute",
            top: 40,
            left: Width / 2.27,
            borderBottomWidth: 2,
            borderColor: "white",
            borderRadius: 2,
            zIndex: 10,
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
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                style={styles.background}
              />
              <ViewShot ref={ref}>
                <FastImage
                  source={{ uri: img, priority: FastImage.priority.high }}
                  style={{ height: Height, width: Width }}
                  resizeMode={FastImage.resizeMode.cover}
                />
              </ViewShot>

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.backgroundTwo}
              />
            </Pressable>
          </View>

          <Pressable
            style={{
              position: "absolute",
              bottom: 20,
              left: Width - 230,
              zIndex: 10,
              backgroundColor: "white",
              borderRadius: 10,
              paddingHorizontal: 15,
              paddingVertical: 5,
            }}
            onPress={handlePresentModalPress}
          >
            <MaterialIcons name="add" size={24} color="black" />
          </Pressable>

          {showButtons && (
            <View
              style={{
                position: "absolute",
                left: Width / 2,
                bottom: Height / 2,
                zIndex: 100,
              }}
            >
              <FontAwesome5
                name="play"
                size={40}
                color="rgba(225,255,255,0.2)"
              />
            </View>
          )}
          {showButtons && (
            <View style={styles.ButtonContainer} transition={{ type: "decay" }}>
              <AntDesign
                name="swapleft"
                size={25}
                color="white"
                onPress={handlePrevious}
                style={styles.buttonBottom}
              />
              <Text>{audioUri[imgIndex]?.name}</Text>
              <AntDesign
                name="swapright"
                size={25}
                color="white"
                onPress={handleNext}
                style={styles.buttonBottom}
              />
            </View>
          )}

          <StatusBar style="light" />
        </View>
      </ImageBackground>
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
    shadowColor: "rgba(31, 38, 135, 0)",
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
    bottom: 20,
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
    zIndex: 100,
  },
  backgroundTwo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 700,
    zIndex: 100,
  },
});
