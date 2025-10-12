import React from 'react';
import { View } from 'react-native';
import {
  AVATAR_SIZE,
  parallelWorldColors
} from '@/src/bizComponents/parallelWorld/constants';
import { Icon } from '@/src/components';
import { useAuthStore } from '@/src/store/authInfo';
import { colors, typography } from '@/src/theme';
import { StyleSheet, createStyle } from '@/src/utils';
import { Text } from '@Components/text';
import { createCircleStyle } from '../../../theme/variable';
import AiPressableInput from '../others/AIPressableInput';
import UserDisplay from '../others/user-display';

interface WorldLineAiCardProps {
  onInput: () => void;
}

export default function ChoiceInputCard({ onInput }: WorldLineAiCardProps) {
  const userAvatar = useAuthStore(state => state.userInfo?.avatar);

  return (
    <AiPressableInput
      labelNode={<UserDisplay text="你" uri={userAvatar} />}
      textNode={
        <View
          style={{
            borderLeftWidth: 1,
            borderColor: 'rgba(256, 256, 256, 0.5)',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Text style={inputStyles.$enterNewWorldPlaceHolder}>
            我也来做决策...
          </Text>
          {/* <Icon icon="icon_edit_glow" size={16} /> */}
        </View>
      }
      onInputPress={onInput}
    />
  );
}

const inputStyles = StyleSheet.create({
  $enterNewWorldPlaceHolder: {
    // color: parallelWorldColors.fontGlow,
    color: 'rgba(256, 256, 256, 0.5)',
    fontSize: 18,
    fontFamily: typography.fonts.world,
    fontWeight: '400'
  },
  $avatar: {
    ...createCircleStyle(AVATAR_SIZE),
    borderWidth: 1,
    borderColor: colors.white
  }
});
