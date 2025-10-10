import { EndingPlotModel, RoundPlotModel } from '.'
import { loadImg } from '../img'
import {
	AttrsItem,
	AudioItem,
	ChoicesItem,
	ImageItem,
	Item,
	PlotItem,
	PoemItem,
	StateItem,
	TargetItem,
	TextItem,
	VideoItem,
	VoiceItem
} from '@lipu/web-api/raccoon/instance/common_pb'
import { EndingItemKeys, RoundItemKeys } from './types'

export const updateRoundPlotModel = (
	plotModel: RoundPlotModel,
	items: Item[],
	preload = false
) => {
	items.forEach(itemData => {
		const { type, key, item } = itemData

		switch (key) {
			case RoundItemKeys.ROUND_NAME:
				if (item.value instanceof TextItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_ATTRS:
				if (item.value instanceof AttrsItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_EMOJI_VIDEO:
				if (item.value instanceof VideoItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_CHOICES:
				if (item.value instanceof ChoicesItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_PLOT:
				if (item.value instanceof PlotItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_PLOT_VOICE:
				if (item.value instanceof VoiceItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_PLOT_IMAGE:
				if (item.value instanceof ImageItem) {
					plotModel.collectData(key, item.value)
					if (preload) {
						const img = plotModel.getFormatData(key)
						loadImg(img.url, 'size2')
					}
				}
				break
			case RoundItemKeys.DECISION_PLOT:
				if (item.value instanceof PlotItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.DECISION_PLOT_IMAGE:
				if (item.value instanceof ImageItem) {
					plotModel.collectData(key, item.value)
					if (preload) {
						const img = plotModel.getFormatData(key)
						loadImg(img.url, 'size2')
					}
				}
				break
			case RoundItemKeys.DECISION_PLOT_VOICE:
				if (item.value instanceof VoiceItem) {
					console.log('DECISION_PLOT_VOICE===>', item)
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_RESULT_PLOT:
				if (item.value instanceof PlotItem) {
					console.log('ROUND_RESULT_PLOT===>', item)
					plotModel.collectData(key, item.value)
				}
				break
			case RoundItemKeys.ROUND_RESULT_PLOT_IMAGE:
				if (item.value instanceof ImageItem) {
					plotModel.collectData(key, item.value)
					if (preload) {
						const img = plotModel.getFormatData(key)
						loadImg(img.url, 'size2')
					}
				}
				break
			case RoundItemKeys.ROUND_RESULT_PLOT_VOICE:
				if (item.value instanceof VoiceItem) {
					console.log('ROUND_RESULT_PLOT_VOICE===>', item)
					plotModel.collectData(key, item.value)
				}
				break
		}
	})
}

export const updateEndingPlotModel = (
	plotModel: EndingPlotModel,
	items: Item[]
) => {
	items.forEach(itemData => {
		const { type, key, item } = itemData

		switch (key) {
			case EndingItemKeys.ENDING_GAME_STATE:
				if (item.value instanceof StateItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case EndingItemKeys.ENDING_PLOT_IMAGE:
				if (item.value instanceof ImageItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case EndingItemKeys.ENDING_PLOT:
				if (item.value instanceof PlotItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case EndingItemKeys.ENDING_EVALUATION:
				if (item.value instanceof AttrsItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case EndingItemKeys.ENDING_PLOT_VOICE:
				if (item.value instanceof VoiceItem) {
					plotModel.collectData(key, item.value)
				}
				break
			case EndingItemKeys.POEM:
				if (item.value instanceof PoemItem) {
					plotModel.collectData(key, item.value)
				}
				break
		}
	})
}
