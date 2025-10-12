import { useDebounceFn, useRequest } from 'ahooks';
import { StatusBar, StatusBarProps } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import LiHelp, {
  CHOICE_FAIL_TIP,
  CHOICE_LOADING_TIP
} from '@/src/bizComponents/parallelWorld/others/LiHelp';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import LinearGradientCard from '@/src/bizComponents/parallelWorld/others/linear-gradient-card';
import { Icon, IconContinue, showToast } from '@/src/components';
import { Avatar } from '@/src/components/avatar';
import {
  ExtendedEdge,
  useSafeAreaInsetsStyle
} from '@/src/hooks/useSafeAreaInsetsStyle';
import { useAuthStore } from '@/src/store/authInfo';
import { CreateSatus, ModalType, useWorldStore } from '@/src/store/world';
import { PARALLEL_WORLD_PAGES_ENUM } from '@/src/store/world/parallel-world';
import { colors, currentColors, typography } from '@/src/theme';
import { $flexHCenter } from '@/src/theme/variable';
import { StyleSheet, isIos } from '@/src/utils';
import { catchErrorLog } from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import { reportClick } from '@/src/utils/report';
import { Image } from '@Components/image';
import { Screen } from '@Components/screen';
import { Header } from '@Components/screen';
import { REVIEW_ERR_ENUM, showErr } from '../errorMsg';
import GuideLine, {
  GUIDE_LINE_DIR
} from '@BizComponents/parallelWorld/others/GuideLine';
import { useShallow } from 'zustand/react/shallow';

const SPOT_BG_IMG = require('@Assets/image/parallel-world/spot.png');
const TURNING_POINT = require('@Assets/image/parallel-world/turning-point.png');
const EDIT_STICKER = require('@Assets/image/parallel-world/edit-sticker.png');
const { width: screenW } = Dimensions.get('window');

export default function NextChapterModal() {
  const { globalLoading, worldCreateStatus } = useWorldStore(
    useShallow(state => ({
      globalLoading: state.globalLoading,
      worldCreateStatus: state.worldCreateStatus
    }))
  );
  const currentPlot = useMemo(() => {
    const { plotIndex, currentWorld } = useWorldStore.getState();
    return currentWorld?.world?.timelinePlots?.[plotIndex];
  }, []);

  const { avatar } = useAuthStore(
    useShallow(state => ({
      avatar: state.userInfo?.avatar
    }))
  );

  const [choiceText, changeChoiceText] = useState('');

  const inputRef = React.useRef<TextInput>(null);

  const handleInputBlur = () => {
    inputRef.current?.blur();
  };

  const handleTextChange = (text: string) => {
    if (text === CHOICE_LOADING_TIP || globalLoading) return;
    changeChoiceText(text);
  };

  // const { createPlot } = useCreatePlot();

  const { run: handleCreatePlot } = useDebounceFn(
    async () => {
      const { currentWorld, createPlot } = useWorldStore.getState();
      inputRef.current?.blur();
      log.log('handleCreatePlot', {
        prePlotId: currentWorld?.getCurrentPlotId() || '',
        choice: choiceText,
        timeline: currentWorld?.world?.timelinePlots
      });
      closeNextChapterModal();
      createPlot({
        prePlotId: currentWorld?.getCurrentPlotId() || '',
        choice: choiceText
      }).catch(e => {
        showErr(e, REVIEW_ERR_ENUM.WORLD_CREATE);
        catchErrorLog('nextChapter', e);
        showNextChapterModal({});
      });

      reportClick('set_next_world', {
        contentid: currentWorld?.cardId,
        world_contentid: currentWorld?.world?.worldId,
        set_next_world_button: 4
      });
    },
    { wait: 300 }
  );
  const $containerInsets = useSafeAreaInsetsStyle(['top']);

  return (
    <View
      style={[
        {
          backgroundColor: 'transparent',
          position: 'absolute',
          height: '100%',
          width: '100%',
          flex: 1
        },
        $containerInsets
      ]}
    >
      <StatusBar style={'light'} />
      <View style={{ position: 'relative', zIndex: 999 }}>
        <Header
          themeColors={{ textColor: '#ffffff' }}
          onBack={closeNextChapterModal}
        />
      </View>

      <KeyboardAvoidingView
        behavior={isIos ? 'padding' : undefined}
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 1
          }
        ]}
      >
        <Pressable
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          onPress={handleInputBlur}
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
                    maxWidth: screenW - 160,
                    fontFamily: typography.fonts.world,
                    fontWeight: '400'
                  }}
                  numberOfLines={2}
                >
                  {currentPlot?.choicePoint?.trim() || '面对选择...'}
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
            />
          </View>
          <LinearGradientCard
            style={{
              marginTop: -65,
              // paddingHorizontal: 28,
              // paddingTop: 16,
              padding: 0,
              width: screenW - 36,
              paddingBottom: 20
            }}
            innerStyle={{ gap: 14 }}
          >
            <View
              style={[
                $flexHCenter,
                {
                  justifyContent: 'space-between',
                  backgroundColor: '#435F7C',
                  padding: 10,
                  borderTopLeftRadius: 10,
                  borderTopRightRadius: 10,
                  overflow: 'hidden'
                }
              ]}
            >
              <View style={[StyleSheet.rowStyle, { gap: 6 }]}>
                <Avatar size={28} source={avatar} />
                <Text
                  style={{
                    color: currentColors.white,
                    fontSize: 14,
                    fontWeight: '500'
                  }}
                >
                  你
                </Text>
              </View>
              {/* <Pressable
                onPress={closeNextChapterModal}
                disabled={worldCreateStatus !== CreateSatus.done}
                style={{
                  opacity: worldCreateStatus !== CreateSatus.done ? 0.6 : 1
                }}
              >
                <Icon icon={'close2'} size={16} />
              </Pressable> */}
              <LiHelp
                backgroundColors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)']}
                onPress={onLiHelp}
                disabled={globalLoading}
                icon="li_help"
                textStyle={{
                  color: '#7FD9FF',
                  fontSize: 14,
                  fontWeight: '500',
                  marginLeft: 4
                }}
              />
            </View>

            <View
              style={[
                $flexHCenter,
                {
                  paddingVertical: 30,
                  justifyContent: 'center'
                }
              ]}
            >
              <TextInput
                allowFontScaling={false}
                value={choiceText}
                ref={inputRef}
                style={{
                  fontSize: 18,
                  fontFamily: typography.fonts.world,
                  color: parallelWorldColors.fontGlow
                }}
                returnKeyType="send"
                placeholder="请输入世界线发展的关键剧情..."
                selectionColor={parallelWorldColors.fontGlow}
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
                onChangeText={handleTextChange}
                onBlur={handleInputBlur}
                // onSubmitEditing={() => onSubmit(value)}
                multiline
                returnKeyLabel="发送"
                enablesReturnKeyAutomatically
                maxLength={60}
                onKeyPress={({ nativeEvent: { key } }) => {
                  if (key !== 'Backspace' && choiceText.length > 60) {
                    showToast('评论文字已达到上限60字');
                  }
                }}
              />
            </View>

            <View style={{ alignItems: 'center', gap: 14 }}>
              <View
                style={{
                  borderRadius: 21,
                  padding: 2,
                  borderWidth: 1,
                  borderColor: parallelWorldColors.fontGlow
                }}
              >
                <ParallelWorldButton
                  style={{
                    backgroundColor: '#FF6A3B',
                    borderRadius: 19,
                    width: 196,
                    height: 38
                  }}
                  disabled={
                    !choiceText || globalLoading
                    // worldCreateStatus !== CreateSatus.init
                  }
                  // onPress={handleCreatePlot}
                  onPress={handleCreatePlot}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 4
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '600',
                        color: colors.white,
                        lineHeight: 18
                      }}
                    >
                      续写故事线
                    </Text>
                    <IconContinue fill={colors.white} size={18} />
                  </View>
                </ParallelWorldButton>
              </View>

              <ParallelWorldButton
                style={{
                  borderRadius: 21,
                  borderColor: colors.white,
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  width: 200,
                  height: 42
                }}
                onPress={() => {
                  const { currentWorld, pushWorldRouteStack } =
                    useWorldStore.getState();
                  // switchParallelWorldPage(PARALLEL_WORLD_PAGES_ENUM.PUBLISH);
                  pushWorldRouteStack({
                    route: PARALLEL_WORLD_PAGES_ENUM.PUBLISH
                  });

                  reportClick('set_next_world', {
                    contentid: currentWorld?.cardId,
                    world_contentid: currentWorld?.world?.worldId,
                    set_next_world_button: 5
                  });
                }}
                disabled={worldCreateStatus !== CreateSatus.done}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    position: 'relative',
                    gap: 4
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '600',
                      color: colors.white,
                      lineHeight: 18
                    }}
                  >
                    留给他人续写
                  </Text>
                  <Icon icon="publish_pw" size={16} />
                </View>
              </ParallelWorldButton>
            </View>
          </LinearGradientCard>
          <Image
            style={{
              position: 'absolute',
              top: 550,
              right: 0,
              width: 70,
              height: 72
            }}
            source={EDIT_STICKER}
          />
        </Pressable>
      </KeyboardAvoidingView>
    </View>
  );

  function onLiHelp() {
    const { currentWorld } = useWorldStore.getState();
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
}

interface NextChapterData {}

export const showNextChapterModal = (data: NextChapterData) => {
  useWorldStore.getState().showModal(ModalType.NEXT_CHAPTER, data);
};

export const closeNextChapterModal = () => {
  useWorldStore.getState().hideModal();
};
