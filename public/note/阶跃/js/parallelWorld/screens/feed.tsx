import { useUnmount } from 'ahooks';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import ChoiceCard from '@/src/bizComponents/parallelWorld/choiceCard/ChoiceCard2';
import ChoiceInputCard from '@/src/bizComponents/parallelWorld/choiceCard/ChoiceInputCard';
import ContinueCard from '@/src/bizComponents/parallelWorld/choiceCard/ContinuCard';
import {
  parallelWorldColors,
  parallelWorldPalette,
  screen
} from '@/src/bizComponents/parallelWorld/constants';
import { FeedInputModal } from '@/src/bizComponents/parallelWorld/feedInputModal';
import GuideLine, {
  GUIDE_LINE_DIR
} from '@/src/bizComponents/parallelWorld/others/GuideLine';
import { Icon, Screen } from '@/src/components';
import { Tag } from '@/src/components/tag';
import { LOGIN_SCENE } from '@/src/constants';
import { useAuthState } from '@/src/hooks';
import { ModalType, useWorldStore } from '@/src/store/world';
import {
  PARALLEL_WORLD_PAGES_ENUM,
  WorldRoute
} from '@/src/store/world/parallel-world';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { log } from '@/src/utils/logger';
import { reportClick, reportExpo } from '@/src/utils/report';
import { AnimatedImage } from '@Components/animatedImage';
import { Image } from '@Components/image';
import { PlotChoice } from '@/proto-registry/src/web/raccoon/world/world_pb';
import { useShallow } from 'zustand/react/shallow';

const TURNING_POINT = require('@Assets/image/parallel-world/turning-point.png');
const L1_IMG = 'https://resource.lipuhome.com/app-resource/apng/l1.png';
const L2_IMG = 'https://resource.lipuhome.com/app-resource/apng/l2.png';

const SPOT_BG_IMG = require('@Assets/image/parallel-world/spot.png');

export default function ParallelWorldFeed({
  routeInfo
}: {
  routeInfo: WorldRoute;
}) {
  // const [isFeedInputVisible, setFeedInputVisible] = useState(false);

  const { loginIntercept } = useAuthState();
  const { plotId, currentWorld, timelinePlots, plotIndex, isFeedInputVisible } =
    useWorldStore(
      useShallow(state => ({
        actIndex: state.actIndex,
        actId: state.actId,
        timelinePlots: state.timelinePlots,
        currentWorld: state.currentWorld,
        plotId: state.plotId,
        plotIndex: state.plotIndex,
        isFeedInputVisible:
          ModalType.FEED_INPUT === state.modalScope && state.modalVisible
      }))
    );

  // choice卡片展示数据
  const choices = useMemo(() => {
    // log.log('currentWorld?.getCurrentPlot()', currentWorld?.getCurrentPlot());
    return (
      currentWorld
        ?.getCurrentPlot()
        ?.getChoice()
        ?.filter(
          item => item.choice !== timelinePlots[plotIndex + 1]?.choice
        ) || []
    );
  }, []);

  // topic
  const topic = useMemo(() => {
    return currentWorld?.world?.topic || '';
  }, [currentWorld]);

  const currentPlot = useMemo(() => {
    return currentWorld?.getCurrentPlot();
  }, [currentWorld, plotId]);

  const nextTlPlot = useMemo(() => {
    // alert(JSON.stringify(currentWorld?.getTlPlot(plotIndex + 1)));
    return timelinePlots[plotIndex + 1];
  }, [timelinePlots, plotIndex]);

  // const preloadNextPlot = async () => {
  //   if (!nextPlot) return;

  //   reportClick('world_choice', {
  //     world_choice_button: 2,
  //     contentid: routeInfo.cardId,
  //     plotId: nextPlot?.plotId
  //   });

  //   await getParallelWorldPlot({ plotId: nextPlot?.plotId });

  //   changeActiveTimelineSectionIdx(activeTimelineSectionIdx + 1);
  //   popWorldRouteStack();
  //   resetFeed();
  // };

  const [tagVisible, setTagVisible] = useState(false);

  const handleShowTag = () => {
    setTimeout(() => {
      setTagVisible(true);
      reportExpo('world_topic', {
        contentid: currentWorld?.world?.originalCardId
      });
    }, 800);
  };

  // 没有下一幕出tag todo
  // useEffect(() => {
  //   if (!nextPlot) {
  //     handleShowTag();
  //   }
  // }, [nextPlot]);

  const handlePressTag = () => {
    reportClick('world_topic', {
      contentid: currentWorld?.world?.originalCardId
    });
    router.push(`/topic/world/${currentWorld?.world?.originalCardId}`);
  };

  const handleBack = () => {
    useWorldStore.getState().popWorldRouteStack();
    // popWorldRouteStack();
    // resetFeed();
    reportClick('world_feed_back', {
      plotId: currentWorld?.getCurrentPlotId(),
      contentid: routeInfo?.cardId ?? ''
    });
  };

  const openInputModal = () => {
    useWorldStore.getState().showModal(ModalType.FEED_INPUT, {});
    // setFeedInputVisible(true);
    // openFeedInputModal();
    reportClick('set_world', {
      plotId: currentWorld?.getCurrentPlotId(),
      contentid: routeInfo?.cardId ?? ''
    });
  };

  const handleCloseInputModal = () => {
    useWorldStore.getState().hideModal();
    reportClick('world_feed_closeInput', {
      plotId: currentWorld?.getCurrentPlotId(),
      contentid: routeInfo?.cardId ?? ''
    });
  };

  useEffect(() => {
    if (currentPlot) {
      reportExpo('world_feed', {
        plotId: currentPlot?.plot.plotId,
        contentid: routeInfo?.cardId ?? ''
      });

      const plotIndex = useWorldStore.getState().plotIndex;
      const nextPlotId = currentWorld?.getTlPlot(plotIndex + 1)?.plotId;

      // 预加载下一个节点的剧情
      if (nextPlotId) {
        useWorldStore.getState().requestPlot(nextPlotId, plotIndex + 1);
      }
    }
  }, [currentPlot]);

  return (
    <>
      <Screen
        headerTitle={() => (
          <View style={styles.$title}>
            <Icon icon="word_line" size={18}></Icon>
            <Text style={styles.$titleText}>平行世界</Text>
          </View>
        )}
        backButton={false}
        headerLeft={() => (
          <Pressable onPress={handleBack} style={styles.$close}>
            <Icon icon="close2" />
          </Pressable>
        )}
        headerStyle={{ zIndex: 10 }}
        screenStyle={[
          styles.$screen,
          { opacity: isFeedInputVisible ? 0.1 : 1 }
        ]}
        theme="dark"
      >
        <LinearGradient
          colors={['rgba(22, 28, 38, 1)', 'rgba(22, 28, 38, 0)']}
          start={{ x: 1, y: 0.8 }}
          end={{ x: 1, y: 1 }}
          style={styles.$headerMask}
        ></LinearGradient>
        <Animated.View
          entering={FadeIn.duration(500)}
          // exiting={FadeOut.duration(500)}
          style={{
            height: screen.height - 160,
            paddingTop: 20,
            paddingBottom: 30,
            justifyContent: 'center'
          }}
        >
          <View style={{ gap: 12, width: '100%' }}>
            <View
              style={{
                paddingVertical: 12,
                width: '100%',
                position: 'relative',
                backgroundColor: 'white'
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  gap: 12,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  alignItems: 'center'
                }}
              >
                <GuideLine
                  count={10}
                  isFadeIn={false}
                  size={{ width: 24, height: 12 }}
                  fade={0.1}
                  dir={GUIDE_LINE_DIR.RIGHT}
                />
                <Text
                  style={{
                    color: '#000',
                    fontSize: 18,
                    textAlign: 'center',
                    maxWidth: screen.width - 160,
                    fontFamily: typography.fonts.world,
                    fontWeight: '400'
                  }}
                  numberOfLines={2}
                >
                  {currentPlot?.plot?.choicePoint?.trim() || '面对选择...'}
                </Text>
                <View style={{ opacity: 0 }}>
                  <GuideLine
                    count={10}
                    isFadeIn={true}
                    size={{ width: 24, height: 12 }}
                    fade={0.15}
                    dir={GUIDE_LINE_DIR.RIGHT}
                  />
                </View>
              </View>
              <Image
                source={SPOT_BG_IMG}
                contentFit="contain"
                style={{
                  position: 'absolute',
                  left: 100,
                  right: 0,
                  top: 0,
                  bottom: 0
                  // backgroundColor: 'red'
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: -80,
                  paddingLeft: 10,
                  width: '100%'
                }}
              >
                <Image
                  style={{ width: '40%', height: 160 }}
                  contentFit="contain"
                  source={TURNING_POINT}
                />
              </View>
            </View>
            <View
              style={{
                paddingVertical: 18,
                paddingHorizontal: 18,
                alignItems: 'center',
                gap: 18
              }}
            >
              {nextTlPlot && (
                <ContinueCard
                  choice={{
                    choice: nextTlPlot?.choice ?? '',
                    plotId: nextTlPlot?.plotId ?? '',
                    cardId: nextTlPlot?.cardId ?? '',
                    author: nextTlPlot?.author,
                    worldNum: '',
                    isAi: false
                  }}
                  onPressIn={onNextPlot}
                  // onContinue={continueNextPlot}
                />
              )}
              {!(choices.length > 0 && nextTlPlot) && (
                <GuideLine
                  count={2}
                  size={{ width: 24, height: 12 }}
                  fade={0.4}
                  dir={GUIDE_LINE_DIR.DOWN}
                />
              )}
            </View>
          </View>
          {choices.length > 0 && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingVertical: 12,
                  gap: 12,
                  paddingHorizontal: 18
                }}
              >
                <View
                  style={{
                    height: 1,
                    backgroundColor: parallelWorldColors.bgGlow,
                    flex: 1
                  }}
                ></View>
                <Text
                  style={{
                    color: parallelWorldColors.fontGlow,
                    fontSize: 14,
                    fontFamily: typography.fonts.world,
                    fontWeight: '400'
                  }}
                >{`${choices?.length || 0}人做了另外的决策`}</Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: parallelWorldColors.bgGlow,
                    flex: 1
                  }}
                ></View>
              </View>
              <FlatList
                data={choices}
                renderItem={({ item, index }) => (
                  <ChoiceCard
                    color={
                      parallelWorldPalette[index % parallelWorldPalette.length]
                    }
                    choice={item}
                    onPressIn={preloadWorldInfo}
                  />
                )}
                keyExtractor={item => item.cardId}
                style={[styles.$scroll]}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
              />
            </>
          )}
          <View
            style={{
              paddingHorizontal: 18
            }}
          >
            <ChoiceInputCard
              onInput={() => {
                loginIntercept(openInputModal, {
                  scene: LOGIN_SCENE.TO_CREATE
                });

                reportClick('world_feed', {
                  plotId: plotId ?? '',
                  contentid: routeInfo?.cardId ?? '',
                  world_feed_button: 1
                });
              }}
            />
            {!nextTlPlot && topic ? (
              <View
                style={{
                  height: 60,
                  width: '100%',
                  position: 'relative'
                }}
              >
                <Tag
                  visible={tagVisible}
                  style={{
                    // right: 0,
                    position: 'absolute',
                    top: 20,
                    left: '50%',
                    right: 10
                  }}
                  text={topic}
                  onPress={handlePressTag}
                />
              </View>
            ) : null}
          </View>
        </Animated.View>

        <AnimatedImage
          source={L1_IMG}
          style={styles.$l1Style}
          duration={2000}
        />
        <AnimatedImage
          source={L2_IMG}
          style={styles.$l2Style}
          duration={2000}
        />
      </Screen>
      {/* 创建世界线 */}
      {isFeedInputVisible && (
        <FeedInputModal
          onClose={handleCloseInputModal}
          isVisible={isFeedInputVisible}
        />
      )}
    </>
  );

  function onNextPlot() {
    const { plotIndex, timelinePlots } = useWorldStore.getState();

    if (plotIndex >= timelinePlots.length - 1) return;
    const nextPlot = timelinePlots[plotIndex + 1];
    if (!nextPlot) return;

    reportClick('world_choice', {
      world_choice_button: 2,
      contentid: routeInfo.cardId,
      plotId: nextPlot?.plotId
    });

    useWorldStore.getState().nextPlot();
    useWorldStore.getState().popWorldRouteStack();
    // await getParallelWorldPlot({ plotId: nextPlot?.plotId });

    // changeActiveTimelineSectionIdx(activeTimelineSectionIdx + 1);
    // popWorldRouteStack();
    // resetFeed();
  }

  // 进入下一个世界 todo
  async function preloadWorldInfo(d: PlotChoice) {
    if (!d.cardId) return;
    useWorldStore.getState().initWorld(d.cardId, { refreshTimeline: true });
    useWorldStore.getState().pushWorldRouteStack({
      route: PARALLEL_WORLD_PAGES_ENUM.MAIN,
      cardId: d.cardId
    });
    reportClick('world_feed', {
      // plotId: currentPlot?.plotId, // todo
      contentid: routeInfo?.cardId ?? '',
      next_contentid: d.cardId,
      world_feed_button: 3,
      world_contentid: d.cardId
    });
  }
}

const styles = createStyle({
  $screen: {
    position: 'relative',
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 18,
    width: '100%'
  },
  $title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  $titleText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  $close: { width: 100, alignItems: 'flex-start' },
  $headerMask: {
    position: 'absolute',
    height: 200,
    top: -200,
    width: '100%',
    zIndex: 1
  },
  $scroll: {
    paddingHorizontal: 18,
    position: 'relative',
    flexGrow: 0,
    paddingBottom: 24
  },
  $l1Style: {
    position: 'absolute',
    width: 87.5,
    height: 150,
    top: 0,
    left: 10,
    zIndex: 2
  },
  $l2Style: {
    position: 'absolute',
    width: 87.5,
    height: 150,
    bottom: 30,
    right: 30,
    zIndex: 2
  }
});
