import { useDebounceFn } from 'ahooks';
import { Image, ImageBackground } from 'expo-image';
import React, { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { PickPbQueryParams } from '@/src/api/utils';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import { IconContinue } from '@/src/components';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { AnimatedImage } from '@Components/animatedImage';
import UserDisplay from '../others/user-display';
import { PlotChoice } from '@/proto-registry/src/web/raccoon/world/world_pb';

const SPOT_BG_IMG = require('@Assets/image/parallel-world/spot.png');
// const SPOT_BG_IMG = require('@Assets/image/parallel-world/spot.png');

const L3_IMG = 'https://resource.lipuhome.com/app-resource/apng/l3.png';

export default function ContinueCard({
  choice,
  onPressIn
}: {
  choice: PickPbQueryParams<PlotChoice>;
  onPressIn?: (choice: PickPbQueryParams<PlotChoice>) => void;
}) {
  const [pressIn, setPressIn] = useState(false);

  const fnRef = useRef(false);
  const handlePress = () => {
    if (fnRef.current) return;

    fnRef.current = true;
    setPressIn(true);
    onPressIn && onPressIn(choice);
  };

  return (
    <Pressable onPress={handlePress} style={styles.$container}>
      <Image
        source={SPOT_BG_IMG}
        contentFit="contain"
        style={{
          position: 'absolute',
          left: 0,
          right: -10,
          top: 0,
          bottom: 0
          // backgroundColor: 'red'
        }}
      />
      <View
        style={{
          flex: 1,
          // borderWidth: 2,
          flexDirection: 'row',
          paddingVertical: 12,
          paddingHorizontal: 14,
          gap: 8,
          // minHeight: 110,
          borderRadius: 6,
          backgroundColor: 'transparent'
        }}
      >
        <UserDisplay uri={choice.author?.avatar ?? ''} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={styles.$relatedTextArea}>
              <Text style={styles.$relatedText}>{choice.choice}</Text>
            </View>

            <View>
              <IconContinue fill={'#fff'} size={18} />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              gap: 4,
              justifyContent: 'space-between'
            }}
          >
            <Text numberOfLines={1} style={[styles.$subText, { flex: 1 }]}>
              {choice.author?.name}
            </Text>
            <Text
              style={[
                styles.$subText,
                { color: parallelWorldColors.fontGlow, opacity: 1 }
              ]}
            >
              当前世界
            </Text>
          </View>
        </View>
      </View>

      {pressIn && (
        <AnimatedImage
          source={L3_IMG}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          duration={700}
          halfTime={400}
          onFinish={() => {
            setPressIn(false);
          }}
        />
      )}
      <View
        style={{
          position: 'absolute',
          width: 60,
          height: 18,
          borderRadius: 4,
          backgroundColor: 'rgba(255, 106, 59, 1)',
          alignItems: 'center',
          justifyContent: 'center',
          top: -9,
          left: -8
        }}
      >
        <Text style={{ fontSize: 10, fontWeight: '500', color: 'white' }}>
          作者的决策
        </Text>
      </View>
    </Pressable>
  );
}

const styles = createStyle({
  $container: {
    position: 'relative',
    flexDirection: 'row',
    backgroundColor: 'rgba(28, 38, 49, 0.80)',
    borderRadius: 10
  },
  $header: {
    display: 'flex',
    flexDirection: 'row',
    height: 28,
    paddingHorizontal: 6,
    marginBottom: 6,
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  $headerSubSection: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  $userName: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    fontWeight: '400'
  },
  $enterText: {
    opacity: 0.8,
    fontSize: 14,
    fontWeight: '500'
  },
  $subText: {
    color: '#fff',
    opacity: 0.5
  },
  $relatedTextArea: {
    flex: 1
    // backgroundColor: 'rgba(67, 95, 124, 0.2)',
    // paddingVertical: 22,
    // paddingHorizontal: 12,
    // alignItems: 'center',
    // borderBottomRightRadius: 10,
    // borderBottomLeftRadius: 10
  },
  $relatedText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#fff',
    fontFamily: typography.fonts.world
  },
  $hightlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#516d82',
    borderRadius: 5
  }
});
