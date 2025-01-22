import { defineConfig, passthroughImageService } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [[rehypeKatex, {
      // Katex plugin options
    }]]
  },

  image: {
    service: passthroughImageService()
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src'
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern'
        }
      }
    }
  },
  site: 'https://astro.koibumi.art/',
  integrations: [mdx(), sitemap(), solidJs()]
});