import type { Component } from 'vue';
import { defineComponent, h } from 'vue';
import { useGlobalStore } from '../../utils';
import NoMembershipView from './no-membership-view.vue';

export function WithMembershipCheck<T extends Component>(WrappedComponent: T) {
  return defineComponent({
    name: `WithMembershipCheck${
      typeof WrappedComponent === 'object' && 'name' in WrappedComponent
        ? WrappedComponent.name
        : ''
    }`,

    // 继承原组件的props定义
    props:
      'props' in WrappedComponent && typeof WrappedComponent.props === 'object'
        ? WrappedComponent.props
        : undefined,

    setup(props, { slots, attrs }) {
      const globalStore = useGlobalStore();

      // 检查会员权限
      if (!globalStore.userProfile.hasMembership) {
        return () => h(NoMembershipView);
      }

      // 渲染原始组件
      return () =>
        h(
          WrappedComponent,
          {
            ...props,
            ...attrs,
          },
          slots,
        );
    },
  }) as T;
}
