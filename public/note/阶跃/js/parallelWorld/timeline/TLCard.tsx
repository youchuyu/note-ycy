import { TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { showLoading } from '@/src/components';
import { useWorldStore } from '@/src/store/world';
import { currentColors, typography } from '@/src/theme';
import { catchErrorLog } from '@/src/utils/error-log';
import { Image } from '@Components/image';
import { Text } from '@Components/text';
import { showToast } from '@Components/toast';
import {
  QueryWorldRes,
  TimelinePlot
} from '@/proto-registry/src/web/raccoon/world/world_pb';

interface TLCardProps {
  item: TimelinePlot;
  index: number;
  active: boolean;
}
export default function TLCrad(props: TLCardProps) {
  return (
    <TouchableOpacity
      style={[$itemStyle, props.active && { borderColor: '#A1D2FF' }]}
      onPress={onPress}
    >
      <Text numberOfLines={2} style={$itemTextStyle}>
        {!props.index
          ? '【序章】'
          : `第${props.index + 1}章 ${props.item.choice}`}
      </Text>
      <View style={$avatarStyle}>
        <Image
          style={{ width: '100%', height: '100%' }}
          source={props.item.author?.avatar || ''}
          tosSize="size6"
        />
      </View>
    </TouchableOpacity>
  );

  async function onPress() {
    try {
      await useWorldStore.getState().gotoTL(props.index);
    } catch (error) {
      catchErrorLog('gototl', error);
      showToast('出错啦，请重试~');
    }
  }
}

const $itemStyle: ViewStyle = {
  position: 'relative',
  width: 135,
  height: 50,
  borderRadius: 10,

  borderWidth: 1,
  backgroundColor: 'rgba(255,255,255,.1)',
  marginRight: 6,
  paddingTop: 6,
  paddingLeft: 6,
  paddingRight: 17,
  paddingBottom: 6
};

const $itemTextStyle: TextStyle = {
  fontFamily: typography.fonts.world,
  color: '#ffffff',
  fontSize: 11,
  lineHeight: 14
};

const $avatarStyle: ViewStyle = {
  position: 'absolute',
  bottom: 7,
  right: 5,
  overflow: 'hidden',
  width: 16,
  height: 16,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: currentColors.white
};
