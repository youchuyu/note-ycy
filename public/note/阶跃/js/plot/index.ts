import { PlotItemData, PlotResultData } from '@current/types'
import {
	VoiceValue,
	getAttributes,
	getAudio,
	getChoice,
	getImage,
	getPlot,
	getPoem,
	getState,
	getText,
	getVideo,
	getVoice
} from '../meta'
import {
	AttrsItem,
	AudioItem,
	ChoicesItem,
	ImageItem,
	PlotItem,
	PoemItem,
	StateItem,
	TextItem,
	VideoItem,
	VoiceItem
} from '@lipu/web-api/raccoon/instance/common_pb'
import {
	EndingPlotData,
	EndingProps,
	ItemTypes,
	ItemValueTypes,
	ProloguePlotData,
	PrologueProps,
	RoundItemKeys,
	RoundPlotData,
	RoundProps
} from './types'

type ValueMapping<T> = {
	[K in keyof T]: ItemValueTypes
}

export class BasicPlotModel<T extends Partial<{ [key: string]: ItemTypes }>> {
	value: Partial<T>
	data: Partial<ValueMapping<T>> = {}

	constructor(value: Partial<T>) {
		this.value = value
	}

	collectData<K extends keyof T>(key: K, item: T[K]) {
		if (item instanceof AttrsItem) {
			const dataItem = getAttributes(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof AudioItem) {
			const dataItem = getAudio(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof ChoicesItem) {
			const dataItem = getChoice(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof ImageItem) {
			const dataItem = getImage(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof PlotItem) {
			const dataItem = getPlot(item)
			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof PoemItem) {
			const dataItem = getPoem(item)
			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof StateItem) {
			const dataItem = getState(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof TextItem) {
			const dataItem = getText(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof VideoItem) {
			const dataItem = getVideo(item)

			this.value[key] = item
			this.data[key] = dataItem
		} else if (item instanceof VoiceItem) {
			// 声音文件处理
			const dataItem = getVoice(item)

			const length = dataItem[0]?.total

			const voices = (
				this.data[key]
					? [...(this.data[key] as VoiceValue)]
					: Array.from({ length })
			) as VoiceValue

			dataItem.forEach(v => {
				const idx = v.index
				voices[idx] = v
			})

			this.value[key] = item
			this.data[key] = voices
		}
	}

	removeData<K extends keyof T>(key: K) {
		this.value[key] = null
		this.data[key] = null
	}

	removeDataSet() {
		this.value = {}
		this.data = {}
	}

	getData<K extends keyof T>(key: K) {
		return this.value[key]
	}

	getFormatData<K extends keyof T>(key: K) {
		return this.data[key]
	}

	setDataSet(data: Partial<ValueMapping<T>>) {
		this.data = data
	}
	getFormatDataSet() {
		return { ...this.data }
	}
}

// 序幕
export class ProloguePlotModel extends BasicPlotModel<Partial<PrologueProps>> {
	constructor(props: Partial<PrologueProps> = {}) {
		super(props)
	}
	getFormatData<K extends keyof PrologueProps>(key: K): ProloguePlotData[K] {
		return super.getFormatData(key) as ProloguePlotData[K]
	}

	getFormatDataSet(): ProloguePlotData {
		return super.getFormatDataSet() as ProloguePlotData
	}
}

// 回合
export class RoundPlotModel extends BasicPlotModel<Partial<RoundProps>> {
	constructor(props: Partial<RoundProps> = {}) {
		super(props)
	}

	getFormatData<K extends keyof RoundProps>(key: K): RoundPlotData[K] {
		return super.getFormatData(key) as RoundPlotData[K]
	}

	getFormatDataSet(): RoundPlotData {
		return super.getFormatDataSet() as RoundPlotData
	}
}

// 结局
export class EndingPlotModel extends BasicPlotModel<Partial<EndingProps>> {
	constructor(props: Partial<EndingProps> = {}) {
		super(props)
	}

	getFormatData<K extends keyof EndingProps>(key: K): EndingPlotData[K] {
		return super.getFormatData(key) as EndingPlotData[K]
	}

	getFormatDataSet(): EndingPlotData {
		return super.getFormatDataSet() as EndingPlotData
	}
}
