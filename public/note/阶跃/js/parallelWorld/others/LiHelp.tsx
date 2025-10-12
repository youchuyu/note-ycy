import React from 'react';
import { Pressable, Text, TextStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { parallelWorldColors } from '@/src/bizComponents/parallelWorld/constants';
import { Icon, IconTypes } from '@/src/components';
import { $flexHCenter } from '@/src/theme/variable';

export const CHOICE_LOADING_TIP = '绞尽脑汁中...';
export const CHOICE_FAIL_TIP = '小狸脑子裂开咯～请重试';

export default function LiHelp({
  onPress,
  disabled = false,
  backgroundColors,
  icon = 'li_help2',
  textStyle
}: {
  onPress: () => void;
  disabled?: boolean;
  backgroundColors?: string[];
  icon?: IconTypes;
  textStyle?: TextStyle;
}) {
  const $textStyle = textStyle;
  return (
    <Pressable
      style={{
        backgroundColor: backgroundColors ? backgroundColors[0] : '#fff',
        borderRadius: 8
      }}
      onPress={onPress}
      disabled={disabled}
    >
      <LinearGradient
        colors={
          backgroundColors || ['rgb(256, 256, 256)', 'rgba(87, 175, 238, 0.3)']
        }
        start={{ x: 1, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={[
          $flexHCenter,
          {
            borderRadius: 8,
            opacity: disabled ? 0.6 : 1,
            height: 30,
            width: 82,
            justifyContent: 'center'
          }
        ]}
      >
        <Icon icon={icon} />
        <Text
          style={[
            {
              color: 'rgba(59, 152, 219, 1)',
              fontSize: 12,
              fontWeight: '500'
            },
            $textStyle
          ]}
        >
          来点灵感
        </Text>
      </LinearGradient>
    </Pressable>
  );
}
