import { TIKTOK_URL } from '../constants';

export function getTiktokAnchorLink(
  anchor: {
    display_id: string;
    user_id: string;
  },
  isInMobile: boolean,
) {
  if (isInMobile) {
    return `snssdk1180://user/profile/${anchor.user_id}?refer=web&gd_label=click_wap_download_follow&type=need_follow&needlaunchlog=1`;
  }
  return `${TIKTOK_URL}/@${anchor.display_id}`;
}
