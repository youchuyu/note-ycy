import { TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { hideLoading, showLoading } from '@/src/components';
import { useWorldStore } from '@/src/store/world';
import { currentColors, typography } from '@/src/theme';
import { catchErrorLog } from '@/src/utils/error-log';
import { Image, ImageStyle } from '@Components/image';
import { Text } from '@Components/text';
import { showToast } from '@Components/toast';
import { StyleSheet } from '@Utils/StyleSheet';
import {
  QueryWorldRes,
  TimelinePlot
} from '@/proto-registry/src/web/raccoon/world/world_pb';

interface SectionCardProps {
  item: TimelinePlot;
  index: number;
  active: boolean;
  onClose: () => void;
}

const LOC = require('@Assets/icon/world/icon-location.png');
export default function SectionCard(props: SectionCardProps) {
  return (
    <TouchableOpacity
      style={[$itemStyle, props.active && { borderColor: '#A1D2FF' }]}
      onPress={onPress}
    >
      <View style={$avatarStyle}>
        <Image
          style={{ width: '100%', height: '100%' }}
          source={props.item.author?.avatar || ''}
          tosSize="size4"
        />
      </View>
      <View>
        <Text style={[$itemTextStyle, props.active && { color: '#A1D2FF' }]}>
          {!props.index
            ? '【序章】'
            : `第${props.index + 1}章 ${props.item.choice}`}
        </Text>
        <Text style={$authorStyle}>{props.item.author?.name?.trim()}</Text>
      </View>
      {props.active && <Image source={LOC} style={$locImage} />}
    </TouchableOpacity>
  );

  async function onPress() {
    try {
      showLoading();
      await useWorldStore.getState().gotoTL(props.index);
      hideLoading();
      props.onClose();
    } catch (error) {
      catchErrorLog('gototl', error);
      showToast('出错啦，请重试~');
      hideLoading();
    }
  }
}

const $itemStyle: ViewStyle = {
  position: 'relative',
  width: '100%',
  borderRadius: 10,
  ...StyleSheet.rowStyle,
  gap: 11,
  borderWidth: 1,
  borderColor: 'transparent',
  backgroundColor: StyleSheet.hex(currentColors.white, 0.05),
  paddingVertical: 14,
  paddingLeft: 17,
  paddingRight: 70,
  marginBottom: 10
};

const $itemTextStyle: TextStyle = {
  fontFamily: typography.fonts.world,
  color: '#ffffff',
  fontSize: 15,
  lineHeight: 20
};

const $avatarStyle: ViewStyle = {
  overflow: 'hidden',
  width: 25,
  height: 25,
  borderRadius: 16,
  borderWidth: 1,
  borderColor: currentColors.white
};

const $authorStyle: TextStyle = {
  fontSize: 10,
  lineHeight: 12,
  marginTop: 5,
  color: StyleSheet.hex(currentColors.white, 0.5)
};

const $locImage: ImageStyle = {
  position: 'absolute',
  top: -10,
  right: 10,
  width: 22,
  height: 32,
  resizeMode: 'contain'
};
