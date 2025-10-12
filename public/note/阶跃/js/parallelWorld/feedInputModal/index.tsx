import { useEffect, useRef, useState } from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View
} from 'react-native';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import { IconContinue, showToast } from '@/src/components';
import { AnimatedImage } from '@/src/components/animatedImage';
import { selectState } from '@/src/store/_utils';
import { useAuthStore } from '@/src/store/authInfo';
import { useWorldStore } from '@/src/store/world';
import { useParallelWorldFeedStore } from '@/src/store/world/parallel-world-feed';
import { colors, rowStyle, typography } from '@/src/theme';
import { $flexHBetween } from '@/src/theme/variable';
import { isIos } from '@/src/utils';
import { catchErrorLog } from '@/src/utils/error-log';
import { reportClick, reportExpo } from '@/src/utils/report';
import { Modal } from '@Components/modal';
import { StyleSheet, createStyle } from '@Utils/StyleSheet';
import { REVIEW_ERR_ENUM, showErr } from '../errorMsg';
import LiHelp, { CHOICE_FAIL_TIP, CHOICE_LOADING_TIP } from '../others/LiHelp';
import ParallelWorldButton from '../others/ParallelWorldButton';
import LinearGradientCard from '../others/linear-gradient-card';
import UserDisplay from '../others/user-display';
import { PlotTag } from '@step.ai/proto-gen/raccoon/world/common_pb';
import { useShallow } from 'zustand/react/shallow';
import useFeedInputModal from './hook';
import KeywordLabel from './keywordLabel';

const KEYWORDS_BG = require('@Assets/image/parallel-world/keywords-bg.png');

const MAX_INPUT_LENGTH = 60;

const SAME_WORLD_LINE_TIP = '检测到完全相同的世界线，正在进入...';
const SAME_WORLD_LINE_DELAY = 500;

const L4_IMG = 'https://resource.lipuhome.com/app-resource/apng/l4.png';

const CreateButton = ({
  onPress,
  disabled = false
}: {
  onPress: () => void;
  disabled?: boolean;
}) => (
  <View
    style={{
      position: 'relative',
      ...rowStyle,
      justifyContent: 'center',
      opacity: disabled ? 0.6 : 1
    }}
  >
    <View
      style={{
        borderRadius: 12,
        padding: 2,
        borderWidth: 1,
        borderColor: parallelWorldColors.fontGlow
      }}
    >
      <ParallelWorldButton
        style={{
          backgroundColor: '#FF6A3B',
          borderRadius: 8,
          width: 256,
          height: 38
        }}
        disabled={disabled}
        onPress={onPress}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
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
            开启新世界线
          </Text>
          <View style={{ position: 'absolute', right: -20 }}>
            <IconContinue fill={colors.white} size={18} />
          </View>
        </View>
      </ParallelWorldButton>
    </View>
  </View>
);

const FeedInputModal = ({
  isVisible,
  onClose
}: {
  isVisible: boolean;
  onClose: () => void;
}) => {
  const { plotTags, currentWorld, selectedPlotTag, globalLoading } =
    useWorldStore(
      useShallow(state => ({
        plotTags: state.plotTags,
        currentWorld: state.currentWorld,
        selectedPlotTag: state.selectedPlotTag,
        globalLoading: state.globalLoading
      }))
    );

  // const { isCreatingChoice } = useParallelWorldFeedStore(
  //   useShallow(state => ({
  //     isCreatingChoice: state.isCreatingChoice
  //   }))
  // );
  const [choiceText, changeChoiceText] = useState('');

  const userAvatar = useAuthStore(state => state.userInfo?.avatar);

  const inputRef = useRef<TextInput>(null);

  const { createWorld } = useFeedInputModal({
    currentWorld,
    selectedPlotTag,
    choiceText
  });

  // TODO:研究一下为什么
  const handleFocus = () => {
    if (Platform.OS === 'android') {
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      setTimeout(() => inputRef.current?.focus());
    }
  };

  const handleChange = (text: string) => {
    if (text === CHOICE_LOADING_TIP || globalLoading) return;
    changeChoiceText(text);
  };

  const handleClose = () => {
    if (choiceText === CHOICE_FAIL_TIP || choiceText === CHOICE_LOADING_TIP) {
      useWorldStore.getState().changeLoading(false);
      changeChoiceText('');
    }
    onClose();
  };

  useEffect(() => {
    if (!selectedPlotTag) {
      if (plotTags?.[0]) {
        useWorldStore.getState().selectPlotTag(plotTags?.[0]);
      }
    }
    reportExpo('world_set_world', { contentid: currentWorld?.cardId });
  }, [isVisible]);

  return (
    <Modal visible={isVisible} onRequestClose={handleClose} transparent>
      <KeyboardAvoidingView
        behavior={isIos ? 'height' : undefined}
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 100
          }
        ]}
      >
        <View style={styles.$modal}>
          <View onTouchStart={handleClose} style={styles.$placeholder}></View>
          <View style={styles.$inputContainer}>
            {/* <View style={{ padding: 12 }}> */}
            <ImageBackground
              style={styles.$keywordsContainer}
              source={KEYWORDS_BG}
            >
              {plotTags?.map((tag, index) => (
                <KeywordLabel
                  tag={tag}
                  key={tag.code}
                  isActive={selectedPlotTag?.code === tag.code}
                  onPress={() => {
                    // 不支持非选中状态
                    // setActive(index);
                    useWorldStore.getState().selectPlotTag(tag);

                    const tagMap = [3, 4, 7];
                    reportClick('world_set_world', {
                      contentid: currentWorld?.cardId,
                      set_world_button: tagMap[index]
                    });
                  }}
                />
              ))}
            </ImageBackground>
            <LinearGradientCard
              style={styles.$inputWrap}
              innerStyle={{ gap: 12 }}
            >
              <View style={styles.$inputHeader}>
                <UserDisplay text="你" uri={userAvatar} />
                <LiHelp onPress={onLiHelp} disabled={globalLoading} />
              </View>
              <TextInput
                allowFontScaling={false}
                ref={inputRef}
                style={styles.$input}
                value={choiceText}
                placeholder="我也来做决策..."
                selectionColor={parallelWorldColors.fontGlow}
                placeholderTextColor="rgba(127, 217, 255, 0.6)"
                onLayout={handleFocus}
                onChangeText={handleChange}
                onKeyPress={({ nativeEvent: { key } }) => {
                  if (
                    key !== 'Backspace' &&
                    choiceText.length > MAX_INPUT_LENGTH
                  ) {
                    showToast('文字已达到上限60字');
                  }
                }}
                onSubmitEditing={handleCreateWorld}
                multiline
                maxLength={60}
                enablesReturnKeyAutomatically
              />
              <CreateButton
                onPress={handleCreateWorld}
                disabled={
                  !choiceText || globalLoading || choiceText === CHOICE_FAIL_TIP
                }
              />
            </LinearGradientCard>
            {/* </View> */}

            <AnimatedImage
              style={[
                {
                  position: 'absolute',
                  top: '-5%',
                  left: '-5%',
                  width: '110%',
                  height: '110%'
                }
              ]}
              source={L4_IMG}
              duration={500}
            ></AnimatedImage>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );

  function handleCreateWorld() {
    if (useWorldStore.getState().globalLoading) return;
    // handleClose();
    createWorld().catch(e => {
      showErr(e, REVIEW_ERR_ENUM.WORLD_CREATE);
      // 失败回退
      catchErrorLog('handleCreateWorld', e);
      // useWorldStore.getState().popWorldRouteStack();
    });
  }

  // async function createWorld() {
  //   handleClose();

  //   const prePlotId = currentWorld?.getCurrentPlotId() || '';
  //   const payload: CreateWorldRequest = {
  //     cardId: currentWorld?.cardId || '',
  //     plotId: currentWorld?.getCurrentPlotId() || '',
  //     tagCode: selectedPlotTag?.code as number
  //   };

  //   await useWorldStore.getState().createWorld(selectedPlotTag?.code || 0);
  //   useWorldStore.getState().createPlot({
  //     prePlotId,
  //     choice: choiceText
  //   });
  // }

  function onLiHelp() {
    changeChoiceText(CHOICE_LOADING_TIP);
    useWorldStore
      .getState()
      .createChoice()
      .then(res => {
        const { choice } = res;
        changeChoiceText(choice);
      })
      .catch(e => {
        changeChoiceText(CHOICE_FAIL_TIP);
        catchErrorLog('feedInputModal_lihelp', e);
      });
    reportClick('world_set_world', {
      set_world_button: 2,
      contentid: currentWorld?.cardId || '',
      world_contentid: choiceText
    });
  }
};
export { FeedInputModal };

const styles = createStyle({
  $modal: {
    width: '100%',
    height: '100%',
    zIndex: 100,
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  $placeholder: {
    flexGrow: 1,
    zIndex: -1000,
    flexShrink: 1,
    width: '100%',
    height: '100%'
  },
  $inputContainer: {
    flexShrink: 0,
    position: 'relative',
    alignItems: 'center',
    width: '100%',
    height: 'auto',
    overflow: 'visible',
    padding: 12
  },
  $keywordsContainer: {
    width: '100%',
    height: 115,
    position: 'absolute',
    zIndex: -1000,
    top: -80,
    paddingTop: 48,
    flexDirection: 'row'
  },
  $inputWrap: {
    position: 'relative',
    width: '100%',
    // paddingVertical: 12
    paddingBottom: 12
  },
  $inputHeader: {
    ...$flexHBetween,
    backgroundColor: '#435F7C',
    height: 48,
    paddingHorizontal: 10
  },
  $input: {
    fontSize: 18,
    marginHorizontal: 12,
    color: parallelWorldColors.fontGlow,
    fontFamily: typography.fonts.world,
    fontWeight: '400'
  }
});
