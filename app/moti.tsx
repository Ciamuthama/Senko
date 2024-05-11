/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { LayoutAnimation, Platform, Text, UIManager } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { ScrollView } from 'react-native';
import { View } from 'react-native';
import { Dimensions } from 'react-native';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native';
import { StyleSheet } from 'react-native';
import AlbumsList from 'react-native-album-list'



export default function App() {
  const [album,setAlbum] = React.useState([])
  AlbumsList.getImageList({
    title: true,
    name: false,
    size: true,
    description: true,
    location: false,
    date: true,
    orientation: true,
    type: false,
    album: true,
    dimensions: false
  }).then(list => console.log(setAlbum(list)));

  return (
    <View style={style.container}>
      <Text>text {album}</Text>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    flex: 1,
  },
  title: {
    fontWeight: '900',
    fontSize: 24,
    paddingVertical: 24,
    fontFamily: 'Avenir',
    color: '#cdac81',
    textAlign: 'center',
  },
  buttonOpen: {
    margin: 24,
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    width:48,
  },
  textOpen: {
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
});