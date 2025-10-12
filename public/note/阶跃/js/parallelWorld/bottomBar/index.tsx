import { useEffect } from 'react';
import { TouchableOpacity, View, ViewStyle } from 'react-native';
import { StyleSheet } from '@/src/utils';
import { Icon } from '@Components/icons';
import { showVoiceModal } from '@BizComponents/parallelWorld/voiceModal';

interface BottomBarProps {
  renderRight: () => React.ReactNode;
}
export function BottomBar(props: BottomBarProps) {
  useEffect(() => {}, []);
  return (
    <View style={$conatinerStyle}>
      <TouchableOpacity style={$iconSetting} onPress={openSetting}>
        <Icon icon="world_setting" />
      </TouchableOpacity>
      {props.renderRight()}
    </View>
  );

  function openSetting() {
    showVoiceModal();
  }
}

const $conatinerStyle: ViewStyle = {
  paddingLeft: 20,
  ...StyleSheet.rowStyle,
  width: '100%',
  justifyContent: 'space-between'
};

const $iconSetting: ViewStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: 46,
  height: 46,
  backgroundColor: StyleSheet.hex('#476987', 0.1),
  borderRadius: 12
};
