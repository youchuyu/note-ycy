import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { publishParallelWorld } from '@/src/api/parallel-world/publish';
import CoverChangeModal from '@/src/bizComponents/parallelWorld/_components/cover-change-modal';
import {
  VIEWER_CARD_IMG_HEIGHT,
  getGenImgHeightByWidth,
  parallelWorldColors,
  screen
} from '@/src/bizComponents/parallelWorld/constants';
import {
  REVIEW_ERR_ENUM,
  toastErr
} from '@/src/bizComponents/parallelWorld/errorMsg';
import StaticCard from '@/src/bizComponents/parallelWorld/genCard/StaticCard';
// import { getGenImgHeightByWidth } from './_components/gen-card';
import ChangeImgButton from '@/src/bizComponents/parallelWorld/genCard/change-img-button';
import { glowLineStyle } from '@/src/bizComponents/parallelWorld/others/AIPressableInput';
import LiHelp, {
  CHOICE_LOADING_TIP
} from '@/src/bizComponents/parallelWorld/others/LiHelp';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import {
  Icon,
  Screen,
  hideLoading,
  showLoading,
  showToast
} from '@/src/components';
import {
  AfterPublishToastEnum,
  afterPublishToastPrioritizer
} from '@/src/components/popup/prioritize';
import { useChangeRoute } from '@/src/hooks/useChangeRoute';
import { selectState } from '@/src/store/_utils';
import { FOLD_STATUS_ENUM, useWorldStore } from '@/src/store/world';
import { useParallelWorldPublishStore } from '@/src/store/world/parallel-world-publish';
import { colors, typography } from '@/src/theme';
import { $flexHCenter } from '@/src/theme/variable';
import { GameType, TabItemType } from '@/src/types';
import { createStyle } from '@/src/utils';
import { log } from '@/src/utils/logger';
import {
  addCommonReportParams,
  reportClick,
  reportExpo
} from '@/src/utils/report';
import { ReportError, errorReport } from '@Utils/error-log';
// import { useReset } from './_hooks/reset.hook';
import {
  ActImage,
  DrawType
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { TimelinePlot } from '@/proto-registry/src/web/raccoon/world/world_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import { useShallow } from 'zustand/react/shallow';

const { width: screenW, height: screenH } = Dimensions.get('window');

const imgW = screenW - 162;

const PUBLISH_SUCCESS_DELAY = 500;

const CARD_HEIGHT = VIEWER_CARD_IMG_HEIGHT + 40;

const findBreakPoint = (
  timeline: TimelinePlot[],
  newTimeLine: TimelinePlot[]
): number => {
  let breakPoint = 0;
  const l = Math.max(timeline.length, newTimeLine.length);
  for (let i = 0; i < l; i++) {
    if (timeline[i]?.plotId !== newTimeLine[i]?.plotId) {
      breakPoint = i;
      break;
    }
  }

  return breakPoint;
};

const AnimatedMask = Animated.createAnimatedComponent(Pressable);

export default function ParallelWorldPublish() {
  const { go2HomePage } = useChangeRoute();

  const currentWorld = useMemo(() => {
    return useWorldStore.getState().currentWorld;
  }, []);

  const allActsImages = useMemo(() => {
    return currentWorld?.getCurrentPlot()?.queryImages() || [];
  }, []);

  const {
    openChangeCoverModal,
    isCreatingTitle,
    changeTitle,
    createTitle,
    changeCoverImg,
    coverImg,
    title
  } = useParallelWorldPublishStore(
    useShallow(state =>
      selectState(state, [
        'openChangeCoverModal',
        'coverImg',
        'isCreatingTitle',
        'changeTitle',
        'changeCoverImg',
        'createTitle',
        'title'
      ])
    )
  );

  // const { resetWorld } = useReset();

  const inputRef = React.useRef<TextInput>(null);

  const $isFocused = useSharedValue<boolean>(false);

  // const [coverImg, changeCoverImg] = useState<PartialMessage<ActImage>>();

  const handleTileChange = (text: string) => {
    if (text === CHOICE_LOADING_TIP || isCreatingTitle) return;
    changeTitle(text);
  };

  const handleInputFocus = () => {
    $isFocused.value = true;
    reportClick('release_button', {
      clicktype: 0
    });
  };

  const handleInputBlur = () => {
    $isFocused.value = false;
    inputRef.current?.blur();
  };

  const $maskStyle_A = useAnimatedStyle(() => {
    return {
      zIndex: $isFocused.value ? 1 : -1,
      opacity: withTiming($isFocused.value ? 1 : 0)
    };
  });

  const handleCreateTitle = () => {
    const cardId = useWorldStore.getState().currentWorld?.cardId || '';
    createTitle({ cardId });
    reportClick('release_button', {
      clicktype: 1
    });
  };

  const handleBack = () => {
    useWorldStore.getState().popWorldRouteStack();
  };

  const handlePublish = async () => {
    handleInputBlur();

    const { currentWorld, worlds } = useWorldStore.getState();
    const refCardId = currentWorld?.refCardId;
    let refWorld = null;
    if (refCardId) {
      refWorld = worlds.get(refCardId);
    } else {
      log.log('handlePublish_refCardId', {});
      showToast('发布失败，请重试~');
      return;
    }
    const timeline = refWorld?.world?.timelinePlots;
    const newTimeLine = currentWorld?.world?.timelinePlots;
    if (!timeline || !newTimeLine) {
      log.log('handlePublish_error', { timeline, newTimeLine });
      showToast('发布失败，请重试~');
      return;
    }
    const breakPoint = findBreakPoint(timeline, newTimeLine);
    const refPlot = newTimeLine.slice(0, breakPoint);
    const createPlotId = newTimeLine.slice(breakPoint);

    const payload = {
      imageId: coverImg?.imageId as string,
      title: title,
      cardId: currentWorld?.cardId as string,
      refPlotId: refPlot.map(s => s?.plotId),
      createPlotId: createPlotId.map(s => s?.plotId)
    };

    console.log(payload);

    log.log('handlePublish', {
      payload,
      timeline: timeline.map(i => i.plotId),
      newTimeLine: newTimeLine.map(i => i.plotId)
    });

    reportClick('release_button', {
      clicktype: 3
    });

    try {
      showLoading();
      await publishParallelWorld(payload);
      hideLoading();

      afterPublishToastPrioritizer(showToast, AfterPublishToastEnum.publishEnd)(
        '发布成功',
        PUBLISH_SUCCESS_DELAY + 100
      );
      useWorldStore.getState().switchPageFoldStatus(FOLD_STATUS_ENUM.FOLD);

      reportExpo('publish_success', {
        module: 'publish',
        clicktype: 3,
        game_type: GameType.WORLD
      });

      reportExpo(
        'release_button',
        {
          clicktype: 3
        },
        'success'
      );

      setTimeout(() => {
        go2HomePage({
          tab: TabItemType.HOME,
          appendId: currentWorld?.cardId ?? ''
        });
        // resetWorld();
      }, PUBLISH_SUCCESS_DELAY);
    } catch (e) {
      toastErr(e, REVIEW_ERR_ENUM.TITLE);
      // showToast('发布失败');
      errorReport('publish', ReportError.PUBLISH, e);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    if (allActsImages) {
      const defaultImg =
        allActsImages.find(img => img.drawType === DrawType.Scene) ??
        allActsImages[0];
      changeCoverImg(defaultImg);
    }
    reportExpo('release', {
      contentod: currentWorld?.cardId
    });
    addCommonReportParams('world', {
      received_release: 1
    });
    return () => {
      changeTitle('');
    };
  }, []);

  return (
    <>
      <Screen
        headerTitle={() => (
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: '600' }}
          >
            发布内容
          </Text>
        )}
        screenStyle={screenStyles.$screen}
        KeyboardAvoidingViewProps={{ behavior: 'height' }}
        backButton={false}
        headerLeft={() => (
          <Pressable onPress={handleBack} style={screenStyles.$headerLeft}>
            <Icon icon="back_pw" />
            <Text style={screenStyles.$backText}>返回</Text>
          </Pressable>
        )}
        headerRight={() => <View style={screenStyles.$headerRight} />}
        theme="dark"
      >
        <View style={cardStyles.$container}>
          <StaticCard
            imageUrl={coverImg?.imageUrl ?? ''}
            imgHeight={VIEWER_CARD_IMG_HEIGHT - 80}
            textNode={
              <View style={cardStyles.$cardTextBox}>
                <Icon icon="pw_black" size={16}></Icon>
                <Text style={cardStyles.$cardText}>
                  {`${currentWorld?.world?.worldNum}号平行世界`}
                </Text>
              </View>
            }
          />
          <View style={cardStyles.$btnBox}>
            <ChangeImgButton
              title="编辑封面"
              onImgRegenerate={() => {
                openChangeCoverModal();
                reportClick('release_button', {
                  clicktype: 2
                });
              }}
            />
          </View>
        </View>

        <View style={inputStyles.$container}>
          <View style={inputStyles.$help}>
            <LiHelp onPress={handleCreateTitle} disabled={isCreatingTitle} />
          </View>

          <View style={inputStyles.$inputBox}>
            <TextInput
              allowFontScaling={false}
              ref={inputRef}
              style={inputStyles.$input}
              onChangeText={handleTileChange}
              value={title}
              returnKeyType="send"
              placeholder="请输入标题..."
              onSubmitEditing={handlePublish}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              selectionColor={parallelWorldColors.fontGlow}
              placeholderTextColor="rgba(127, 217, 255, 0.6)"
              returnKeyLabel="发布"
              enablesReturnKeyAutomatically
              maxLength={20}
            />
            <Text
              style={inputStyles.$inputCount}
            >{`字数(${title.length}/20)`}</Text>
          </View>
        </View>
        <View style={publishBtnStyles.$container}>
          <View style={publishBtnStyles.$outline}>
            <ParallelWorldButton
              style={publishBtnStyles.$btn}
              disabled={!title || isCreatingTitle}
              onPress={handlePublish}
            >
              <View style={publishBtnStyles.$textBox}>
                <Text style={publishBtnStyles.$text}>发布到社区</Text>
                <Icon icon="publish_pw" size={16} />
              </View>
            </ParallelWorldButton>
          </View>
        </View>
        <AnimatedMask
          style={[$maskStyle_A, inputStyles.$mask]}
          onPress={handleInputBlur}
        />
      </Screen>
      <CoverChangeModal />
    </>
  );
}

const screenStyles = createStyle({
  $screen: {
    backgroundColor: 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 18,
    width: '100%'
  },
  $headerLeft: { ...$flexHCenter },
  $backText: {
    color: colors.white,
    fontSize: 14
  },
  $headerRight: { width: 80 }
});

const cardStyles = createStyle({
  $container: {
    alignItems: 'center',
    gap: 48,
    paddingHorizontal: 18,
    paddingTop: 12,
    height: '100%'
  },
  $cardTextBox: {
    ...$flexHCenter,
    gap: 4,
    justifyContent: 'flex-end'
  },
  $cardText: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: typography.fonts.world
  },
  $btnBox: {
    ...$flexHCenter,
    position: 'absolute',
    top: getGenImgHeightByWidth(imgW)
  }
});

const inputStyles = createStyle({
  $container: {
    position: 'absolute',
    bottom:
      Platform.OS === 'android'
        ? screenH - CARD_HEIGHT - 160
        : screenH - CARD_HEIGHT - 220,
    width: '100%',
    gap: 8,
    paddingHorizontal: 14,
    zIndex: 100
  },
  $help: {
    ...$flexHCenter,
    flexDirection: 'row-reverse',
    paddingHorizontal: 10
  },
  $inputBox: {
    ...$flexHCenter,
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    flex: 1,
    borderWidth: 2,
    ...glowLineStyle.$border
  },
  $input: {
    flex: 1,
    fontWeight: '400',
    fontSize: 16,
    marginTop: -2,
    color: parallelWorldColors.fontGlow,
    fontFamily: typography.fonts.world
  },
  $inputCount: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.4,
    lineHeight: 24
  },
  $mask: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  }
});

const publishBtnStyles = createStyle({
  $container: {
    paddingHorizontal: 18,
    alignItems: 'center',
    position: 'absolute',
    zIndex: 100,
    width: '100%',
    top: screen.height - 200
  },
  $outline: {
    borderRadius: 21,
    padding: 2,
    borderWidth: 1,
    borderColor: parallelWorldColors.fontGlow
  },
  $btn: {
    backgroundColor: '#FF6A3B',
    borderRadius: 19,
    width: 196,
    height: 38
  },
  $textBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4
  },
  $text: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    lineHeight: 18
  }
});
