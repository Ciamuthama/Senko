import React, { useRef, useEffect } from 'react';
import { Button, Dimensions, StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { Navigator, router } from 'expo-router';

export default function Splash() {
  const animation = useRef(null);
  useEffect(() => {
    // You can control the ref programmatically, rather than using autoPlay
    // animation.current?.play();
  }, []);

  return (
      <LottieView
        autoPlay
        loop={false}
        ref={animation}
        style={{
          width: Dimensions.get("screen").width,
          height: Dimensions.get("window").height,
          backgroundColor: '#eee',
          flex:1,
          }}
          source={require('../assets/images/splash.json')}
          resizeMode="cover"
          onAnimationFinish={()=>router.push("/home")}
          />
     
  );
}

