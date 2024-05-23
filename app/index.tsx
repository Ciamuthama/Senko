/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { pick, types } from "react-native-document-picker";
import {
  Button,
  StyleSheet,
  Text,
  Image,
  Dimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { View } from "moti";
import {
  MaterialIcons,
  Ionicons,
  AntDesign,
  FontAwesome,
  Fontisto,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Share from "react-native-share";
import ViewShot, { captureRef } from "react-native-view-shot";
import FastImage from "react-native-fast-image"
import { StatusBar } from 'expo-status-bar';


export default function App() {
  const [image, setImage] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showButtons, setShowButtons] = useState(false);
  const Width = Dimensions.get("screen").width;
  const Height = Dimensions.get("screen").height;
  

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


  useEffect(() => {
    let interval: any;
    if (isAnimating && image.length > 0) {
      interval = setInterval(() => {
        setCurrentIndex((currentIndex + 1) % image.length);
      }, 200); // Change the interval duration as needed
    }

    return () => clearInterval(interval);
  }, [currentIndex, image.length, isAnimating]);

  const handleImagePress = () => {
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

  const img =
    image[currentIndex]?.uri ||
    "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/500px-No-Image-Placeholder.svg.png?20200912122019";

  return (
    <View style={{backgroundColor:"white",backfaceVisibility:"hidden"}}>
      <View style={styles.titleContainer}>
        <MaterialIcons
          name="add-a-photo"
          size={24}
          color="white"
          onPress={open}
          style={styles.title}
        />
        <Fontisto
          name="share"
          size={24}
          color="white"
          onPress={share}
          style={styles.title}
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable onPress={handleImagePress}>
          <LinearGradient
            colors={["rgba(0,0,0,0.5)", "transparent"]}
            style={styles.background}
          />
          <ViewShot ref={ref}>
            <FastImage source={{ uri: img, priority:FastImage.priority.high}} style={{height:Height, width:Width}} resizeMode={FastImage.resizeMode.cover} />
          </ViewShot>
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.backgroundTwo}
          />
        </Pressable>
        {showButtons && (
          <View style={styles.ButtonContainer} transition={{ type: "decay" }}>
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
      </ScrollView>
      <StatusBar style="auto"/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    flex: 1,
  },

  titleContainer: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    top: 50,
    zIndex: 1,
    width: "100%",
  },
  title: {
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 10,
    shadowColor: "rgba(31, 38, 135, 0.37)",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
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
    backgroundColor: "rgba(255, 255, 255, 0.10)",
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: "rgba(31, 38, 135, 0)",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowRadius: 32,
    shadowOpacity: 1,
    elevation: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 60,
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
