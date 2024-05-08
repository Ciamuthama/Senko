import { useState, useEffect, useReducer, useRef } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Platform,
  Pressable,
  Image,
  Share,
  View,
  TouchableOpacity,
  ScrollViewComponent,
  Dimensions,
  StatusBar,
  ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as MediaLibrary from "expo-media-library";
import { Text} from "moti";
import {Skeleton } from "moti/skeleton"
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { captureRef } from "react-native-view-shot";


export default function App() {
  const [albums, setAlbums] = useState(null);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
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

  const handleAlbumSelect = (album) => {
    setSelectedAlbum(album);
  };
  const Width = Dimensions.get("screen").width;
  const Height = Dimensions.get("screen").height;
  return (
     
    <View style={styles.container}>
        <Feather
        name="menu"
        size={24}
        color="white"
        onPress={getAlbums}
        style={styles.MenuContainer}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{justifyContent:"center"}} style={{position:"absolute",zIndex:10,top:45,flexDirection:"column",marginHorizontal:10,height:20,overflow:"scroll"}}>
        {albums &&
          albums.map((album, index) => (
            <Pressable key={index}  onPress={() => handleAlbumSelect(album)}>
              <Text transition={{type:"spring"}}
       style={{fontSize:15,color:"white"}}>{album.title}</Text>
            </Pressable>
          ))}
      </ScrollView>
      {selectedAlbum && <AlbumEntry album={selectedAlbum} />}
      <Skeleton width={Width} height={Height} colors={["#ababab","#C68E7B","#00D6B3","#66D1FF"]}/>
      <StatusBar barStyle={"light-content"} />
    </View>
   
  );
}

function AlbumEntry({ album }) {
  const [assets, setAssets] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  const Height = Dimensions.get("screen").height;
  const Width = Dimensions.get("screen").width;

  useEffect(() => {
    async function getAlbumAssets() {
      const albumAssets = await MediaLibrary.getAssetsAsync({
        album,
      });
      setAssets(albumAssets.assets);
      if (albumAssets.assets.length > 0) {
        setCurrentIndex(0);
      }
    }
    getAlbumAssets();
  }, [album]);

  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setCurrentIndex((currentIndex + 1) % assets.length);
      }, 135); // Change the interval duration as needed
    }

    return () => clearInterval(interval);
  }, [currentIndex, assets.length, isAnimating]);

  const handleImagePress = () => {
    setIsAnimating(!isAnimating);
  };

  const ref = useRef(null);
  const imageShare = assets[currentIndex]?.uri;

  const onShare = async () => {
    try {
      const uri = await captureRef(ref, {
        format: "jpg",
        quality: 1,
      });
      await Share.share({ url: uri });
    } catch (e) {
      console.log(e);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((currentIndex - 1 + assets.length) % assets.length);
  };

  const handleNext = () => {
    setCurrentIndex((currentIndex + 1) % assets.length);
  };

  return (
    <View key={album.id} style={styles.albumContainer}>
      <View style={styles.albumAssetsContainer}>
        {assets.length > 0 && (
        <ImageBackground source={{uri:imageShare}} resizeMode="cover" style={{flex:1}}>
          <ViewShot ref={ref}>
            <Pressable onPress={handleImagePress}>
              <LinearGradient
                colors={["rgba(0,0,0,0.5)", "transparent"]}
                style={styles.background}
              />

              <Image
                source={{ uri: imageShare }}
                height={Height}
                width={Width}
                style={styles.image}
                />

              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.5)"]}
                style={styles.backgroundTwo}
                />
            </Pressable>
          </ViewShot>
                </ImageBackground>
        )}
        <SafeAreaView style={styles.ButtonContainer}>
          <MaterialIcons
            name="navigate-before"
            size={24}
            color="white"
            onPress={handlePrevious}
          />
          <Ionicons name="share" color={"white"} size={24} onPress={onShare} />
          <MaterialIcons
            name="navigate-next"
            size={24}
            color="white"
            onPress={handleNext}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 500,
    zIndex:100
  },
  backgroundTwo:{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 500,
    zIndex:100
  },
  MenuContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: 40,
    right: 5,
    zIndex: 1,
  },
  albumContainer: {
    gap: 4,
    position: "relative",
  },
  albumAssetsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    position: "relative",
  },
  image: {
    position: "relative",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dialContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  ButtonContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    bottom: 60,
    zIndex: 1,
    paddingHorizontal:10,
    width: "100%",
  },
  TextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    position: "absolute",
    paddingHorizontal: 10,
    bottom: 50,
    zIndex: 1,
  },
});
