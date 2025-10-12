import { abstractActStoryText } from '.';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Platform,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { ScrollView } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import {
  PREVIOUS,
  VIEWER_CARD_IMG_HEIGHT,
  getGenImgWidthByHeight,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import { IconContinue } from '@/src/components';
import PreloadImg from '@/src/components/emoji/preload-img';
import { usePersistFn } from '@/src/hooks';
import { useWorldStore } from '@/src/store/world';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { log } from '@/src/utils/logger';
import { reportClick } from '@/src/utils/report';
import { Image } from '@Components/image';
import { StyleSheet } from '@Utils/StyleSheet';
import { MaskImages, MaskImagesRef } from '../../../components/MaskImages';
import ParallelWorldButton from '../others/ParallelWorldButton';
import {
  ActDialog,
  ActStory,
  ActType,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { screen } from '@BizComponents/parallelWorld/constants';
import type { PartialMessage } from '@bufbuild/protobuf';
import { ResizeMode, Video } from '@step.ai/expo-av';
import { useShallow } from 'zustand/react/shallow';
import { LoadingCard } from './LoadingCard';
import {
  DialogStreamItem,
  Dialogs,
  DialogsRef,
  StoryStreamItem
} from './StreamTextItem';
import {
  useDisplayMaskCardGesture,
  useDisplayMaskCardVideoInit,
  useImgAnimatedStyle,
  useMaskImageSwitch
} from './display-mask-card.hook';

const BTN_PREV = require('@Assets/image/parallel-world/btn-prev.png');
const BTN_NEXT = require('@Assets/image/parallel-world/btn-next.png');

const MASK_MOUNT_DELAY = Platform.OS === 'ios' ? 0 : 1000;

interface DialogValue {
  value: ActDialog;
  index: number;
}
interface StoryValue {
  value: ActStory;
  index: number;
}

export interface DisplayMaskCardProps {
  // acts: WorldAct[];
  // activeIdx: number;
  plotId: string;
  // onChange: (index: number) => void;
  showLoadVideo: boolean;
  onVideoPlayed?: () => void;
  // videoText?: string;
  // isBtnVisible?: boolean;
  imgHeight: number;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  // onExceed?: () => void;
}

export default function DisplayMaskCard({
  // acts,
  // activeIdx,
  plotId,
  imgHeight = 300,
  // onChange,
  showLoadVideo,
  onVideoPlayed,
  // videoText = '',
  // isBtnVisible = true,
  containerStyle: $containerStyle = {},
  textStyle: $textStyle = {}
  // onExceed
}: DisplayMaskCardProps) {
  // 计算照片宽带
  // const imgWidth = getGenImgWidthByHeight(imgHeight);
  const imgWidth = screen.width - 48;

  const { actIndex, actId, requestWorlding } = useWorldStore(
    useShallow(state => ({
      actIndex: state.actIndex,
      actId: state.actId,
      requestWorlding: state.requestWorlding
    }))
  );
  const [isShowDialogs, setDialogs] = useState(false);

  const currentPlot = useMemo(() => {
    return useWorldStore.getState().currentWorld?.getCurrentPlot();
  }, [plotId]);

  const currentAct = useMemo(() => {
    return currentPlot?.getCurrentAct();
  }, [currentPlot, actId]);

  const actItems = useMemo(() => {
    return currentAct?.getItems() || [];
  }, [currentPlot, currentAct]);

  const allStoryList = useMemo(() => {
    return actItems.filter(item => item.type === ActType.Story);
  }, [actItems]);

  const allDialogList = useMemo(() => {
    return actItems.filter(item => item.type === ActType.Dialog);
  }, [actItems]);

  // 总的story文本数
  const storyText = useMemo(() => {
    return abstractActStoryText(actItems);
  }, [actItems]);

  const story = useMemo(() => {
    return allStoryList[0]
      ? { ...allStoryList[0], text: abstractActStoryText(actItems) }
      : undefined;
  }, [actItems]);

  // useEffect(() => {
  //   if (typeof actId !== 'undefined') {
  //     setDialogs(false);
  //   }
  // }, [actId]);

  const showDialog = useMemo(() => {
    // alert(!!allDialogList.length && !showLoadVideo && isShowDialogs);
    return !!allDialogList.length && !showLoadVideo && isShowDialogs;
  }, [allDialogList, showLoadVideo, isShowDialogs]);

  // 控制流式播放
  const dialogRef = useRef<DialogsRef>(null);

  // 文本展示/收起样式
  const { $textStyle_a, $imgContainerStyle_a, $imgStyle_a } =
    useImgAnimatedStyle({ storyList: allStoryList, imgBasicHeight: imgHeight });

  // 图片切换
  const images = useMemo(() => {
    log.log('currentPlot', currentPlot);
    return (
      currentPlot
        ?.queryImages()
        .map(item => item.imageUrl || '')
        .filter(i => i) || []
    );
  }, [currentPlot]);

  const maskImgRef = useRef<MaskImagesRef>(null);

  const handleNext = useCallback(() => {
    log.log('handleNext', {
      dialogRef: dialogRef.current,
      len: allDialogList.length,
      isShowDialogs: isShowDialogs
    });
    if (dialogRef.current) {
      dialogRef.current?.next();
      // setDialogs(true);
    } else if (isShowDialogs || !allStoryList.length) {
      maskImgRef.current?.next();
      // setDialogs(true);
    } else {
      setDialogs(true);
    }
  }, [isShowDialogs, allStoryList]);

  // 手势处理
  const { composed } = useDisplayMaskCardGesture({
    next: handleNext,
    swipeNext: handleSwipeNext,
    prev: handlePrev,
    swipePrev: handleSwipePrev,
    width: imgWidth
  });

  const $opacity = useSharedValue(1);

  return (
    <>
      <GestureDetector gesture={composed}>
        <View style={[cardStyles.$container, $containerStyle]}>
          <Animated.View
            // exiting={FadeOut.duration(300)}
            style={[
              {
                width: imgWidth - 4,
                height: imgHeight - 4
              },
              cardStyles.$imageContainerBasic,
              $imgContainerStyle_a
            ]}
          >
            <Animated.View
              entering={FadeIn.duration(400)}
              style={[cardStyles.$img, $imgStyle_a]}
            >
              <MaskImages
                ref={maskImgRef}
                sourceList={images}
                onChange={onImageChange}
                onLoaded={() => {
                  $opacity.value = withTiming(0, {
                    duration: 600,
                    easing: Easing.in(Easing.quad)
                  });
                }}
                active={actIndex}
                size={{ width: imgWidth, height: imgHeight }}
              />
            </Animated.View>
            {/* 
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  zIndex: 10,
                  transform: [{ scale: 1.1 }],
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0
                },
                { opacity: $opacity }
              ]}
            >
              <PreloadImg
                url={currentAct?.act?.image?.imageUrl ?? ''}
                size={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            </Animated.View> */}
          </Animated.View>

          <View
            key="cardStyles.$dialogContainerBasic"
            style={[
              cardStyles.$dialogContainerBasic,
              {
                width: imgWidth + 20
              }
            ]}
          >
            {showDialog ? (
              <Dialogs
                ref={dialogRef}
                actId={actId}
                key={actId}
                inEditScreen={false}
                items={allDialogList}
                onNext={() => {
                  maskImgRef.current?.next();
                }}
              />
            ) : null}
          </View>

          <Animated.View
            key="cardStyles.$textContainerBasic"
            style={[cardStyles.$textContainerBasic, $textStyle_a]}
          >
            <View
              style={[
                {
                  width: imgWidth - 4
                },
                cardStyles.$textBox
              ]}
            >
              <ScrollView style={{ height: 100 }}>
                <View style={cardStyles.$text}>
                  {!showLoadVideo && story && (
                    <StoryStreamItem
                      // @ts-ignore
                      // @ts-ignore
                      inEditScreen={false}
                      story={story}
                      stream={true}
                      show={true}
                      onFinish={() => {
                        setDialogs(true);
                      }}
                      textStyle={[
                        {
                          fontSize: storyText.length > 60 ? 13 : 14
                        },
                        $textStyle
                      ]}
                    ></StoryStreamItem>
                  )}
                </View>
              </ScrollView>
            </View>
          </Animated.View>
        </View>
      </GestureDetector>

      {/* {showLoadVideo && ( */}
      {/* <LoadingCard
        imgWidth={imgWidth}
        imgHeight={imgHeight}
        videoText={videoText}
        onVideoPlayed={onVideoPlayed}
      /> */}
      {/* )} */}
      {isShowDialogs && (
        <>
          {actIndex > 0 && (
            <TouchableOpacity
              style={[
                {
                  left: 10
                },
                btnStyles.$btn
              ]}
              onPress={() => {
                handleSwipePrev();
                reportClick('content_page', {
                  module: 'world',
                  interactive_behavior: '4'
                  // todo
                  // content_state: playedList.indexOf(actIndex) < 0 ? 2 : 1
                });
              }}
            >
              <Image style={btnStyles.$icon} source={BTN_PREV} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[
              {
                right: 10
              },
              btnStyles.$btn
            ]}
            // onPress={handleNext}
            onPress={() => {
              handleSwipeNext();
              reportClick('content_page', {
                module: 'world',
                interactive_behavior: '4'
                // todo
                // content_state: playedList.indexOf(actIndex) < 0 ? 2 : 1
              });
            }}
          >
            <Image style={btnStyles.$icon} source={BTN_NEXT} />
          </TouchableOpacity>
        </>
      )}
    </>
  );

  function handleSwipeNext() {
    log.log('handleSwipeNext', {});
    maskImgRef.current?.next();
  }

  function handlePrev() {
    if (
      !useWorldStore.getState().plotIndex &&
      !useWorldStore.getState().actIndex
    ) {
      return;
    }
    log.log('handlePrev', {});
    maskImgRef.current?.prev();
  }

  function handleSwipePrev() {
    if (
      !useWorldStore.getState().plotIndex &&
      !useWorldStore.getState().actIndex
    ) {
      return;
    }
    log.log('handleSwipePrev', {});
    maskImgRef.current?.prev();
  }

  function onImageChange(index: number) {
    if (index <= -1) {
      return;
    }
    log.log('onImageChange', {
      index,
      actIndex: useWorldStore.getState().actIndex
    });
    if (index >= useWorldStore.getState().actIndex) {
      useWorldStore.getState().nextAct();
    } else {
      useWorldStore.getState().prevAct();
      // 前一步
    }
  }
}

const cardStyles = createStyle({
  $container: {
    backgroundColor: colors.white,
    alignItems: 'center',
    paddingTop: 10
  },
  $imageContainerBasic: {
    borderWidth: 2,
    paddingBottom: 0,
    borderColor: 'black',
    position: 'relative',
    overflow: 'hidden'
  },
  $img: {
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  $dialogContainerBasic: {
    position: 'absolute',
    alignItems: 'center',
    gap: 16,
    bottom: 140 + 60
  },
  $dialogBasic: {
    maxWidth: 240,
    gap: 4
  },
  $textContainerBasic: { alignItems: 'stretch', overflow: 'hidden' },
  $textBox: {
    margin: 10,
    borderWidth: 2,
    borderColor: colors.black,
    paddingVertical: 8,
    paddingHorizontal: 12
  },
  $text: {
    minHeight: 100,
    justifyContent: 'center'
  }
});

const getDialogPosition = (index: number): StyleProp<ViewStyle> => {
  return index % 2 === 0
    ? {
        alignItems: 'flex-start',
        alignSelf: 'flex-start',
        marginLeft: -5
      }
    : {
        alignItems: 'flex-end',
        alignSelf: 'flex-end',
        marginRight: -5
      };
};

const btnStyles = createStyle({
  $btn: {
    position: 'absolute',
    top: VIEWER_CARD_IMG_HEIGHT,
    width: 40,
    height: 40
  },
  $icon: { width: '100%', height: '100%' }
});
