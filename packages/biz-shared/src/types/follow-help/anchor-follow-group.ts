import type { AnchorFrom87 } from './anchor-from-87';

export interface AnchorFollowGroup {
  id: string;
  org_id: string;
  name: string;
  anchors: Omit<AnchorFrom87, 'has_grouped'>[];
}

export interface AnchorFollowGroupWithAnchorIds {
  id: string;
  org_id: string;
  name: string;
  anchor_ids: string[];
}
