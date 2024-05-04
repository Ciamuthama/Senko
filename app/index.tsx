import { useState, useEffect, useReducer } from "react";
import {
  Button,
  Text,
  SafeAreaView,
  View,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  Image
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import AutoScrolling from "../wrapper/autoscroll";
import { AnimatePresence,  } from "moti";

export default function App() {
  const [albums, setAlbums] = useState(null);
  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  async function getAlbums() {
    if (permissionResponse?.status !== "granted") {
      const permissionResult = await requestPermission();
      if (permissionResult.status !== "granted") {
        return; // User did not grant permission, so return early
      }
    }
    const fetchedAlbums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    });
    setAlbums(fetchedAlbums);
  }
  return (
    <SafeAreaView style={styles.container}>
      <Button onPress={getAlbums} title="Get albums" />
      <ScrollView style={{ flex: 1 }}>
        {albums &&
          albums.map((album, index) => (
            <AlbumEntry album={album} key={index} />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function AlbumEntry({ album }) {
  const [assets, setAssets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    async function getAlbumAssets() {
      const albumAssets = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        album,
      });
      setAssets(albumAssets.assets);
    }
    getAlbumAssets();
  }, [album]);

  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setCurrentIndex((currentIndex + 1) % assets.length);
      }, 130); // Change the interval duration as needed
    }

    return () => clearInterval(interval);
  }, [currentIndex, assets.length, isAnimating]);

  const handleImagePress = () => {
    setIsAnimating(!isAnimating);
  };

  return (
    <View key={album.id} style={styles.albumContainer}>
      <Text>
        {album.title} - {album.assetCount ?? "no"} assets
      </Text>
      <View style={styles.albumAssetsContainer}>
        {assets.length > 0 && (
          <Pressable onPress={handleImagePress}>
            <Image
              source={{ uri: assets[currentIndex]?.uri }}
              style={styles.image}
            />
           <Text>{assets[currentIndex].filename}</Text>
           <Button title="Next" onPress={()=> console.log(assets[currentIndex + 1]?.filename)} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 8,
    justifyContent: "center",
    marginHorizontal: 1,
    ...Platform.select({
      android: {
        paddingTop: 40,
      },
    }),
  },
  albumContainer: {
    marginBottom: 12,
    gap: 4,
  },
  albumAssetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  image: {
    width: 500,
    height: 750,
  },
});
