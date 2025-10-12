import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useStaticStreamText } from '@/src/bizComponents/parallelWorld/_hooks/static-stream-text.hook';
import {
  PREVIOUS,
  VIEWER_CARD_IMG_HEIGHT,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import { IconContinue } from '@/src/components';
import { useScreenSize } from '@/src/hooks';
import { useWorldStore } from '@/src/store/world';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { Image } from '@Components/image';
import { Text } from '@Components/text';
import { ResizeMode, Video } from '@Components/video/BaseVideo';
import { StyleSheet } from '@Utils/StyleSheet';
import ParallelWorldButton from '../others/ParallelWorldButton';
import { PARALLEL_WORLD_BG_VIDEO } from '@BizComponents/parallelWorld/constants';
import { useShallow } from 'zustand/react/shallow';

const extractTextWithHighlight = (text: string) => {
  if (!text) return [];

  // 正则表达式，匹配 <highlight> 标签内外的文本
  const regex =
    /<highlight>([\s\S]*?)<\/highlight>|([\s\S]+?)(?=<highlight>|$)/g;

  const matches = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    // console.log(match);
    if (match[1]) {
      // 如果匹配到了 <highlight> 标签中的内容
      matches.push({ text: match[1], highlight: true });
    } else if (match[2]) {
      // 如果匹配到了非 <highlight> 标签的内容
      matches.push({ text: match[2], highlight: false });
    }
  }

  return matches.reduce(
    (result, item, index) => {
      const { text, highlight } = item;
      const textArr = text.split('\n').map(t => ({ text: t, highlight }));
      return result.concat(textArr);
    },
    [] as { text: string; highlight: boolean }[]
  );
};

const VideoText = ({
  hasPrev,
  videoText,
  onNext
}: {
  hasPrev: boolean;
  videoText: string;
  onNext: (() => void) | undefined;
}) => {
  const classifiedTextList = extractTextWithHighlight(videoText);
  const { streamText } = useStaticStreamText({
    text: classifiedTextList[0]?.text || '',
    interval: !hasPrev
      ? classifiedTextList[0]?.text?.length < 10
        ? 300
        : 150
      : 10,
    onFinish
  });
  const [firstFinish, setFirstFinish] = useState(false);

  return (
    <>
      {classifiedTextList.map((item, index) => {
        return index && !firstFinish ? null : (
          <Animated.Text
            entering={FadeInDown.duration(500).delay(
              (index - 1 < 0 ? 0 : index - 1) * 500
            )}
            key={index}
            style={[
              videoStyles.$text,
              item.highlight ? { color: parallelWorldColors.fontGlow } : {},
              !hasPrev && {
                paddingTop: 150,
                fontSize: 30,
                lineHeight: 40,
                textAlign: 'center',
                fontWeight: '900'
              }
            ]}
          >
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            {!index ? streamText : item.text}
          </Animated.Text>
        );
      })}
    </>
  );

  function onFinish() {
    setFirstFinish(true);
    if (!hasPrev) {
      onNext && onNext();
    }
  }
};

const LoadingCard = ({
  imgHeight,
  onVideoPlayed
}: {
  imgHeight: number;
  onVideoPlayed?: () => void;
}) => {
  const { width } = useScreenSize('screen');
  const imgWidth = width - 48;
  const { currentWorld, placeCardInfo } = useWorldStore(
    useShallow(state => ({
      // videoText: state.currentWorld?.world?.previous || '',
      currentWorld: state.currentWorld,
      placeCardInfo: state.placeCardInfo
    }))
  );
  const foldValue = useSharedValue(0);
  const $animationStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scaleY: foldValue.value
      }
    ]
  }));
  const videoRef = useRef<Video>();
  // const previousState = useState()

  useEffect(() => {
    // 初始化时已经加载完成
    // const { currentWorld } = useWorldStore.getState();
    // foldValue.value =
    //   Platform.OS === 'android' ? 1 : withTiming(1, { duration: 300 });
    foldValue.value = withTiming(1, { duration: 300 });

    // foldValue.value =
    //   Platform.OS === 'android' ? 1 : withTiming(1, { duration: 300 });
    videoRef.current?.playAsync();
    // alert(11111);
    // setTimeout(() => {
    //   videoRef.current.playAsync();
    // });
    return () => {
      videoRef.current?.stopAsync();
    };
  }, []);

  const hasPrev = useMemo(() => {
    return !!(currentWorld && currentWorld.plotIndex);
  }, [currentWorld]);

  const videoText = useMemo(() => {
    if (currentWorld?.world?.previous) {
      return currentWorld?.world?.previous;
    }
    return (
      currentWorld?.getCurrentPlot()?.getCurrentAct()?.act?.actItems?.[0]?.item
        ?.value?.text || ''
    );
  }, [currentWorld]);

  //     useEffect(() => {
  //       if(currentWorld?.plotIndex)
  //   }, [currentWorld]);

  return (
    <Animated.View
      // exiting={FadeOut.duration(500)}
      style={[
        $animationStyle,
        videoStyles.$container,
        {
          backgroundColor: colors.white,
          width: imgWidth + 20,
          height: imgHeight + 150
        }
      ]}
    >
      <View style={[[videoStyles.$textBox]]}>
        <Video
          isMuted
          ref={videoRef}
          url={PARALLEL_WORLD_BG_VIDEO}
          isLooping
          style={[
            StyleSheet.absoluteFill,
            { top: 0, left: 0, bottom: 0, right: 0 }
          ]}
          resizeMode={ResizeMode.COVER}
        />
        {hasPrev ? (
          <Image
            source={PREVIOUS}
            style={{
              width: '100%',
              height: 64,
              marginTop: 24
              // borderWidth: 1
            }}
            contentFit="cover"
          />
        ) : null}

        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            flex: 1
          }}
        >
          <ScrollView>
            <VideoText
              hasPrev={hasPrev}
              videoText={videoText}
              onNext={onVideoPlayed}
            />
            <View style={{ height: 100 }}></View>
          </ScrollView>
        </Animated.View>

        <LinearGradient
          colors={[
            'rgba(23, 29, 38, 1)',
            'rgba(23, 29, 38, 0.8)',
            'rgba(23, 29, 38, 0)'
          ]}
          start={{ x: 1, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            paddingHorizontal: 16,
            alignItems: 'center',
            justifyContent: 'flex-end',
            height: 160,
            paddingBottom: 32,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute'
          }}
        >
          <Animated.View
            entering={FadeIn.delay(500).duration(500)}
            style={{
              borderRadius: 12,
              padding: 2,
              borderWidth: 1,
              borderColor: parallelWorldColors.fontGlow
            }}
          >
            {/* {hasPrev && ( */}
            <ParallelWorldButton
              style={{
                backgroundColor: '#FF6A3B',
                borderRadius: 8,
                width: 256,
                height: 38
              }}
              onPress={onVideoPlayed}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 4,
                  position: 'relative'
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '700',
                    color: colors.white,
                    lineHeight: 18
                  }}
                >
                  {hasPrev ? '进入Ta创建的平行世界' : '开启新世界'}
                </Text>
                <IconContinue fill={'#fff'} size={18} />
              </View>
            </ParallelWorldButton>
            {/* )} */}
          </Animated.View>
        </LinearGradient>
      </View>
    </Animated.View>
  );
};

export { LoadingCard };

const videoStyles = createStyle({
  $container: {
    top: 10,
    overflow: 'hidden',
    position: 'absolute',
    zIndex: 10
  },
  $video: { width: '100%', height: '100%' },
  $textBox: {
    // borderWidth: 1,
    // borderColor: '#fff',
    position: 'absolute',
    with: '100%',
    backgroundColor: 'rgba(23, 29, 38, 1)',
    // height: '100%',
    top: 10,
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 100
  },

  $text: {
    paddingHorizontal: 16,
    fontFamily: typography.fonts.world,
    color: 'white',
    fontSize: 16,
    lineHeight: 26,
    marginBottom: 8
  }
});

const btnStyles = createStyle({
  $btn: {
    position: 'absolute',
    top: VIEWER_CARD_IMG_HEIGHT,
    width: 40,
    height: 40
  },
  $icon: { width: '100%', height: '100%' }
});
