import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import { AppState, Platform, Text, View } from 'react-native';
// import { ImageBackground } from 'react-native';
// import { ImageBackground } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { SharedElement } from 'react-navigation-shared-element';
import {
  PARALLEL_WORLD_BG,
  PARALLEL_WORLD_BG_VIDEO
} from '@/src/bizComponents/parallelWorld/constants';
import CountdownLoading from '@/src/bizComponents/parallelWorld/loading/countdown-loading';
import ParallelWorldConsumer from '@/src/bizComponents/parallelWorld/screens/consumer';
import ParallelWorldFeed from '@/src/bizComponents/parallelWorld/screens/feed';
import ParallelWorldMain from '@/src/bizComponents/parallelWorld/screens/main';
import ParallelWorldPublish from '@/src/bizComponents/parallelWorld/screens/publish';
import { Image } from '@/src/components';
import AudioPlayer from '@/src/components/audioPlayer';
import { audioControl } from '@/src/components/audioPlayer/control';
import { PagePerformance } from '@/src/components/common/pagePerformance';
import { useGameFeatureGate } from '@/src/hooks/useGameFeatureGate';
import { usePreload } from '@/src/hooks/usePreload';
// import { Video, VideoHandle } from '@/src/components/video';
import { useStorageStore } from '@/src/store/storage';
import { CreateSatus, useWorldStore } from '@/src/store/world';
import {
  FOLD_STATUS_ENUM,
  PARALLEL_WORLD_PAGES_ENUM,
  WorldRoute
} from '@/src/store/world/parallel-world';
import { GameType } from '@/src/types';
import { createStyle } from '@/src/utils';
import { getRemoteAssets } from '@/src/utils/getRemoteAssets';
import { log } from '@/src/utils/logger';
import { reportExpo } from '@/src/utils/report';
import { Video } from '@Components/video/BaseVideo';
import { useShallow } from 'zustand/react/shallow';

export const FOLD_DUR = 400;

const renderParallelPage = (
  page: PARALLEL_WORLD_PAGES_ENUM,
  route: WorldRoute
) => {
  // log.log('renderParallelPage', { page, route });
  switch (page) {
    case PARALLEL_WORLD_PAGES_ENUM.MAIN:
      return <ParallelWorldMain key={route.cardId} routeInfo={route} />;
    case PARALLEL_WORLD_PAGES_ENUM.FEED:
      return <ParallelWorldFeed key={route.cardId} routeInfo={route} />;
    case PARALLEL_WORLD_PAGES_ENUM.CONSUMER:
      return <ParallelWorldConsumer key={route.cardId} routeInfo={route} />;
    case PARALLEL_WORLD_PAGES_ENUM.PUBLISH:
      return <ParallelWorldPublish key={route.cardId} />;
    default:
      return <ParallelWorldMain routeInfo={route} />;
  }
};

export default function World() {
  const {
    worldCreateStatus,
    worldRouteStack,
    actId,
    currentWorld,
    pageFoldStatus,
    switchPageFoldStatus,
    worldMusic
  } = useWorldStore(
    useShallow(state => ({
      switchPageFoldStatus: state.switchPageFoldStatus,
      worldCreateStatus: state.worldCreateStatus,
      worldRouteStack: state.worldRouteStack,
      actId: state.actId,
      currentWorld: state.currentWorld,
      pageFoldStatus: state.pageFoldStatus,
      worldMusic: state.config.worldMusic
    }))
  );

  usePreload({
    images: [
      'https://resource.lipuhome.com/app-resource/apng/l1.png',
      'https://resource.lipuhome.com/app-resource/apng/l2.png',
      'https://resource.lipuhome.com/app-resource/apng/l3.png',
      'https://resource.lipuhome.com/app-resource/apng/l4.png',
      'https://resource.lipuhome.com/app-resource/apng/l5.png',
      'https://resource.lipuhome.com/app-resource/apng/l7.png',
      'https://resource.lipuhome.com/app-resource/apng/l8.png'
    ],
    videos: [
      getRemoteAssets('mp4/parallel-world/L8.mp4'),
      getRemoteAssets('mp4/parallel-world/loading-img.mp4'),
      getRemoteAssets('mp4/parallel-world/pure-loading.mp4'),
      getRemoteAssets('mp4/parallel-world/entry.mp4'),
      getRemoteAssets('mp4/role-loading.mp4')
    ]
  });

  const curRoute = useMemo(() => {
    return worldRouteStack[worldRouteStack.length - 1];
  }, [worldRouteStack]);

  const isParallelWorldLoading = useMemo(() => {
    if ([CreateSatus.creating, CreateSatus.world].includes(worldCreateStatus)) {
      return true;
    }
    return false;
  }, [worldCreateStatus]);

  const $screenDisplayRatio = useSharedValue(1);

  const $screenFoldStyle_A = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: $screenDisplayRatio.value }]
    };
  });

  const bgmRef = useRef<AudioPlayer>();
  const currentBgmUrl = useRef('');

  const appState = useRef(AppState.currentState);

  const { id } = useLocalSearchParams();

  const { enableDetail } = useGameFeatureGate();

  useFocusEffect(
    useCallback(() => {
      playBgm(currentWorld?.world?.bgmUrl);
      return () => {
        bgmRef.current?.stop();
        currentBgmUrl.current = '';
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      useWorldStore.getState().initWorld(id as string);
      // resetWorld();
      // 初始化
      useWorldStore.getState().pushWorldRouteStack({
        route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
        cardId: id as string
      });
      // getPlotTags();
      reportExpo(
        'content_page',
        {
          contentid: id
        },
        true
      );

      // const { getDetail, requestDetail } = useDetailStore.getState();

      // if (!getDetail(id as string)?.loading) {
      //   requestDetail({
      //     cardId: id as string,
      //     gameType: GameType.WORLD
      //   });
      // }
    }, [id])
  );

  useEffect(() => {
    if (pageFoldStatus === FOLD_STATUS_ENUM.FOLD) {
      $screenDisplayRatio.value = withTiming(0, { duration: FOLD_DUR });
    } else if (pageFoldStatus === FOLD_STATUS_ENUM.UNFOLD) {
      $screenDisplayRatio.value = withTiming(1, { duration: FOLD_DUR });
    } else if (pageFoldStatus === FOLD_STATUS_ENUM.FOLD_2_UNFOLD) {
      $screenDisplayRatio.value = withSequence(
        withTiming(0, { duration: 0 }),
        withDelay(
          FOLD_DUR / 2,
          withTiming(1, { duration: FOLD_DUR }, isFinished => {
            if (isFinished) {
              runOnJS(switchPageFoldStatus)(FOLD_STATUS_ENUM.UNFOLD);
            }
          })
        )
      );
    }
  }, [pageFoldStatus]);

  useEffect(() => {
    const { worldAudio, worldMusic } = useStorageStore.getState();
    useWorldStore.getState().setConfig({
      worldAudio,
      worldMusic
    });
    useWorldStore.getState().setPrevd(false);

    const handleChange = async (nextAppState: any) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        useWorldStore.getState().initWorld(id as string);
        // resetWorld();
        // 初始化
        useWorldStore.getState().pushWorldRouteStack({
          route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
          cardId: id as string
        });
      }
    };

    const subscription = AppState.addEventListener('change', handleChange);

    return () => {
      useWorldStore.getState().reset();
      // useWorldStore.getState().setPrevd(false);
      bgmRef.current?.stop();
      videoRef.current?.stopAsync();
      audioControl.clear();
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    if (worldMusic === false) {
      bgmRef.current?.stop();
      // currentBgmUrl.current = '';
    } else {
      const currentWorldUrl =
        useWorldStore.getState().currentWorld?.world?.bgmUrl;
      if (currentBgmUrl.current && !currentWorldUrl) {
        playBgm(currentBgmUrl.current, true);
      } else {
        currentBgmUrl.current = '';
        playBgm(currentWorldUrl);
      }
    }
  }, [worldMusic]);

  useEffect(() => {
    playBgm(currentWorld?.world?.bgmUrl);
  }, [currentWorld]);

  // useEffect(() => {
  //   // alert(actId);
  //   const act = currentWorld?.getCurrentPlot()?.getCurrentAct();
  //   // 有bgm 加载出来了 播放
  //   console.log('actId--------', actId, JSON.stringify(act));
  // }, [actId]);

  const videoRef = useRef<Video>(null);

  useEffect(() => {
    // videoRef.current?.show();
    if (isParallelWorldLoading) {
      videoRef.current?.playAsync();
    } else {
      videoRef.current?.stopAsync();
    }
  }, [isParallelWorldLoading]);

  useEffect(() => {
    if (!enableDetail.includes(GameType.WORLD)) {
      router.replace('/fallback/');
    }
  }, [enableDetail]);

  // TODO
  // useEffect(() => {
  //   return () => {
  //     // resetWorld();
  //   };
  // }, []);

  return (
    <PagePerformance pathname="parallel-world/[id]">
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {curRoute?.route && !isParallelWorldLoading && (
          <Animated.View style={[{ flex: 1 }, $screenFoldStyle_A]}>
            {renderParallelPage(curRoute?.route, curRoute)}
          </Animated.View>
        )}
        {isParallelWorldLoading && (
          <View style={[styles.$absoluteFull, styles.$loadingBox]}>
            <CountdownLoading />
          </View>
        )}
        <View style={[styles.$absoluteFull, styles.$bgVideo]}>
          <Video ref={videoRef} url={PARALLEL_WORLD_BG_VIDEO} />
        </View>
        <Image
          cache
          source={PARALLEL_WORLD_BG}
          contentFit="cover"
          style={[styles.$absoluteFull, styles.$bgImg]}
        />
      </View>
    </PagePerformance>
  );

  function playBgm(url?: string, force?: boolean) {
    if (!url) return;
    if (!useWorldStore.getState().config.worldMusic) {
      return;
    }
    if (
      currentBgmUrl.current &&
      currentWorld?.world?.bgmUrl !== currentBgmUrl.current &&
      !force
    ) {
      bgmRef.current?.stop();
      log.log('playBGm', {
        currentBgmUrl: currentBgmUrl.current,
        bgmUrl: currentWorld?.world?.bgmUrl
      });
      // currentBgmUrl.current = '';
    }
    if (!force && currentBgmUrl.current) {
      return;
    }
    bgmRef.current = new AudioPlayer({
      scope: 'background',
      volume: 0.1,
      loop: true,
      onPlay: () => {
        console.log('[play background]');
      },
      onStop: () => {
        console.log('[stop background]');
      },
      onError: () => {
        console.log('[err background]');
      }
    });
    bgmRef.current?.play([url]);
    currentBgmUrl.current = url;
  }
}

const styles = createStyle({
  $absoluteFull: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  },
  $loadingBox: {
    // top: 0,
    // bottom: 0,
    // left: 0,
    // right: 0,
    position: 'absolute',
    alignContent: 'center',
    paddingBottom: 120,
    justifyContent: 'center'
  },
  $bgVideo: {
    position: 'absolute',
    flex: 1,
    zIndex: -1
  },
  $bgImg: {
    position: 'absolute',
    // borderColor: 'red',
    flex: 1,
    zIndex: -2
  }
});
