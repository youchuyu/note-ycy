import { useMemoizedFn, useRequest } from 'ahooks';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Easing, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInRight,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { BottomBar } from '@/src/bizComponents/parallelWorld/bottomBar';
import { VIEWER_CARD_IMG_HEIGHT } from '@/src/bizComponents/parallelWorld/constants';
import { LoadingCard } from '@/src/bizComponents/parallelWorld/genCard/LoadingCard';
import DisplayMaskCard from '@/src/bizComponents/parallelWorld/genCard/MaskCard';
import StaticCard from '@/src/bizComponents/parallelWorld/genCard/StaticCard';
import {
  HeaderLeft,
  HeaderRight
} from '@/src/bizComponents/parallelWorld/header';
import Timeline from '@/src/bizComponents/parallelWorld/timeline';
import { hideLoading, showLoading, showToast } from '@/src/components';
import { AnimatedImage } from '@/src/components/animatedImage';
import { selectState } from '@/src/store/_utils';
import { useDetailStore } from '@/src/store/detail';
import { useResourceStore } from '@/src/store/resource';
import { useWorldStore } from '@/src/store/world';
import {
  PARALLEL_WORLD_PAGES_ENUM,
  WorldRoute,
  useParallelWorldStore
} from '@/src/store/world/parallel-world';
import { GameType } from '@/src/types';
import { createStyle } from '@/src/utils';
import { getRemoteAssets } from '@/src/utils/getRemoteAssets';
import { safeGoBack } from '@/src/utils/safeGoBack';
import { Screen } from '@Components/screen';
import { StyleSheet } from '@Utils/StyleSheet';
import { InteractionBottom } from '@BizComponents/parallelWorld/interaction';
// import { useReset } from './_hooks/reset.hook';
import { PortalHost } from '@gorhom/portal';
import TransparentVideo from '@step.ai/react-native-transparent-video';
import { useShallow } from 'zustand/react/shallow';
import { useInputStore } from '@/src/store/input';

const L8 = getRemoteAssets('mp4/parallel-world/L8.mp4');

export const getEnterText = (authorName: string) =>
  `你正在进入【${authorName}】创建的平行世界章节`;

export default function ParallelWorldMain({
  routeInfo
}: {
  routeInfo: WorldRoute;
}) {
  const { currentWorld, plotIndex, requestWorlding, prevd } = useWorldStore(
    useShallow(state => ({
      currentWorld: state.currentWorld,
      plotIndex: state.plotIndex,
      prevd: state.prevd,
      requestWorlding: state.requestWorlding
    }))
  );

  const { showCommentInput } = useLocalSearchParams<{
    showCommentInput: string,
  }>();


  const currentPlotId = useMemo(() => {
    return currentWorld?.getCurrentPlotId();
  }, [currentWorld, plotIndex]);

  const getVideoResource = useResourceStore.getState().getVideoResource;

  const navigation = useNavigation();
  // const [isInitAnimationPlay, toggleIsInitAnimationPlay] = useState(true);

  useEffect(() => {
    // if (useWorldStore.getState().prevd) {
    //   toggleIsInitAnimationPlay(false);
    // }
  }, []);

  // useEffect(() => {
  //   alert(`prevd${prevd}`);
  // }, [prevd]);
  // 初始化卡片信息
  useEffect(() => {
    if (routeInfo.cardId) {
      // useWorldStore.getState().initWorld(routeInfo.cardId);

      const { getDetail, requestDetail } = useDetailStore.getState();

      if (!getDetail(routeInfo.cardId as string)?.loading) {
        requestDetail({
          cardId: routeInfo.cardId as string,
          gameType: GameType.WORLD
        });
      }
    }
  }, [routeInfo]);

  useEffect(() => { 
    if (!requestWorlding && showCommentInput) { 
      useWorldStore.getState().setPrevd(true);
    }
  }, [requestWorlding, showCommentInput]);

  // useEffect(() => {
  //   if (currentWorld && !currentWorld?.plotIndex) {
  //     // toggleIsInitAnimationPlay(false);
  //     // useWorldStore.getState().setPrevd(true);
  //   }
  // }, [currentWorld]);

  return (
    <>
      <Screen
        theme="dark"
        onBack={handleBack}
        screenStyle={[styles.$screen]}
        headerLeft={() => <HeaderLeft detailId={routeInfo?.cardId ?? ''} />}
        headerRight={() => <HeaderRight detailId={routeInfo?.cardId ?? ''} />}
      >
        <View style={[styles.$content]}>
          <View style={styles.$bg}>
            <StaticCard
              imageUrl=""
              imgHeight={VIEWER_CARD_IMG_HEIGHT}
              textNode={<View style={{ height: 54 }}></View>}
            />
          </View>
          {currentPlotId ? (
            <DisplayMaskCard
              key={currentPlotId}
              plotId={currentPlotId}
              showLoadVideo={!prevd}
              imgHeight={VIEWER_CARD_IMG_HEIGHT}
            />
          ) : null}
          {!prevd && (
            <LoadingCard
              imgHeight={VIEWER_CARD_IMG_HEIGHT}
              onVideoPlayed={() => {
                if (useWorldStore.getState().requestWorlding) {
                  showToast('世界加载中');
                  return;
                }
                useWorldStore.getState().setPrevd(true);
                // toggleIsInitAnimationPlay(false);
                // useWorldStore.getState().setPrevd(true);
              }}
            />
          )}
          {currentPlotId && prevd ? (
            <Timeline key={currentPlotId + 'timeline'} />
          ) : null}
          {currentPlotId && prevd ? (
            <BottomBar
              renderRight={() => {
                return <InteractionBottom detailId={routeInfo?.cardId ?? ''} />;
              }}
            />
          ) : null}
        </View>
        {currentPlotId && (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, styles.$bgLightning]}
          >
            <TransparentVideo
              source={getVideoResource(L8)}
              loop={false}
              style={StyleSheet.absoluteFill}
            />
          </View>
        )}
      </Screen>
      {/* <TimelineBottom
        visible={!!worldInfo?.worldId && !isInitAnimationPlay}
        sections={timeline}
        active={activeTimelineSectionIdx}
        onActive={handlePlotChange}
        barRight={<InteractionBottom detailId={routeInfo?.cardId ?? ''} />}
      /> */}
      <PortalHost name={`CommentPortalHost_${routeInfo?.cardId ?? ''}`} />
    </>
  );

  function handleBack() {
    safeGoBack();
    // const { worldRouteStack, popWorldRouteStack, updateActIndex } =
    //   useWorldStore.getState();
    // if (worldRouteStack.length > 1) {
    //   // resetMain();
    //   popWorldRouteStack();
    //   updateActIndex(0);
    // } else {
    //   // 退出当前卡片
    //   // resetWorld();
    //   navigation.goBack();
    // }
  }
}

const styles = createStyle({
  $screen: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 18,
    width: '100%'
  },
  $content: {
    position: 'relative',
    paddingTop: 10,
    height: '100%',
    alignItems: 'center'
  },
  $bg: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
    top: 24,
    transform: [{ rotate: '5deg' }, { scale: 1.05 }]
  },
  $bgLightning: {
    position: 'absolute',
    top: -40,
    left: 10,
    right: 10,
    height: VIEWER_CARD_IMG_HEIGHT + 250,
    zIndex: 1001
  }
});
