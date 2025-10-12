import { useMemoizedFn } from 'ahooks';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState
} from 'react';
import {
  Image as NativeImage,
  Pressable,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { parallelWorldClient } from '@/src/api/parallel-world';
import { useStaticStreamText } from '@/src/bizComponents/parallelWorld/_hooks/static-stream-text.hook';
import {
  Icon,
  ImageStyle,
  Text,
  hideLoading,
  iconRegistry,
  showLoading
} from '@/src/components';
import AudioPlayer, {
  clearSounds,
  createSounds
} from '@/src/components/audioPlayer';
import { usePersistFn } from '@/src/hooks';
import { useStorageStore } from '@/src/store/storage';
import { useWorldStore } from '@/src/store/world';
import { ActModel, TTSItem } from '@/src/store/world/models/ActModel';
import { currentColors } from '@/src/theme';
import { log } from '@/src/utils/logger';
import { groupBy } from '@/src/utils/opt/groupBy';
import { showToast } from '@Components/toast';
import { StyleSheet } from '@Utils/StyleSheet';
import { showTextEditModal } from '../textEditModal';
import {
  ActDialog,
  ActItem,
  ActStory
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import { useShallow } from 'zustand/react/shallow';

interface StreamTextPros {
  // index: number;
  // skip: boolean;
  // start: boolean;
  stream?: boolean;
  show?: boolean;
  inEditScreen: boolean;
  onFinish: () => void;
  textStyle?: StyleProp<TextStyle>;
}

export function StoryStreamItem({
  story,

  // index,
  stream,
  show,
  onFinish,
  // skip,
  // start,
  inEditScreen,
  textStyle: $textStyle = {}
}: { story: PartialMessage<ActStory> } & StreamTextPros) {
  // const isFinish = useRef(false);
  const [canEdit, setEditStatus] = useState(false);
  // const handleFinish = useMemoizedFn(() => {
  //   console.log('handleFinish------>', index, isFinish.current, skip);

  //   if (isFinish.current) {
  //     return;
  //   } else {
  //     isFinish.current = true;
  //     onFinish(index);
  //   }
  // });

  const onFinish2 = () => {
    onFinish();
    setEditStatus(true);
  };

  const { streamText } = useStaticStreamText({
    text: story.text || '',
    onFinish: onFinish2,
    interval: 10
  });
  if (!stream && !show) return;
  return (
    <Text
      style={[{ fontSize: 14, lineHeight: 20, fontWeight: '600' }, $textStyle]}
    >
      <Text>{stream ? streamText : story.text}</Text>
      {inEditScreen && canEdit ? (
        <Text>
          <NativeImage
            style={[
              {
                resizeMode: 'contain'
              },
              { tintColor: currentColors.black },
              { width: 14, height: 14 }
            ]}
            source={iconRegistry['icon_edit_glow']}
          />
        </Text>
      ) : null}
    </Text>
  );

  function onEdit() {
    if (!inEditScreen) return;
    const text = story.text || '';
    if (text) {
      showTextEditModal({
        index:
          useWorldStore
            .getState()
            .currentWorld?.getCurrentPlot()
            ?.getCurrentAct()
            ?.getTextIndex(text) || 0,
        text
      });
    }
  }
}

export const Dialog = ({
  text,
  dialogStyle,
  hasTTS,
  isPlaying,
  canEdit,
  onPlay,
  onEdit
}: {
  text: string;
  dialogStyle?: StyleProp<ViewStyle>;
  hasTTS: boolean;
  isPlaying: boolean;
  canEdit: boolean;
  onPlay: () => void;
  onEdit: () => void;
}) =>
  !text ? null : (
    <View
      style={[
        {
          paddingVertical: 10,
          paddingHorizontal: 8,
          backgroundColor: 'rgba(23, 30, 38, 0.90)',
          borderRadius: 10
        },
        dialogStyle,
        canEdit && { borderColor: currentColors.white, borderWidth: 1 }
      ]}
    >
      {hasTTS && (
        <TouchableOpacity style={$iconAudio} onPress={onPlay}>
          {isPlaying ? (
            <Icon size={12} hitSlop={20} icon="icon_audio_playing"></Icon>
          ) : (
            <Icon size={12} hitSlop={20} icon="icon_audio_play"></Icon>
          )}
          <Icon size={12} hitSlop={20} icon="icon_audio_playing"></Icon>
        </TouchableOpacity>
      )}
      <View>
        <Text style={{ paddingLeft: 12, color: 'white', display: 'flex' }}>
          {hasTTS && <Text style={{ color: 'transparent' }}>0000</Text>}
          <Text style={{ color: 'white' }}>{text}</Text>
          {canEdit && (
            <Icon
              onPress={onEdit}
              hitSlop={20}
              icon="icon_edit_glow"
              style={{ marginLeft: 10, display: 'flex' }}
              size={14}
            />
          )}
        </Text>
      </View>
    </View>
  );

interface DialogStreamItemRef {
  complete: () => void;
}

interface DialogStreamItemProps extends StreamTextPros {
  dialog: PartialMessage<ActDialog>;
  dialogStyle?: StyleProp<ViewStyle>;
  activeIndex: number;
  inEditScreen: boolean;
}
export const DialogStreamItem = forwardRef<
  DialogStreamItemRef,
  DialogStreamItemProps
>(({ dialog, onFinish, dialogStyle, activeIndex, inEditScreen }, ref) => {
  const isFinish = useRef(false);
  const isTTSFinish = useRef(false);
  const finished = useRef(false);
  const audioRef = useRef<AudioPlayer>();
  const [hasTTS, setHasTTS] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const ttsDataRef = useRef<TTSItem>();
  const indexRef = useRef(0);
  const { worldAudio } = useWorldStore(
    useShallow(state => ({
      worldAudio: state.config.worldAudio
    }))
  );
  const { actNonce, currentAct } = useWorldStore(
    useShallow(state => ({
      actNonce: state.actNonce,
      currentAct: state.currentWorld?.getCurrentPlot()?.getCurrentAct()
    }))
  );

  const handleFinish = useMemoizedFn(() => {
    isFinish.current = true;
    finish();
  });

  const { streamText, complete } = useStaticStreamText({
    // start,
    text: dialog.text || '',
    onFinish: handleFinish
  });

  const currentText = useMemo(() => {
    if (!isFinish.current) {
      return streamText;
    }
    // const index = currentAct?.getTextIndex(streamText);
    // log.log('streamText123', {
    //   streamText,
    //   index,
    //   stream: currentAct?.getItemText(index || 0),
    //   dialogText: dialog.text
    // });
    // if (typeof index === 'undefined') return streamText;
    return currentAct?.getItemText(indexRef.current) || streamText;
    // return streamText;
  }, [streamText, actNonce]);

  useEffect(() => {
    log.log('actNonce--------', { actNonce });
    log.log('text2--------', {
      actId: currentAct?.act.actId,
      text: dialog.text,
      act: currentAct?.act
    });
    if (
      currentAct?.act.actId &&
      actNonce?.[currentAct?.act.actId] &&
      dialog.text
    ) {
      // const index = currentAct?.getTextIndex(dialog.text);
      const text = currentAct?.getItemText(indexRef.current);
      const ttsData = currentAct?.getTTS(text);
      if (currentAct?.getTTS(text) && worldAudio) {
        setHasTTS(true);
      } else {
        setHasTTS(false);
        setIsPlaying(false);
        isTTSFinish.current = true;
        finish();
      }
      ttsDataRef.current = ttsData;
    }
  }, [actNonce]);

  // useEffect(() => {
  //   if (!hasTTS) {
  //     isTTSFinish.current = true;
  //   }
  // }, [hasTTS]);

  const [canEdit, setEditStatus] = useState(false);

  const onPlay = usePersistFn(() => {
    log.log('onPlay', { isPlaying, 'ttsDataRef.current': ttsDataRef.current });
    if (isPlaying) {
      if (audioRef.current) {
        audioRef.current.stop();
        setIsPlaying(false);
      }
    } else {
      if (ttsDataRef.current?.ttsPending) {
        showToast('语音生成中，请稍后~');
        return;
      }
      if (ttsDataRef.current?.soundTask) {
        playSoundTask(ttsDataRef.current); // 已经生成的
      } else if (ttsDataRef.current?.ttsTaskId) {
        playById();
      }
    }
  });

  const onEdit = usePersistFn(() => {
    if (!(inEditScreen && canEdit)) return;
    const text = currentText || '';
    if (text) {
      showTextEditModal({
        index:
          useWorldStore
            .getState()
            .currentWorld?.getCurrentPlot()
            ?.getCurrentAct()
            ?.getTextIndex(text) || 0,
        text
      });
    }
  });

  const playById = usePersistFn(() => {
    showLoading();
    const currentWorld = useWorldStore.getState().currentWorld;
    parallelWorldClient
      .queryTTSTaskResult({
        cardId: currentWorld?.cardId,
        plotId: currentWorld?.getCurrentPlotId(),
        actId: currentWorld?.getCurrentPlot()?.getCurrentActId(),
        taskId: ttsDataRef.current?.ttsTaskId
      })
      .then(async res => {
        const { ttsUrlList } = res;
        const sounds = await createSounds(ttsUrlList);
        const audioPlayer = createAudioPlayer();
        hideLoading();
        await audioPlayer.playSounds(sounds);
        isTTSFinish.current = true;
        finish();
      })
      .catch(e => {
        hideLoading();
        showToast('播放失败');
      });
  });

  const playByUrl = usePersistFn(async () => {
    if (!ttsDataRef.current) return;
    showLoading();
    const { ttsUrl } = ttsDataRef.current;
    if (!ttsUrl) return;
    const sounds = await createSounds(ttsUrl);
    const audioPlayer = createAudioPlayer();
    hideLoading();
    await audioPlayer.playSounds(sounds);
    isTTSFinish.current = true;
    finish();
  });

  useEffect(() => {
    // if (typeof worldAudio === 'undefined') return;
    // alert(worldAudio);
    if (
      worldAudio &&
      (ttsDataRef.current?.ttsTaskId || ttsDataRef.current?.soundTask)
    ) {
      // alert(ttsDataRef.current?.ttsTaskId);
      // alert(ttsDataRef.current?.soundTask);
      setHasTTS(true);
    } else {
      setHasTTS(false);
      // isTTSFinish.current = true;
      setIsPlaying(false);
    }
  }, [worldAudio]);

  useEffect(() => {
    const currentAct = useWorldStore
      .getState()
      .currentWorld?.getCurrentPlot()
      ?.getCurrentAct();
    if (dialog.text) {
      const ttsData = currentAct?.getTTS(dialog.text);
      ttsDataRef.current = ttsData;
      log.log('ttsData', ttsData || {});
      const { worldAudio } = useWorldStore.getState().config;
      indexRef.current = currentAct?.getTextIndex(dialog.text) || 0;
      if (!worldAudio) {
        setHasTTS(false);
        setIsPlaying(false);
        isTTSFinish.current = true;
        finish();
        return;
      }
      if (ttsData?.soundTask) {
        playSoundTask(ttsData); // 已经生成的
        setHasTTS(true);
      } else if (ttsData?.ttsTaskId) {
        setHasTTS(true);
      } else {
        isTTSFinish.current = true;
        finish();
      }
    } else {
      isTTSFinish.current = true;
      finish();
    }

    return () => {
      audioRef.current?.stop();
    };
  }, []);

  useImperativeHandle(ref, () => ({
    complete
  }));

  return (
    <Dialog
      text={`${dialog.role}: ${currentText}`}
      hasTTS={hasTTS}
      isPlaying={isPlaying}
      dialogStyle={dialogStyle}
      onPlay={onPlay}
      onEdit={onEdit}
      canEdit={canEdit && inEditScreen}
    />
  );

  function createAudioPlayer() {
    if (audioRef.current) {
      audioRef.current.stop();
      audioRef.current = undefined;
    }
    const audioPlayer = new AudioPlayer({
      scope: 'tts',
      volume: 1,
      onPlay: () => {
        console.log('[play tts]');
        setIsPlaying(true);
      },
      onStop: () => {
        console.log('[stop tts]');
        isTTSFinish.current = true;
        setIsPlaying(false);
        finish();
      },
      onError: () => {
        // console.log('[err tts]');
        // isTTSFinish.current = true;
        // setIsPlaying(false);
        // finish();
        // showToast('播放出错~');
      }
    });
    audioRef.current = audioPlayer;
    return audioRef.current;
  }

  async function playSoundTask(ttsData: TTSItem) {
    const audioPlayer = createAudioPlayer();
    // let cacheSounds = null;
    try {
      const sounds = await ttsData?.soundTask;
      if (sounds) {
        // cacheSounds = sounds;
        await audioPlayer.playSounds(sounds);
        await audioPlayer.stop();
        log.log('test213113', { ttsUrl: ttsData.ttsUrl });
        isTTSFinish.current = true;
        finish();
      }
    } catch (error) {
      // showToast('播放失败');
      // await audioPlayer.clear();
      // if (cacheSounds) {
      //   clearSounds(cacheSounds);
      // }
      log.log('dialog error', { error, ttsDataRef: ttsDataRef.current });
      if (ttsDataRef.current?.ttsTaskId) {
        playById();
      } else if (ttsDataRef.current?.ttsUrl) {
        playByUrl();
      } else {
        isTTSFinish.current = true;
        finish();
      }
    }
  }

  function finish() {
    log.log('finish-------', {
      isFinish: isFinish.current,
      isTTSFinish: isTTSFinish.current
    });

    if (finished.current) {
      setIsPlaying(false);
      isTTSFinish.current = true;
      isFinish.current = true;
      setTimeout(() => {
        setEditStatus(true);
      });
      return;
    }

    if (isFinish.current) {
      setTimeout(() => {
        setEditStatus(true);
      });
    }

    if (isFinish.current && isTTSFinish.current) {
      setIsPlaying(false);
      onFinish();
      finished.current = true;

      return;
    }

    // if (inEditScreen) {

    // }
    // alert(isTTSFinish.current);
    if (isTTSFinish.current) {
      setIsPlaying(false);
    }
  }
});

export interface DialogsRef {
  next: () => void;
}

interface DialogsProps {
  actId: string;
  items: PartialMessage<ActItem>[];
  onNext: () => void;
  inEditScreen: boolean;
}

enum TextStatus {
  streaming1 = 'streaming1', // 正在流式第一个文本
  streaming2 = 'streaming2', // 正在流式第二个文本
  done = 'done' // 流式完成
}
export const Dialogs = forwardRef<DialogsRef, DialogsProps>(
  ({ items, onNext, actId, inEditScreen }, ref) => {
    useImperativeHandle(ref, () => ({
      next
    }));

    const [index, setIndex] = useState<number>(0);
    const textStatus = useRef<TextStatus>(TextStatus.streaming1);
    const indexRef = useRef<number>(0);
    const dialog1Ref = useRef<DialogStreamItemRef>(null);
    const dialog2Ref = useRef<DialogStreamItemRef>(null);

    const dialog1 = useMemo(() => {
      if (index < 0) return null;
      // 偶数
      if (!(index % 2)) {
        return items[index];
      } else {
        return items[index - 1];
      }
    }, [actId, index]);

    // 奇数
    const dialog2 = useMemo(() => {
      if (index < 0) return null;
      if (!(index % 2)) {
        return null;
      } else {
        return items[index];
      }
    }, [actId, index]);

    const next = useCallback(() => {
      console.log(
        'next-----',
        indexRef.current,
        JSON.stringify(items),
        textStatus.current
      );
      if (!items.length) {
        setIndex(-1);
        onNext();
        return;
      }
      switch (textStatus.current) {
        case TextStatus.streaming1:
          dialog1Ref.current?.complete(); // to --> onFinish1
          break;
        case TextStatus.streaming2:
          dialog2Ref.current?.complete(); // to --> onFinish2
        case TextStatus.done:
          onNext();
          setIndex(-1);
      }
    }, [items]);

    useEffect(() => {
      indexRef.current = index;
    }, [index]);

    useEffect(() => {
      if (actId) {
        setIndex(0);
        textStatus.current = TextStatus.streaming1;
      }
    }, [actId]);

    return (
      <>
        {dialog1 && dialog1.item?.case === 'dialog' && (
          <View
            // entering={FadeIn.duration(500).delay(500)}
            style={$dialogLeftStyle}
            // style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <DialogStreamItem
              key={actId}
              dialog={dialog1.item?.value}
              activeIndex={index}
              onFinish={onFinish1}
              ref={dialog1Ref}
              inEditScreen={inEditScreen}
            />
          </View>
        )}
        {dialog2 && dialog2.item?.case === 'dialog' && (
          <View
            style={$dialogRightStyle}
            // entering={FadeIn.duration(500).delay(500)}
            // style={{ maxWidth: 224 }}
            // style={{ position: 'absolute', top: 0, left: 0 }}
          >
            <DialogStreamItem
              key={actId}
              activeIndex={index}
              dialog={dialog2.item?.value}
              onFinish={onFinish2}
              ref={dialog2Ref}
              inEditScreen={inEditScreen}
            />
          </View>
        )}
      </>
    );

    function onFinish1() {
      console.log('onFinish1=======', checkLast());
      if (checkLast()) {
        textStatus.current = TextStatus.done;
        return;
      }
      // 第一句话结束直接播第二句
      textStatus.current = TextStatus.streaming2;
      setIndex(index => index + 1); // 递增索引
    }

    function onFinish2() {
      console.log('onFinish2=======', checkLast());
      if (checkLast()) {
        textStatus.current = TextStatus.done;
        return;
      }
      textStatus.current = TextStatus.done;
      setIndex(index => index + 1);
    }

    function checkLast() {
      return indexRef.current >= items.length - 1;
    }
  }
);

const $iconAudio: ViewStyle = {
  ...StyleSheet.rowStyle,
  position: 'absolute',
  gap: 3,
  top: 14,
  left: 20,
  opacity: 0.5,
  zIndex: 4
};

const $dialogLeftStyle: ViewStyle = {
  maxWidth: 224,
  alignItems: 'flex-start',
  alignSelf: 'flex-start',
  marginLeft: -5
};

const $dialogRightStyle: ViewStyle = {
  maxWidth: 224,
  alignItems: 'flex-end',
  alignSelf: 'flex-end',
  marginRight: -5
};
