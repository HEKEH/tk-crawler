export interface TkAccount {
  /** 不准 */
  user_id: number;
  /** 准 */
  user_id_str: string;
  odin_user_type: number;
  sec_user_id: string;
  screen_name: string;
  avatar_url: string;
  description: string;
  mobile: string;
  email: string;
  username: string;
  has_password: number;
  create_time: number;
  connects: any[]; // 需要根据实际内容细化类型
  session_key: string;
  country_code: number;
  app_id: number;
  is_employee: boolean;
  external_employee_platform: string;
}
