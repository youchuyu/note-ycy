import { create } from 'zustand';
import { CHOICE_LOADING_TIP } from '@/src/bizComponents/parallelWorld/others/LiHelp';
import { log } from '@/src/utils/logger';
import { showToast } from '@Components/toast';
import {
  CreateWorldTitleRequest,
  PublishWorldRequest,
  createParallelWorldTitle,
  publishParallelWorld
} from '../../api/parallel-world/publish';
import { ReportError, errorReport } from '../../utils/error-log';
import { ActImage } from '@/proto-registry/src/web/raccoon/world/common_pb';

/** 详情 */
type States = {
  isChangeCoverModalVisible: boolean;
  title: string;
  isCreatingTitle: boolean;
  coverImg: ActImage | null;
};

type Actions = {
  reset: () => void;
  openChangeCoverModal: () => void;
  closeChangeCoverModal: () => void;
  changeTitle: (text: string) => void;
  createTitle: (payload: CreateWorldTitleRequest) => Promise<void>;
  changeCoverImg: (img: ActImage | null) => void;
};

const getDefaultStates = (): States => ({
  isChangeCoverModalVisible: false,
  title: '',
  isCreatingTitle: false,
  coverImg: null
});

export const useParallelWorldPublishStore = create<States & Actions>()(
  (set, get) => ({
    ...getDefaultStates(),
    reset: () => {
      set(getDefaultStates());
    },
    openChangeCoverModal() {
      set({ isChangeCoverModalVisible: true });
    },
    closeChangeCoverModal() {
      set({ isChangeCoverModalVisible: false });
    },
    changeCoverImg(imgUrl) {
      set({ coverImg: imgUrl });
    },
    // 创建新世界的提示词
    changeTitle(text) {
      set({ title: text });
    },
    // 小狸帮想
    async createTitle(payload) {
      if (!payload.cardId) {
        log.log('createTitle_error', payload);
        showToast('失败了，请重试~');
        return;
      }
      set({ isCreatingTitle: true, title: CHOICE_LOADING_TIP });
      try {
        const res = await createParallelWorldTitle(
          payload,
          d => {
            console.log('createPlotChoice----------->res', d);
            set({
              title: d?.title ?? ''
            });
            setTimeout(() => {
              set({ isCreatingTitle: false });
            }, 300);
          },
          e => {
            console.log('createPlotChoice ERROR: ', e);
            set({
              title: '失败了W(ﾟДﾟ)W，请重试',
              isCreatingTitle: false
            });
          }
        );
        console.log('createTitle------------>', res);
      } catch (e) {
        errorReport('createTitle', ReportError.STORE, e);
      }
    }
  })
);
