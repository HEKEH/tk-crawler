import assert from 'node:assert';
// import { UserModel } from '@yx-chat/database';
import { BusinessError, parseToken } from '../utils';

export async function authToken(token: string | undefined) {
  assert(token, 'Token cannot be empty');
  let payload: ReturnType<typeof parseToken> | undefined;
  try {
    payload = parseToken(token);
    // eslint-disable-next-line unused-imports/no-unused-vars, ts/no-unused-vars
  } catch (error: any) {
    throw new BusinessError('Illegal token');
  }
  assert(Date.now() < payload.expires, 'Token expires');
  const { userId } = payload;

  // TODO: 删除
  return {
    payload,
    userInfo: {
      id: userId,
      avatar: '',
      username: '',
      tag: '',
      isAdmin: false,
    },
  };

  // TODO: 释放
  // const user = await UserModel.findOne(
  //   { _id: userId },
  //   {
  //     avatar: 1,
  //     username: 1,
  //     tag: 1,
  //     createTime: 1,
  //   },
  // );
  // if (!user) {
  //   throw new BusinessError("User does't exist");
  // }
  // return {
  //   payload,
  //   userInfo: {
  //     id: userId,
  //     avatar: user.avatar,
  //     username: user.username,
  //     tag: user.tag,
  //     isAdmin: user.isAdmin,
  //   },
  // };
}
