import * as Haptics from 'expo-haptics';
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef
} from 'react';
import {
  Dimensions,
  Pressable,
  StyleProp,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import {
  VIEWER_CARD_IMG_HEIGHT,
  getGenImgWidthByHeight
} from '@/src/bizComponents/parallelWorld/constants';
import { showToast } from '@/src/components';
import { usePersistFn } from '@/src/hooks';
import { CreateSatus, useWorldStore } from '@/src/store/world';
import Act from '@/src/store/world/models/ActModel';
import { clickEffect } from '@/src/utils/clickeffect';
import { reportClick } from '@/src/utils/report';
import { Image } from '@Components/image';
import { WorldAct } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { useShallow } from 'zustand/react/shallow';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const BTN_PREV = require('@Assets/image/parallel-world/btn-prev.png');
const BTN_NEXT = require('@Assets/image/parallel-world/btn-next.png');

interface SceneViewerProps {
  // acts: (WorldAct | null)[];
  actIndex: number;
  viewerStyle?: StyleProp<ViewStyle>;
  id: string;
  renderItem: (act: Act | null, index: number) => React.ReactNode;
  onIndexChange?: (index: number) => void;
  onSkip?: (index: number) => boolean; // 返回当前章节是否可以直接跳过
  onNext?: (nextIndex: number) => void;
  isNextVisible?: boolean;
  onPrev?: (prevIndex: number) => void;
  isPrevVisible?: boolean;
  onExceed?: () => void;
}

function createActs(len: number, current: Act | null) {
  const acts: (null | Act)[] = [];
  for (let i = 0; i < len; i++) {
    if (current?.act.actIndex === i) {
      acts.push(current);
    } else {
      acts.push(null);
    }
  }
  return acts;
}

const SceneViewer = forwardRef<ICarouselInstance, SceneViewerProps>(
  (
    {
      actIndex,
      id,
      renderItem,
      onIndexChange,
      onSkip,
      onExceed,
      onNext,
      isNextVisible = true,
      onPrev,
      isPrevVisible = true,
      viewerStyle
    },
    ref
  ) => {
    const carouselRef = useRef<ICarouselInstance>(null);

    const { actId, actsLen } = useWorldStore(
      useShallow(state => ({ actId: state.actId, actsLen: state.actsLen }))
    );

    const currentAct = useMemo(() => {
      const act =
        useWorldStore
          .getState()
          .currentWorld?.getCurrentPlot()
          ?.getCurrentAct() || null;
      console.log('currentAct---------', actId, act);
      return act;
    }, [actId]);

    const acts = useMemo(() => {
      console.log('acts rerender', acts);
      return createActs(actsLen, currentAct);
    }, [actsLen, currentAct]);

    // // todo 每次收到消息都rerender  不好 要改
    // const acts = useMemo(() => {
    //   const allActs =
    //     useWorldStore.getState().currentWorld?.getCurrentPlot()?.queryActs() ||
    //     [];
    //   return allActs;
    // }, [actNonce]);

    const handlePrev = usePersistFn(() => {
      // if (useWorldStore.getState().actIndex <= 0) return;

      const index = carouselRef.current?.getCurrentIndex() ?? 0;
      if (!index) {
        showToast('没有上一幕啦~');
        return;
      }
      let newIndx = index;
      if (index > 0) {
        carouselRef.current?.prev();
        newIndx--;
        onIndexChange && onIndexChange(newIndx);
        // onPrev && onPrev(newIndx);
      }
      clickEffect();
      reportClick('new_content_preview', {
        contentid: id,
        new_content_button: 3
      });
    });

    const handleNext = usePersistFn(() => {
      // const worldCreateStatus = useWorldStore.getState().worldCreateStatus;
      if (!currentAct?.act.isFinish && !acts[actIndex + 1]) return;

      const index = carouselRef.current?.getCurrentIndex() ?? 0;
      const currentPlot = useWorldStore
        .getState()
        .currentWorld?.getCurrentPlot();
      // 最后一幕
      if (currentPlot?.checkLastAct()) {
        if (useWorldStore.getState().worldCreateStatus === CreateSatus.done) {
          onExceed && onExceed();
        }
      } else {
        // currentPlot?.nextAct()
        carouselRef.current?.next();
        onIndexChange && onIndexChange(index + 1);
      }

      clickEffect();
      reportClick('new_content_preview', {
        contentid: id,
        new_content_button: 4
      });
    });

    useImperativeHandle(ref, () => carouselRef.current as ICarouselInstance);

    // TODO：后期优化
    useEffect(() => {
      carouselRef.current?.scrollTo({ index: actIndex });
    }, [id]);

    return (
      <>
        <View
          style={[
            {
              paddingTop: 8,
              position: 'relative'
            },
            viewerStyle
          ]}
        >
          <Carousel
            ref={carouselRef}
            width={screenWidth - 40}
            height={VIEWER_CARD_IMG_HEIGHT + 130}
            data={acts}
            scrollAnimationDuration={1000}
            style={{
              justifyContent: 'center',
              width: '100%'
            }}
            enabled={false}
            pagingEnabled={true}
            snapEnabled={false}
            mode="horizontal-stack"
            modeConfig={{
              snapDirection: 'left',
              stackInterval: 0
            }}
            renderItem={({ item: act, index }) => {
              console.log(index, actIndex);
              // if (index === actIndex) {
              return (
                <View style={{ alignItems: 'center' }} key={index}>
                  {renderItem(act, index)}
                </View>
              );
              // }
              // return (
              //   <View style={{ alignItems: 'center' }} key={index}>
              //     {/* {renderItem(act, index)} */}
              //   </View>
              // );
            }}
          />
        </View>
        {/* <Pressable
          onPress={handlePrev}
          style={{
            // opacity: 0.1,
            // backgroundColor: 'red',
            width: '50%',
            height: VIEWER_CARD_IMG_HEIGHT - 60,
            zIndex: 100,
            left: 0,
            position: 'absolute'
          }}
        />
        <Pressable
          onPress={handleNext}
          style={{
            // opacity: 0.1,
            // backgroundColor: 'green',
            width: '50%',
            height: VIEWER_CARD_IMG_HEIGHT - 60,
            right: 0,
            zIndex: 100,
            position: 'absolute'
          }}
        /> */}
        <TouchableOpacity
          style={{
            position: 'absolute',
            left: 10,
            top: VIEWER_CARD_IMG_HEIGHT,
            width: 40,
            height: 40
          }}
          onPress={handlePrev}
        >
          <Image style={{ width: '100%', height: '100%' }} source={BTN_PREV} />
        </TouchableOpacity>
        {isNextVisible && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              right: 10,
              top: VIEWER_CARD_IMG_HEIGHT,
              width: 40,
              height: 40
            }}
            onPress={handleNext}
          >
            <Image
              style={{ width: '100%', height: '100%' }}
              source={BTN_NEXT}
            />
          </TouchableOpacity>
        )}
      </>
    );
  }
);

export default SceneViewer;
