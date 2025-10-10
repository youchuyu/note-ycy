import {
	AttributesValue,
	AudioValue,
	ChoiceValue,
	ImageValue,
	PlotValue,
	PoemValue,
	StateValue,
	TargetValue,
	TextValue,
	VideoValue,
	VoiceValue
} from '@current/utils/meta'
import {
	AttrsItem,
	AudioItem,
	ChoicesItem,
	ImageItem,
	PlotItem,
	PoemItem,
	StateItem,
	TargetItem,
	TextItem,
	VideoItem,
	VoiceItem
} from '@lipu/web-api/raccoon/instance/common_pb'

export type ItemTypes =
	| AttrsItem
	| AudioItem
	| ChoicesItem
	| TargetItem
	| ImageItem
	| PlotItem
	| PoemItem
	| StateItem
	| TextItem
	| VideoItem
	| VoiceItem

export type ItemValueTypes =
	| AttributesValue
	| AudioValue
	| ChoiceValue
	| ImageValue
	| PlotValue
	| PoemValue
	| StateValue
	| TargetValue
	| TextValue
	| VideoValue
	| VoiceValue

// 序幕
export enum PrologueItemKeys {
	INSTANCE_NAME = 'instance_name',
	TARGET = 'target',
	ATTRS = 'attrs',
	BGM = 'bgm',
	PROLOGUE_PLOT = 'prologue_plot',
	PROLOGUE_PLOT_IMAGE = 'prologue_plot_image',
	PROLOGUE_PLOT_VOICE = 'prologue_plot_voice'
}

export interface PrologueProps {
	[PrologueItemKeys.INSTANCE_NAME]: TextItem
	[PrologueItemKeys.TARGET]: TargetItem
	[PrologueItemKeys.ATTRS]: AttrsItem
	[PrologueItemKeys.BGM]: AudioItem
	[PrologueItemKeys.PROLOGUE_PLOT]: PlotItem
	[PrologueItemKeys.PROLOGUE_PLOT_IMAGE]: ImageItem
	[PrologueItemKeys.PROLOGUE_PLOT_VOICE]: VoiceItem
}

export interface ProloguePlotData {
	[PrologueItemKeys.INSTANCE_NAME]: TextValue
	[PrologueItemKeys.TARGET]: TargetValue
	[PrologueItemKeys.ATTRS]: AttributesValue
	[PrologueItemKeys.BGM]: AudioValue
	[PrologueItemKeys.PROLOGUE_PLOT]: PlotValue
	[PrologueItemKeys.PROLOGUE_PLOT_IMAGE]: ImageValue
	[PrologueItemKeys.PROLOGUE_PLOT_VOICE]: VoiceValue
}

// 回合
export enum RoundItemKeys {
	// 基本信息
	ROUND_NAME = 'round_name',
	ROUND_ATTRS = 'round_attrs',
	ROUND_EMOJI_VIDEO = 'round_emoji_video',
	// plot
	ROUND_PLOT = 'round_plot',
	ROUND_PLOT_VOICE = 'round_plot_voice',
	ROUND_PLOT_IMAGE = 'round_plot_image',
	// 选项
	ROUND_CHOICES = 'round_choices',
	DECISION_PLOT = 'decision_plot',
	DECISION_PLOT_IMAGE = 'decision_plot_image',
	DECISION_PLOT_VOICE = 'decision_plot_voice',
	// 结果
	ROUND_RESULT_PLOT = 'round_result_plot',
	ROUND_RESULT_PLOT_VOICE = 'round_result_plot_voice',
	ROUND_RESULT_PLOT_IMAGE = 'round_result_plot_image'
}

export interface RoundProps {
	[RoundItemKeys.ROUND_NAME]: TextItem
	[RoundItemKeys.ROUND_ATTRS]: AttrsItem
	[RoundItemKeys.ROUND_EMOJI_VIDEO]: VideoItem
	[RoundItemKeys.ROUND_CHOICES]: ChoicesItem
	[RoundItemKeys.ROUND_PLOT]: PlotItem
	[RoundItemKeys.ROUND_PLOT_VOICE]: VoiceItem
	[RoundItemKeys.ROUND_PLOT_IMAGE]: ImageItem
	[RoundItemKeys.DECISION_PLOT]: PlotItem
	[RoundItemKeys.DECISION_PLOT_IMAGE]: ImageItem
	[RoundItemKeys.DECISION_PLOT_VOICE]: VoiceItem
	[RoundItemKeys.ROUND_RESULT_PLOT]: PlotItem
	[RoundItemKeys.ROUND_RESULT_PLOT_VOICE]: VoiceItem
	[RoundItemKeys.ROUND_RESULT_PLOT_IMAGE]: ImageItem
}

export interface RoundPlotData {
	[RoundItemKeys.ROUND_NAME]: TextValue
	[RoundItemKeys.ROUND_ATTRS]: AttributesValue
	[RoundItemKeys.ROUND_EMOJI_VIDEO]: VideoValue
	[RoundItemKeys.ROUND_CHOICES]: ChoiceValue
	[RoundItemKeys.ROUND_PLOT]: PlotValue
	[RoundItemKeys.ROUND_PLOT_VOICE]: VoiceValue
	[RoundItemKeys.ROUND_PLOT_IMAGE]: ImageValue
	[RoundItemKeys.DECISION_PLOT]: PlotValue
	[RoundItemKeys.DECISION_PLOT_IMAGE]: ImageValue
	[RoundItemKeys.DECISION_PLOT_VOICE]: VoiceValue
	[RoundItemKeys.ROUND_RESULT_PLOT]: PlotValue
	[RoundItemKeys.ROUND_RESULT_PLOT_VOICE]: VoiceValue
	[RoundItemKeys.ROUND_RESULT_PLOT_IMAGE]: ImageValue
}

// 结果
export enum EndingItemKeys {
	ENDING_GAME_STATE = 'ending_game_state',
	ENDING_PLOT_IMAGE = 'ending_plot_image',
	ENDING_PLOT = 'ending_plot',
	ENDING_EVALUATION = 'ending_evaluation',
	ENDING_PLOT_VOICE = 'ending_plot_voice',
	POEM = 'poem'
}

export interface EndingProps {
	[EndingItemKeys.ENDING_GAME_STATE]: StateItem
	[EndingItemKeys.ENDING_PLOT_IMAGE]: ImageItem
	[EndingItemKeys.ENDING_PLOT]: PlotItem
	[EndingItemKeys.ENDING_EVALUATION]: AttrsItem
	[EndingItemKeys.ENDING_PLOT_VOICE]: VoiceItem
	[EndingItemKeys.POEM]: PoemItem
}

export interface EndingPlotData {
	[EndingItemKeys.ENDING_GAME_STATE]: StateValue
	[EndingItemKeys.ENDING_PLOT_IMAGE]: ImageValue
	[EndingItemKeys.ENDING_PLOT]: PlotValue
	[EndingItemKeys.ENDING_EVALUATION]: AttributesValue
	[EndingItemKeys.ENDING_PLOT_VOICE]: VoiceValue
	[EndingItemKeys.POEM]: PoemValue
}
