import { useMemoizedFn } from 'ahooks';
import { cloneDeep } from 'lodash';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import { ImgGenModal } from '@/src/bizComponents/parallelWorld/ImgGenModal';
import ConsumerHeaderLeft from '@/src/bizComponents/parallelWorld/_components/consumer-tool-bar/header-left';
import ConsumerHeaderRight from '@/src/bizComponents/parallelWorld/_components/consumer-tool-bar/header-right';
import {
  VIEWER_CARD_IMG_HEIGHT,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import GenCard from '@/src/bizComponents/parallelWorld/genCard';
import StaticCard from '@/src/bizComponents/parallelWorld/genCard/StaticCard';
import NextChapterModal, {
  showNextChapterModal
} from '@/src/bizComponents/parallelWorld/nextChapterModal';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import SceneViewer from '@/src/bizComponents/parallelWorld/sceneViewer';
import { Screen } from '@/src/components';
import { showToast } from '@/src/components';
import { usePersistFn } from '@/src/hooks';
import { selectState } from '@/src/store/_utils';
import { CreateSatus, ModalType, useWorldStore } from '@/src/store/world';
import Act from '@/src/store/world/models/ActModel';
import {
  PARALLEL_WORLD_PAGES_ENUM,
  WorldRoute,
  useParallelWorldStore
} from '@/src/store/world/parallel-world';
import {
  PLOT_CREATE_STATUS_ENUM,
  useParallelWorldConsumerStore
} from '@/src/store/world/parallel-world-consumer';
import { colors, typography } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { log } from '@/src/utils/logger';
import { reportClick, reportExpo } from '@/src/utils/report';
import { Icon } from '@Components/icons';
import { Text } from '@Components/text';
import { WorldAct } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { BottomBar } from '@BizComponents/parallelWorld/bottomBar';
import { TextEditModal } from '@BizComponents/parallelWorld/textEditModal';
import Timeline from '@BizComponents/parallelWorld/timeline';
import { useShallow } from 'zustand/react/shallow';

export default function ParallelWorldConsumer({
  routeInfo
}: {
  routeInfo: WorldRoute;
}) {
  const {
    currentWorld,
    actIndex,
    worldCreateStatus,
    isNextChapterModalVisible,
    isTextEditVisible
  } = useWorldStore(
    useShallow(state => ({
      currentWorld: state.currentWorld,
      actIndex: state.actIndex,
      worldCreateStatus: state.worldCreateStatus,
      isNextChapterModalVisible: state.checkModalVisible(
        ModalType.NEXT_CHAPTER
      ),
      isTextEditVisible: state.checkModalVisible(ModalType.TEXT_EDIT)
    }))
  );

  const [isImgGenModalVisible, setImgGenModalVisible] = useState(false);
  const [isGenCardEditable, toggleIsGenCardEditable] = useState(false);
  // const [isNextChapterModalVisible, setNextChapterModalVisible] =
  //   useState(false);

  const { isPlotFinished, isTimelineVisible, canExceed } = useMemo(() => {
    const isPlotFinished =
      worldCreateStatus === (CreateSatus.done || CreateSatus.init);
    const isTimelineVisible = isPlotFinished && !isGenCardEditable;
    const canExceed = isPlotFinished && !isGenCardEditable;
    return { isPlotFinished, isTimelineVisible, canExceed };
  }, [worldCreateStatus, isGenCardEditable]);

  // todo 处理图片生成
  const handleImgRegenerate = usePersistFn((act: Act | null) => {
    setImgGenModalVisible(true);
    // changeImgGenAct(act);
    //   const generatingId = Object.keys(genImgMap).find(
    //     key => genImgMap[key].isLoading
    //   );
    //   if (generatingId && generatingId !== act?.actId) {
    //     showToast('有其他图片生成中，请稍后...');
    //     return;
    //   }
    // if (act) {
    //   setImgGenModalVisible(true);
    //     changeImgGenAct(act);
    //   }
  });

  const worldNum = useMemo(() => {
    return String(currentWorld?.world?.worldNum ?? '');
  }, [currentWorld]);

  const currentPlotId = useMemo(() => {
    return currentWorld?.getCurrentPlotId();
  }, [currentWorld]);

  const handleExceed = useMemoizedFn(async () => {
    if (!canExceed) {
      return;
    }

    showNextChapterModal({});

    // setNextChapterModalVisible(true);

    // if (currentWorld?.checkLastPlot()) {
    //   setNextChapterModalVisible(true);
    // } else {
    //   currentWorld?.nextPlot();
    // }
  });

  useEffect(() => {
    reportExpo('new_content_preview', {
      contentid: currentWorld?.cardId
    });
    useWorldStore.getState().updateActIndex(0);
  }, []);

  // useEffect(() => {
  //   if (actIndex >= 0) {
  //     viewerRef.current?.scrollTo({ index: actIndex });
  //   }
  // }, [newTimeLine[activeTimelineSectionIdx]?.plotId ?? '']);

  const renderGenCard = useMemoizedFn((act: Act | null, index: number) =>
    act ? (
      <GenCard
        key={act?.act.actId ?? index}
        isInView={actIndex === index}
        imgHeight={VIEWER_CARD_IMG_HEIGHT}
        act={act}
        onImgRegenerate={handleImgRegenerate}
      />
    ) : null
  );

  // useEffect(() => {
  //   if (routeInfo?.cardId !== newWorld?.cardId) {
  //     initNewWorldInfo({ cardId: routeInfo?.cardId ?? '' });
  //   }
  // }, [routeInfo]);

  return (
    <>
      <Screen
        headerTitle={() =>
          !isPlotFinished && <LoadingHeader worldNum={worldNum} />
        }
        screenStyle={[
          styles.$screen,
          { opacity: isNextChapterModalVisible ? 0 : 1 }
        ]}
        theme="dark"
        backButton={false}
        headerLeft={() => <ConsumerHeaderLeft />}
        // headerRight={() => isPlotFinished && <ConsumerHeaderRight />}
      >
        {/* <View style={bgCardStyles.$card}>
            <StaticCard
              imageUrl=""
              imgHeight={VIEWER_CARD_IMG_HEIGHT}
              textNode={<View style={{ height: 54 }}></View>}
            />
          </View> */}
        <SceneViewer
          actIndex={actIndex}
          key={currentPlotId}
          id={currentPlotId || ''}
          // isPrevVisible={actIndex !== 0}
          onIndexChange={changeActIndex}
          onExceed={handleExceed}
          renderItem={renderGenCard}
        />

        {currentPlotId ? <Timeline key={currentPlotId + 'timeline'} /> : null}
        {currentPlotId ? (
          <BottomBar
            renderRight={() => {
              if (worldCreateStatus !== CreateSatus.done) {
                return;
              }
              return (
                <ParallelWorldButton
                  onPress={() => {
                    const { pushWorldRouteStack, currentWorld } =
                      useWorldStore.getState();
                    // switchParallelWorldPage(PARALLEL_WORLD_PAGES_ENUM.PUBLISH);
                    pushWorldRouteStack({
                      route: PARALLEL_WORLD_PAGES_ENUM.PUBLISH
                    });

                    reportClick('world_editing', {
                      contentid: currentWorld?.cardId,
                      new_content_button: 6
                    });
                  }}
                  style={timelineStyles.$button}
                >
                  <Text style={timelineStyles.$text}>先写到这里</Text>
                  <Icon icon="publish_pw" size={16} />
                </ParallelWorldButton>
              );
            }}
          />
        ) : null}
      </Screen>

      {isTextEditVisible && <TextEditModal />}
      {isNextChapterModalVisible && <NextChapterModal />}

      {isImgGenModalVisible && (
        <ImgGenModal
          onClose={() => {
            setImgGenModalVisible(false);
          }}
        />
      )}
    </>
  );

  function changeActIndex(index: number) {
    const { nextAct, prevAct, actIndex } = useWorldStore.getState();
    log.log('changeActIndex', { index, actIndex });
    if (index > actIndex) {
      nextAct();
    } else {
      if (!actIndex) return;
      prevAct();
    }
  }
}

const styles = createStyle({
  $screen: {
    backgroundColor: 'transparent',
    alignItems: 'stretch',
    paddingVertical: 18,
    position: 'relative',
    width: '100%'
  }
});

const timelineStyles = createStyle({
  $button: {
    height: 40,
    borderRadius: 20,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.white
  },
  $text: {
    marginRight: 4,
    fontWeight: '500',
    fontSize: 16,
    color: 'white'
  }
});

const bgCardStyles = createStyle({
  $card: {
    position: 'absolute',
    zIndex: -1,
    opacity: 0.2,
    left: 0,
    right: 0,
    alignItems: 'center',
    top: 24,
    transform: [{ rotate: '5deg' }, { scale: 1.05 }]
  }
});

const LoadingHeader = ({ worldNum }: { worldNum: string }) => (
  <View
    style={{
      height: '100%',
      alignItems: 'center',
      flexDirection: 'row'
    }}
  >
    <Text
      style={{
        fontFamily: typography.fonts.world,
        fontSize: 18,
        color: 'white'
      }}
    >
      你正在创建
    </Text>
    <Text
      style={{
        paddingHorizontal: 2,
        color: parallelWorldColors.fontGlow,
        fontSize: 18,
        fontFamily: typography.fonts.world
      }}
    >{`第${worldNum}号`}</Text>
    <Text
      style={{
        fontFamily: typography.fonts.world,
        fontSize: 18,
        color: 'white'
      }}
    >
      平行世界
    </Text>
  </View>
);
