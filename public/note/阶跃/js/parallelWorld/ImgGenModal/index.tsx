import { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { ICarouselInstance } from 'react-native-reanimated-carousel';
import { createActImage } from '@/src/api/parallel-world/consumer';
import {
  PW_PURE_BG_VIDEO,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import {
  REVIEW_ERR_ENUM,
  showErr
} from '@/src/bizComponents/parallelWorld/errorMsg';
import ImageLoading from '@/src/bizComponents/parallelWorld/loading/image-loading';
import AiPressableInput from '@/src/bizComponents/parallelWorld/others/AIPressableInput';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import LoadingImg from '@/src/bizComponents/parallelWorld/others/loading-img';
import Radio from '@/src/bizComponents/parallelWorld/others/radio';
import { Icon, Image, SheetModal, showToast } from '@/src/components';
import { useImgPreview } from '@/src/components/emoji/_hooks/img-preview.hook';
import PreloadImg from '@/src/components/emoji/preload-img';
import { usePersistFn } from '@/src/hooks';
import { selectState } from '@/src/store/_utils';
import { useWorldStore } from '@/src/store/world';
import { GenImage } from '@/src/store/world/models/ActModel';
import { useParallelWorldConsumerStore } from '@/src/store/world/parallel-world-consumer';
import { colors, typography } from '@/src/theme';
import { $flexHCenter } from '@/src/theme/variable';
import { createStyle } from '@/src/utils';
import { ReportError, errorReport } from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import { reportClick, reportExpo } from '@/src/utils/report';
import ImgGenDescModal from '../_components/comsumer-input-modal/img-gen-desc-modal';
import ImgGenGallery from '../_components/img-gen-gallery';
import {
  ActImage,
  WorldAct
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { ResizeMode, Video } from '@step.ai/expo-av';
import { useShallow } from 'zustand/react/shallow';

const getImgStateFromStore = (actId: string) => {
  const state = useParallelWorldConsumerStore.getState();
  return state.genImgMap[actId];
};

interface ImgGenModalProps {
  onClose: () => void;
}

export const ImgGenModal = (props: ImgGenModalProps) => {
  const { currentAct } = useWorldStore(
    useShallow(state => ({
      currentAct: state.currentWorld?.getCurrentPlot()?.getCurrentAct()
    }))
  );
  const [images, setImages] = useState<GenImage[]>([]);
  const [localDesc, setLocalDesc] = useState('');
  const galleryRef = useRef<{
    galleryInstance: ICarouselInstance | null;
  }>(null);
  const [visible, setVisible] = useState<boolean>(true);
  const [selectedImgIndex, setSelectedImgIndex] = useState<number | undefined>(
    undefined
  );
  const inputRef = useRef<TextInput>(null);
  const [hasLoading, setLoading] = useState<boolean>(false);

  const requestImage = usePersistFn((count?: number) => {
    const payload = {
      userPrompt: isUserPrompt.current || false,
      plotId: useWorldStore.getState().currentWorld?.getCurrentPlotId() || '',
      count: count || 3,
      actId: currentAct?.act?.actId || '',
      desc: localDesc,
      act: getReleteActs()
    };

    currentAct?.requestImage(
      payload,
      images => {
        log.log('requestImage', { images });
        setImages([...images]);
      },
      e => {
        showErr(e, REVIEW_ERR_ENUM.IMG_DESC);

        // generateError({ actId: imgGenAct.actId, desc: params.desc });

        setTimeout(() => {
          galleryRef.current?.galleryInstance?.scrollTo({
            index: 0,
            animated: true
          });
        });
        errorReport(
          'createActImage',
          ReportError.PARALLEL_WORLD,
          JSON.stringify(e)
        );
        console.log('createActImage payload is', payload);
      }
    );
  });

  const handleSubmit = usePersistFn(() => {
    if (selectedImgIndex === undefined) return;
    const image = images[selectedImgIndex];

    useWorldStore.getState().updateCacheAct({
      image: new ActImage({ ...image, desc: localDesc })
    });
    props.onClose();
  });

  const isUserPrompt = useRef(false);

  const currentGenImage = useMemo(() => {
    console.log(11111111, images[selectedImgIndex || 0]);
    return images[selectedImgIndex || 0];
  }, [selectedImgIndex, images]);

  // 初始化
  useEffect(() => {
    if (!currentAct?.genImages?.length) {
      requestImage();
    } else {
      setImages(currentAct?.genImages || []);
    }
    setLocalDesc(currentAct?.act.image?.desc || '生图描述');
    // currentAct?.requestImage();
    // if (!imgState?.img?.length && !imgState?.isLoading) {
    //   handleImgGen(
    //     {
    //       count: 3,
    //       desc: currentAct?.image?.desc ?? '',
    //       actId: currentAct?.actId as string
    //     },
    //     true
    //   );
    // } else {
    //   const defaultActive = imgState.img.findIndex(
    //     item => item?.imageId === currentAct?.image?.imageId
    //   );

    //   setSelectedImgIndex(defaultActive);

    //   setTimeout(() => {
    //     galleryRef.current?.galleryInstance?.scrollTo({
    //       index: defaultActive,
    //       animated: true
    //     });
    //   });
    // }
    // todo
    // useWorldStore.getState().currentWorld?.getCurrentPlot()?.getCurrentAct()
    reportExpo('world_editing_image', {
      actid: currentAct?.act?.actId
    });
  }, []);

  // if (!visible) return;

  return (
    <>
      <SheetModal
        isVisible={visible}
        onClose={props.onClose}
        remainHeight={0}
        style={{
          backgroundColor: parallelWorldColors.bg
        }}
        maskShown={true}
        maskOpacity={0.4}
        closeBtn={false}
        dragable={false}
        theme="dark"
      >
        <View style={styles.$container}>
          <View style={styles.$header}>
            <Icon icon="icon_ai_stroked" size={17} />
            <Text style={styles.$title}>换一张图片</Text>
          </View>
          <Pressable onPress={props.onClose}>
            <Icon icon="close_dark_fill" size={26} />
          </Pressable>
        </View>
        <View style={styles.$gallerySection}>
          <ImgGenGallery
            ref={galleryRef}
            data={images}
            loadMore={
              !hasLoading
                ? () => {
                    requestImage(1);
                  }
                : undefined
            }
            imageHeight={270}
            imageWidth={180}
            renderImage={({ item, index }, imgSize) => {
              // const isLoading = hasLoading && !item;
              // console.log(12345, item, item?.imageUrl);
              const isLoading = !item || item?.loading || false;
              return (
                <View key={item?.imageId} style={styles.$imgContainer}>
                  <View style={styles.$imgBox}>
                    <LoadingImg
                      url={item?.imageUrl ?? ''}
                      isLoading={isLoading}
                      size={imgSize}
                    />

                    {!isLoading && (
                      <Radio
                        isActive={selectedImgIndex === index}
                        onPress={isSelected => {
                          if (isSelected) {
                            setSelectedImgIndex(index);
                          } else {
                            setSelectedImgIndex(undefined);
                          }
                        }}
                        style={styles.$selectRadio}
                      />
                    )}
                  </View>
                </View>
              );
            }}
          />
          <View style={{ paddingHorizontal: 16 }}>
            <AiPressableInput
              disabled={hasLoading}
              labelNode={
                <Text style={inputStyles.$label} numberOfLines={1}>
                  生图描述
                </Text>
              }
              textNode={
                <View style={inputStyles.$textArea}>
                  <Text style={inputStyles.$placeholder} numberOfLines={1}>
                    {localDesc}
                  </Text>
                  <Icon icon="icon_edit_glow" size={16} />
                </View>
              }
              onInputPress={handleDescEdit}
              outlineStyle={inputStyles.$container}
            />
          </View>
          <View style={btnStyles.$container}>
            <ParallelWorldButton
              onPress={props.onClose}
              title="取消"
              style={btnStyles.$cancel}
            />
            <ParallelWorldButton
              title="确认替换"
              disabled={selectedImgIndex === undefined}
              onPress={handleSubmit}
              style={btnStyles.$submit}
            />
          </View>
        </View>
      </SheetModal>
      {!visible && (
        <ImgGenDescModal
          ref={inputRef}
          value={localDesc || ''}
          onChange={text => {
            setLocalDesc(text);
            // setInEditDesc(text);
          }}
          onSubmit={handleDescSubmit}
          onClose={handleDescClose}
          isVisible={!visible}
          onFocus={handleDescFocus}
        />
      )}
    </>
  );

  function getReleteActs() {
    const { currentWorld, actIndex } = useWorldStore.getState();
    const acts = currentWorld?.getCurrentPlot()?.queryActs();
    return (
      acts
        ?.slice(Math.max(actIndex - 2, 0), actIndex + 1)
        .map(i => new WorldAct(i.act)) || []
    );
  }

  function updateGenImage(index: number, text: string) {}

  function handleDescSubmit() {
    isUserPrompt.current = true;
    handleDescClose();
    requestImage(3);
  }

  function handleDescEdit() {
    setVisible(false);
    // requestImage(3);
    // handleDescClose();
  }

  function handleDescClose() {
    setVisible(true);
  }
  function handleDescFocus() {
    if (Platform.OS === 'android') {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    } else {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 30);
    }
  }
};

const styles = createStyle({
  $container: {
    ...$flexHCenter,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 20,
    paddingHorizontal: 20
  },
  $header: { ...$flexHCenter, gap: 4 },
  $title: { fontSize: 16, fontWeight: '700', color: colors.white },
  $gallerySection: {
    flex: 1,
    alignItems: 'stretch',
    gap: 24,
    position: 'relative'
  },
  $imgContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  $imgBox: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden'
  },
  $selectRadio: {
    position: 'absolute',
    bottom: 12,
    right: 12
  }
});

const inputStyles = createStyle({
  $container: { height: 48, padding: 0 },
  $label: { color: '#fff', fontWeight: '500' },
  $textArea: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  $placeholder: {
    color: parallelWorldColors.fontGlow,
    fontFamily: typography.fonts.world,
    fontSize: 16,
    fontWeight: '400'
  }
});

const btnStyles = createStyle({
  $container: {
    ...$flexHCenter,
    gap: 18,
    paddingHorizontal: 16,
    justifyContent: 'center',
    width: '100%',
    bottom: 0
  },
  $cancel: {
    backgroundColor: 'transparent',
    borderColor: parallelWorldColors.fontGlow,
    borderWidth: 1,
    width: 134
  },
  $submit: {
    flex: 1,
    backgroundColor: 'rgba(127, 217, 255, 1)',
    width: 134
  }
});
