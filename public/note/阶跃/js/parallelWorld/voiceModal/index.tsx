import { useEffect, useState } from 'react';
import { Pressable, Switch, TextStyle, View, ViewStyle } from 'react-native';
import { Icon } from '@/src/components';
import { showModal } from '@/src/components/popup/ModalGlobal';
import { useStorageStore } from '@/src/store/storage';
import { useWorldStore } from '@/src/store/world';
import { StyleSheet } from '@/src/utils';
import { Image } from '@Components/image';
import { Text } from '@Components/text';
import { useShallow } from 'zustand/react/shallow';

const BG = require('@Assets/image/parallel-world/pannel-bg.png');

interface VoiceModalProps {
  onClose: () => void;
}

interface VoiceSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
}
function VoiceSwitch(props: VoiceSwitchProps) {
  return (
    <Switch
      trackColor={{
        false: '#5D666D',
        true: '#6ED4FF'
      }}
      thumbColor={StyleSheet.currentColors.white}
      ios_backgroundColor={'#5D666D'}
      onValueChange={props.onChange}
      value={props.value}
    />
  );
}
export function VoiceModal(props: VoiceModalProps) {
  // const [localWorldAudio, setLocalAudio] = useState<boolean>(true);
  // const [localWorldMusic, setLocalMusic] = useState<boolean>(true);
  const { config } = useWorldStore(
    useShallow(state => ({ config: state.config }))
  );

  // useEffect(() => {
  //   const { worldAudio, worldMusic } = useStorageStore.getState();
  //   setLocalAudio(worldAudio);
  //   setLocalMusic(worldMusic);
  // }, []);
  // const { worldAudio, worldMusic } = useStorageStore(
  //   useShallow(state => ({
  //     worldAudio: state.worldAudio,
  //     worldMusic: state.worldMusic
  //   }))
  // );
  return (
    <View style={$mainStyle}>
      <Image source={BG} style={StyleSheet.absoluteFill} />
      <View style={$innerStyle}>
        <View
          style={[StyleSheet.rowStyle, { justifyContent: 'space-between' }]}
        >
          <View style={[StyleSheet.rowStyle, { gap: 10 }]}>
            <Icon size={14} icon="world_voice" />
            <Text style={$labelText}>声音</Text>
            {/* <Icon icon="world_music"/> */}
          </View>
          <VoiceSwitch value={config?.worldAudio} onChange={onChangeVoice} />
        </View>
        <View
          style={[
            StyleSheet.rowStyle,
            { justifyContent: 'space-between', marginTop: 20 }
          ]}
        >
          <View style={[StyleSheet.rowStyle, { gap: 10 }]}>
            <Icon size={14} icon="world_music" />
            <Text style={$labelText}>音乐</Text>
            {/* <Icon icon="world_music"/> */}
          </View>
          <VoiceSwitch value={config?.worldMusic} onChange={onChangeMusic} />
        </View>
      </View>
      <Pressable style={$closeStyle} onPress={props.onClose}></Pressable>
    </View>
  );

  function onChangeVoice(value: boolean) {
    useWorldStore.getState().setConfig({
      ...useWorldStore.getState().config,
      worldAudio: value
    });
  }

  function onChangeMusic(value: boolean) {
    // setLocalMusic(value);
    useWorldStore.getState().setConfig({
      ...useWorldStore.getState().config,
      worldMusic: value
    });
  }
}

export function showVoiceModal() {
  showModal({
    containerStyle: $containerStyle,
    // onClose={close} {...props}
    content: ({ close }) => <VoiceModal onClose={close} />
  });
}

const $containerStyle: ViewStyle = {
  padding: 0,
  backgroundColor: 'transparent',
  width: 290
};

const $mainStyle: ViewStyle = {
  width: 290,
  height: 211
};

const $closeStyle: ViewStyle = {
  position: 'absolute',
  width: 30,
  height: 30,
  top: 5,
  left: 222
};

const $labelText: TextStyle = {
  color: StyleSheet.currentColors.white,
  fontSize: 16,
  fontWeight: '900'
};

const $innerStyle: ViewStyle = {
  paddingHorizontal: 45,
  paddingTop: 82
};
