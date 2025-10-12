import { useEffect, useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import ParallelWorldButton from '@/src/bizComponents/parallelWorld/others/ParallelWorldButton';
import Radio from '@/src/bizComponents/parallelWorld/others/radio';
import { Icon, Image, SheetModal } from '@/src/components';
import { selectState } from '@/src/store/_utils';
import { useWorldStore } from '@/src/store/world';
import { useParallelWorldConsumerStore } from '@/src/store/world/parallel-world-consumer';
import { useParallelWorldPublishStore } from '@/src/store/world/parallel-world-publish';
import { colors } from '@/src/theme';
import { $flexHCenter } from '@/src/theme/variable';
import { createStyle } from '@Utils/StyleSheet';
import ImgGenGallery from '../img-gen-gallery';
import { ActImage } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { useShallow } from 'zustand/react/shallow';

const CoverChangeModal = () => {
  const {
    isChangeCoverModalVisible,
    closeChangeCoverModal,
    coverImg,
    changeCoverImg
  } = useParallelWorldPublishStore(
    useShallow(state =>
      selectState(state, [
        'coverImg',
        'isChangeCoverModalVisible',
        'closeChangeCoverModal',
        'changeCoverImg'
      ])
    )
  );
  const allActsImages = useMemo(() => {
    return useWorldStore
      .getState()
      .currentWorld?.getCurrentPlot()
      ?.queryImages();
  }, []);
  // const { allActsImages } = useWorldStore(useShallow(state => ({
  //   allActsImages: state.currentWorld
  // })))

  // const { allActsImages } = useParallelWorldConsumerStore(
  //   useShallow(state => selectState(state, ['acts', 'allActsImages']))
  // );

  const [selectedImg, setSelectedImg] = useState<ActImage>();

  const handleCoverChange = () => {
    if (selectedImg === undefined) return;
    changeCoverImg(selectedImg as ActImage);
    closeChangeCoverModal();
  };

  useEffect(() => {
    setSelectedImg(coverImg as ActImage);
  }, []);

  return (
    <SheetModal
      isVisible={isChangeCoverModalVisible}
      onClose={closeChangeCoverModal}
      style={{ backgroundColor: parallelWorldColors.bg }}
      remainHeight={0}
      maskShown={true}
      maskOpacity={0.4}
      closeBtn={false}
      dragable={false}
      theme="dark"
    >
      <View style={modalStyles.$header}>
        <View style={modalStyles.$headerTextBox}>
          <Icon icon="icon_edit_glow" size={17} />
          <Text style={modalStyles.$headerText}>编辑封面</Text>
        </View>
        <Pressable onPress={closeChangeCoverModal}>
          <Icon icon="close_dark_fill" size={26} />
        </Pressable>
      </View>
      <View style={galleryStyles.$container}>
        <ImgGenGallery
          data={allActsImages}
          imageHeight={300}
          imageWidth={200}
          renderImage={({ item: actImage, index }, imgSize) => (
            <View style={galleryStyles.$item}>
              <View style={galleryStyles.$imgBox}>
                <Image
                  source={actImage?.imageUrl}
                  style={[
                    { width: imgSize.width, height: imgSize.height },
                    galleryStyles.$img
                  ]}
                  tosSize="size4"
                />
                <Radio
                  isActive={
                    !!actImage?.imageUrl &&
                    selectedImg?.imageUrl === actImage?.imageUrl
                  }
                  onPress={isSelected => {
                    if (isSelected) {
                      setSelectedImg(actImage);
                    } else {
                      setSelectedImg(undefined);
                    }
                  }}
                  style={galleryStyles.$radio}
                ></Radio>
                {/* </View> */}
              </View>
            </View>
          )}
        />
        <View style={modalStyles.$btnBox}>
          <ParallelWorldButton
            title="设为封面"
            disabled={selectedImg === undefined}
            onPress={handleCoverChange}
            style={modalStyles.$setCoverBtn}
          />
        </View>
      </View>
    </SheetModal>
  );
};

export default CoverChangeModal;

const modalStyles = createStyle({
  $header: {
    ...$flexHCenter,
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingTop: 20,
    paddingHorizontal: 20
  },
  $headerTextBox: { ...$flexHCenter, gap: 6 },
  $headerText: { fontSize: 16, fontWeight: '700', color: colors.white },
  $btnBox: {
    ...$flexHCenter,
    justifyContent: 'center',
    width: '100%',
    bottom: 0
  },
  $setCoverBtn: {
    backgroundColor: 'rgba(127, 217, 255, 1)',
    width: 260
  }
});

const galleryStyles = createStyle({
  $container: {
    flex: 1,
    alignItems: 'stretch',
    position: 'relative'
  },
  $item: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  $imgBox: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative'
  },
  $img: {
    backgroundColor: colors.white,
    borderRadius: 12
  },
  $radio: {
    position: 'absolute',
    bottom: 12,
    right: 12
  }
});
