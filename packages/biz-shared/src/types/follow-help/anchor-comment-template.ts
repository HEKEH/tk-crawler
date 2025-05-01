export interface AnchorCommentTemplate {
  id: string;
  org_id: string;
  group_id: string;
  content: string;
  label: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AnchorCommentTemplateGroup {
  id: string;
  org_id: string;
  name: string;
  templates_count: number;
  created_at: Date | string;
  updated_at: Date | string;
}
