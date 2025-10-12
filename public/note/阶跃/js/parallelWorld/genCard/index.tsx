import { useMemoizedFn } from 'ahooks';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleProp, // Text,
  TextStyle,
  View,
  ViewStyle
} from 'react-native';
import Dialog from 'react-native-popup-dialog';
import Animated from 'react-native-reanimated';
import {
  PW_PURE_BG_VIDEO,
  getGenImgWidthByHeight,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import { Image, Text } from '@/src/components';
import { Icon } from '@/src/components';
import { useImgPreview } from '@/src/components/emoji/_hooks/img-preview.hook';
import PreloadImg from '@/src/components/emoji/preload-img';
import { useScreenSize } from '@/src/hooks';
import { CreateSatus, useWorldStore } from '@/src/store/world';
import Act, { ActModel } from '@/src/store/world/models/ActModel';
import { colors } from '@/src/theme';
import { createStyle } from '@/src/utils';
import { reportClick } from '@/src/utils/report';
import LoadingImg from '../others/loading-img';
import {
  ActItem,
  ActType,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import type { PartialMessage } from '@bufbuild/protobuf';
import { ResizeMode, Video } from '@step.ai/expo-av';
import { useShallow } from 'zustand/react/shallow';
import CharacterCountdown from './CharacterCountdown';
import {
  DialogStreamItem,
  Dialogs,
  DialogsRef,
  StoryStreamItem
} from './StreamTextItem';
import ChangeImgButton from './change-img-button';

export const abstractActStoryText = (actItems: PartialMessage<ActItem>[]) => {
  let stories = '';
  let length = actItems.length;
  for (let i = 0; i < length; i++) {
    const item = actItems[i].item;
    if (!item || !item.case) continue;
    if (item.case === 'story') {
      stories += item.value.text + (i === length - 1 ? '' : '\n');
    }
  }
  return stories;
};

// export const renderAllActItems = (actItems: ActItem[]) => {
//   return (
//     <View style={{ minHeight: 100 }}>
//       {actItems.map(item => {
//         return (
//           <Text
//             style={{
//               fontSize: 14,
//               lineHeight: 20,
//               fontWeight: '600',
//               color:
//                 item.item.case === 'dialog'
//                   ? parallelWorldColors.fontGlow
//                   : 'black'
//             }}
//           >
//             {item.item?.value?.text as string}
//           </Text>
//         );
//       })}
//     </View>
//   );
// };

export const getAllActItemsText = (
  actItems: PartialMessage<ActItem>[],
  join: string = ''
) => {
  return (
    actItems
      // @ts-ignore
      .map(item => (item.item?.value?.text || '') as string)
      .join(join)
  );
};

export interface GenCardProps {
  act: Act | null;
  imgHeight: number;
  isInView: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  textNode?: ReactNode;
  onImgRegenerate?: (act: Act | null) => void;
}

export default function GenCard({
  act,
  // isEdit = false,
  isInView,
  imgHeight = 300,
  containerStyle: $containerStyle = {},
  textStyle: $textStyle = {},
  // onTextEdit,
  onImgRegenerate
  // onStreamFinish
}: GenCardProps) {
  const { width: screenWidth } = useScreenSize('window');
  const imgWidth = screenWidth - 48;

  const { actId, actNonce, cacheEditAct, worldCreateStatus } = useWorldStore(
    useShallow(state => ({
      actId: state.actId,
      actNonce: state.actNonce,
      cacheEditAct: state.cacheEditAct,
      worldCreateStatus: state.worldCreateStatus
    }))
  );
  const cacheActRef = useRef<ActModel>();

  const currentPlot = useMemo(() => {
    return useWorldStore.getState().currentWorld?.getCurrentPlot();
  }, []);

  const currentAct = useMemo(() => {
    // 变动的是当前的actId才返回
    console.log('newAct-------------2', actId, actNonce, cacheActRef.current);
    if (actNonce && actNonce[actId]) {
      const newAct = currentPlot?.getCurrentAct()?.act;
      cacheActRef.current = newAct;
      console.log('newAct-------------', newAct);
      return { ...newAct, ...(cacheEditAct || {}) };
    }

    if (!cacheActRef.current) {
      const newAct = currentPlot?.getCurrentAct()?.act;
      cacheActRef.current = newAct;
      console.log('newAct-------------3', newAct);
      return { ...newAct, ...(cacheEditAct || {}) };
    }
    return { ...cacheActRef.current, ...(cacheEditAct || {}) };
  }, [actId, actNonce, cacheEditAct]);

  const storyList = useMemo(() => {
    return (
      currentAct?.actItems?.filter(item => item.type === ActType.Story) || []
    );
  }, [currentAct]);

  const dialogList = useMemo(() => {
    return (
      currentAct?.actItems?.filter(item => item.type === ActType.Dialog) || []
    );
  }, [currentAct]);

  const imageUrl = useMemo(() => {
    console.log('imageUrl------------', imageUrl);
    return currentAct?.image?.imageUrl;
  }, [currentAct]);

  const storyText = useMemo(() => {
    return abstractActStoryText(currentAct?.actItems ?? []);
  }, [currentAct]);

  // 是否被查看过
  const isViewed = useRef(false);

  const [isStreamFinish, setIsStreamFinish] = useState<boolean>(false);

  const [isCountdownStart, setIsCountdownStart] = useState(false);
  const dialogRef = useRef<DialogsRef>(null);
  const imgDynamicHeight = useMemo(() => {
    return !storyText.length ? imgHeight + 110 : imgHeight;
  }, [storyText]);

  useEffect(() => {
    if (isInView) {
      if (!isViewed?.current) {
        isViewed.current = true;

        if (!imageUrl) {
          // // 添加第一个节点
          // appendActItem(0, act?.actItems ?? []);
          // 开始倒计时
          setIsCountdownStart(true);
        }
      } else {
        // 再次预览时直接显示全部内容
        // const length = act?.actItems?.length ?? 0;
        // // setSkipIndex(length);
        setIsStreamFinish(true);
      }
    }
  }, [isInView]);

  return (
    <View style={[cardStyles.$container, $containerStyle]}>
      <View style={imgStyles.$container}>
        {imageUrl ? (
          <View
            style={[
              {
                width: imgWidth + 20
              },
              imgStyles.$changeImg
            ]}
          >
            {worldCreateStatus === CreateSatus.done ? (
              <ChangeImgButton title="换一张" onImgRegenerate={imgRegenerate} />
            ) : null}
          </View>
        ) : null}

        <LoadingImg
          url={imageUrl ?? ''}
          isLoading={!imageUrl}
          style={imgStyles.$box}
          size={{
            height: imgDynamicHeight,
            width: imgWidth
          }}
        />
        {imageUrl ? (
          <View
            style={[
              dialogStyles.$container,
              dialogList.length > 1
                ? {
                    width: imgWidth + 20,
                    left: 0
                  }
                : {
                    width: imgWidth - 20
                  }
            ]}
          >
            {dialogList && dialogList.length ? (
              <Dialogs
                ref={dialogRef}
                actId={actId}
                items={dialogList}
                inEditScreen={currentAct.isFinish || false}
                onNext={() => {
                  // alert('onNext');
                }}
              />
            ) : null}
          </View>
        ) : null}

        {!imageUrl && isCountdownStart && (
          <CharacterCountdown
            avatarUrl={currentAct?.roleInfoList?.[0]?.roleAvatar}
          />
        )}
      </View>

      <View
        style={
          storyText.length === 0
            ? {
                height: 10,
                overflow: 'hidden'
              }
            : {}
        }
      >
        <View
          style={[
            {
              width: imgWidth
            },
            storyStyles.$container
          ]}
        >
          <ScrollView style={{ height: 80 }}>
            {storyList.map((item, index) => (
              <StoryStreamItem
                // @ts-ignore
                key={item?.item?.value?.text + `${index}`}
                // @ts-ignore
                story={item?.item?.value}
                onFinish={() => {}}
                start={true}
                stream={true}
                textStyle={[
                  {
                    fontSize: storyText.length > 60 ? 13 : 14
                  },
                  $textStyle
                ]}
                inEditScreen={currentAct.isFinish || false}
              ></StoryStreamItem>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );

  function imgRegenerate() {
    const currentAct = useWorldStore
      .getState()
      .currentWorld?.getCurrentPlot()
      ?.getCurrentAct();
    if (!currentAct || !onImgRegenerate) return;
    onImgRegenerate(currentAct);
    reportClick('world_editing', {
      world_editing_button: 2
    });
  }
}

const cardStyles = createStyle({
  $container: {
    backgroundColor: colors.white,
    alignItems: 'center',
    height: 'auto'
  }
});

const imgStyles = createStyle({
  $container: {
    padding: 10,
    paddingBottom: 0,
    position: 'relative'
  },
  $box: {
    borderWidth: 2,
    position: 'relative',
    borderColor: colors.black
  },
  $changeImg: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    bottom: 24
  },
  $imgBasic: { height: '100%', width: '100%' },
  $imgPreviewBox: {
    position: 'absolute',
    zIndex: 10
  },
  $loading: {
    borderWidth: 2,
    borderColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  }
});

const dialogStyles = createStyle({
  $container: {
    position: 'absolute',
    alignItems: 'center',
    gap: 16,
    bottom: 70
  }
});

const storyStyles = createStyle({
  $container: {
    margin: 10,
    borderWidth: 2,
    borderColor: colors.black,
    // width: imgWidth,
    paddingVertical: 8,
    paddingHorizontal: 12
  }
});
