import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { AnimatedImage } from '@/src/components/animatedImage';
import { useScreenSize } from '@/src/hooks';
import { StyleSheet } from '@Utils/StyleSheet';
import TransparentVideo from '@step.ai/react-native-transparent-video';

const st = StyleSheet.create({
  $container: {
    position: 'relative'
  },
  $l61: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    height: 188
  },
  $l62: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 280,
    height: 188
  },
  $l63: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 280,
    height: 188
  },
  $l64: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 280,
    height: 188
  }
});

const L5 = 'https://resource.lipuhome.com/app-resource/apng/l5.png';
// const L61 = require('@Assets/mp4/parallel-world/L6_1.mp4');
// const L62 = require('@Assets/mp4/parallel-world/L6_2.mp4');
// const L63 = require('@Assets/mp4/parallel-world/L6_3.mp4');
// const L64 = require('@Assets/mp4/parallel-world/L6_4.mp4');

// const L61 = require('@Assets/apng/l6_1.png');
// const L62 = require('@Assets/apng/l6_2.png');
// const L63 = require('@Assets/apng/l6_3.png');
// const L64 = require('@Assets/apng/l6_4.png');

export default function Lightning() {
  const { width } = useScreenSize('window');
  // const video1Ref = useRef();
  // const video2Ref = useRef();
  // const video3Ref = useRef();
  // const video4Ref = useRef();

  // useEffect(() => {
  //   video1Ref.current?.play();
  //   const timer1 = setTimeout(() => {
  //     video2Ref.current?.play();
  //   }, 500);

  //   const timer2 = setTimeout(() => {
  //     video3Ref.current?.play();
  //   }, 1000);

  //   const timer3 = setTimeout(() => {
  //     video4Ref.current?.play();
  //   }, 1500);

  //   return () => {
  //     clearTimeout(timer1);
  //     clearTimeout(timer2);
  //     clearTimeout(timer3);
  //     video1Ref.current?.stop();
  //     video2Ref.current?.stop();
  //     video3Ref.current?.stop();
  //     video4Ref.current?.stop();
  //   };
  // }, []);
  return (
    <View style={{ position: 'absolute', flex: 1 }}>
      <View
        style={[
          st.$container,
          {
            width: width,
            height: 0.75 * width
          }
        ]}
      >
        <AnimatedImage
          source={L5}
          style={StyleSheet.absoluteFill}
          duration={1000}
        ></AnimatedImage>

        {/* <View style={StyleSheet.absoluteFill}>
          <TransparentVideo
            ref={video1Ref}
            source={L61}
            loop={true}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={StyleSheet.absoluteFill}>
          <TransparentVideo
            ref={video2Ref}
            source={L62}
            loop={true}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={StyleSheet.absoluteFill}>
          <TransparentVideo
            ref={video3Ref}
            source={L63}
            loop={true}
            style={StyleSheet.absoluteFill}
          />
        </View>
        <View style={StyleSheet.absoluteFill}>
          <TransparentVideo
            ref={video4Ref}
            source={L64}
            loop={true}
            style={StyleSheet.absoluteFill}
          />
        </View> */}

        {/* <AnimatedImage
          source={L61}
          style={st.$l61}
          delay={1500}
          duration={400}
          loop
          resizeMode="contain"
        ></AnimatedImage>
        <AnimatedImage
          source={L62}
          style={st.$l62}
          delay={2500}
          duration={400}
          loop
          resizeMode="contain"
        ></AnimatedImage>
        <AnimatedImage
          source={L63}
          style={st.$l63}
          delay={3500}
          duration={400}
          loop
          resizeMode="contain"
        ></AnimatedImage>
        <AnimatedImage
          source={L64}
          style={st.$l64}
          delay={5500}
          duration={400}
          loop
          resizeMode="contain"
        ></AnimatedImage> */}
      </View>
    </View>
  );
}
