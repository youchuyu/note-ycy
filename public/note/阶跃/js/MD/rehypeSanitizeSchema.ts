import { defaultSchema } from 'rehype-sanitize';

export const rehypeSanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,

    // 允许所有标签使用 class、id、style、data-*
    '*': [
      ...(defaultSchema.attributes?.['*'] || []),
      ['className'],
      ['id'],
      ['style'],
      /^data-[\w-]+$/, // 正则匹配 data-* 属性
    ],

    // 额外允许 a 标签的 target 和 rel
    a: [...(defaultSchema.attributes?.a || []), ['target'], ['rel']],

    // 额外允许 img 的 data-src
    img: [...(defaultSchema.attributes?.img || []), ['data-src']],
  },
  tagNames: [...(defaultSchema.tagNames || []), 'span', 'div', 'mjx', 'mjx-container', 'svg', 'path'],
};
