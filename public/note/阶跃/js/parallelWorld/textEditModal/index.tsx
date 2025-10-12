import { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { Icon } from '@/src/components';
import { usePersistFn } from '@/src/hooks';
import { ModalType, useWorldStore } from '@/src/store/world';
import { catchErrorLog } from '@/src/utils/error-log';
import { log } from '@/src/utils/logger';
import { reportClick } from '@/src/utils/report';
import { Modal } from '@Components/modal';
import { showToast } from '@Components/toast';
import { StyleSheet, createStyle } from '@Utils/StyleSheet';
import { isIos } from '@Utils/platform';
import {
  ActItem,
  ActType
} from '@/proto-registry/src/web/raccoon/world/common_pb';
import { ActStory } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { ActDialog } from '@/proto-registry/src/web/raccoon/world/common_pb';
import { WorldAct } from '@/proto-registry/src/web/raccoon/world/common_pb';
import InfoCard from '@BizComponents/parallelWorld/infoCard';
import { useShallow } from 'zustand/react/shallow';

export function TextEditModal() {
  const { visible, hideModal, modalData } = useWorldStore(
    useShallow(state => {
      return {
        visible: state.checkModalVisible(ModalType.TEXT_EDIT),
        hideModal: state.hideModal,
        modalData: state.modalData
      };
    })
  );
  const [currentText, setCurrentText] = useState('');
  const textInputRef = useRef<TextInput>(null);

  const onConfirm = usePersistFn(() => {
    if (!currentText.length) {
      showToast('对话内容不可为空');
      return;
    }
    const { index } = modalData;
    const { currentWorld, changeLoading, updateCacheAct, hideModal } =
      useWorldStore.getState();

    const currentActControl = currentWorld?.getCurrentPlot()?.getCurrentAct();

    const currentAct = currentActControl?.act;

    const currentActItem = currentAct?.actItems;

    // alert(index);
    // alert(currentText);
    const newActItem = currentActItem?.map((item, i) => {
      if (i === index) {
        switch (item.type) {
          case ActType.Dialog:
            log.log('ActType.Dialog', { v: currentText });
            return new ActItem({
              type: item.type,
              item: {
                case: 'dialog',
                value: new ActDialog({
                  ...item.item?.value,
                  text: currentText,
                  // @ts-ignore
                  ttsTaskId: item.item?.value?.ttsTaskId ? 'PENDING' : '',
                  ttsUrl: undefined
                })
              }
            });
          case ActType.Story:
            return new ActItem({
              type: item.type,
              item: {
                case: 'story',
                value: new ActStory({
                  ...item.item?.value,
                  text: currentText
                })
              }
            });
          default:
            return new ActItem(item);
        }
      }
      return new ActItem(item);
    });

    log.log('textEdit', { index, currentText, currentActItem, newActItem });

    updateCacheAct({
      actItems: newActItem
    });

    hideModal();

    // todo 要报一个actId
    reportClick('world_editing', {
      contentid: currentWorld?.cardId,
      script_contentid: index + '',
      image_contentid: '',
      world_editing_button: 1
    });
  });

  useEffect(() => {
    const { modalData } = useWorldStore.getState();
    if (visible) {
      if (isIos) {
        setTimeout(() => {
          textInputRef.current?.focus();
          setCurrentText(modalData.text);
        }, 30);
      } else {
        setTimeout(() => {
          textInputRef.current?.focus();
          setCurrentText(modalData.text);
        }, 300);
      }
    }
  }, [visible]);
  return (
    <Modal visible={visible} onRequestClose={hideModal} transparent>
      <KeyboardAvoidingView
        behavior={isIos ? 'height' : undefined}
        style={[
          StyleSheet.absoluteFill,
          {
            zIndex: 100
          }
        ]}
      >
        <View style={modalStyle.$modal}>
          <View onTouchStart={hideModal} style={modalStyle.$placeholder}></View>
          <View style={modalStyle.$innerWrap}>
            <InfoCard
              cardStyle={{
                backgroundColor: StyleSheet.currentColors.white,
                flex: 1
              }}
              isBgPicVisible={false}
            >
              <View style={modalStyle.$inputWrap}>
                <TextInput
                  ref={textInputRef}
                  allowFontScaling={false}
                  multiline={true}
                  style={[modalStyle.$input]}
                  value={currentText}
                  scrollEnabled={false}
                  onChangeText={text => {
                    if (text.length > 80) {
                      showToast('文字已达到上限80字');
                      return;
                    }
                    setCurrentText(text);
                  }}
                  returnKeyLabel="确定"
                  enablesReturnKeyAutomatically
                  maxLength={80}
                />
              </View>
            </InfoCard>
            <View style={modalStyle.$confirmBtn}>
              <TouchableOpacity onPress={onConfirm}>
                <Icon icon="world_confirm" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

interface TextData {
  text: string;
  index: number; // 编辑的第几句文本
}

export function showTextEditModal(data: TextData) {
  useWorldStore.getState().showModal(ModalType.TEXT_EDIT, data);
}

const modalStyle = createStyle({
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
    flexShrink: 1,
    width: '100%',
    height: '100%'
  },

  $inputWrap: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  $input: {
    fontSize: 14,
    fontWeight: '600',
    color: StyleSheet.currentColors.black
  },
  $innerWrap: {
    ...StyleSheet.rowStyle,
    width: '100%'
  },
  $confirmBtn: {
    ...StyleSheet.rowStyle,
    paddingRight: 12,
    alignItems: 'center',
    height: '100%',
    backgroundColor: StyleSheet.currentColors.white
  }
});
