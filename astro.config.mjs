import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://hyemin-ht-kang.github.io',
  base: '/learn-claude-code',
  integrations: [
    starlight({
      title: 'Claude Code 소스 코드 Deep Dive',
      defaultLocale: 'root',
      locales: {
        root: { label: '한국어', lang: 'ko' },
      },
      components: {
        MarkdownContent: './src/components/overrides/MarkdownContent.astro',
      },
      sidebar: [
        { label: '01. 핵심 아키텍처', autogenerate: { directory: '01-core-architecture' } },
        { label: '02. 도구 시스템', autogenerate: { directory: '02-tool-system' } },
        { label: '03. 에이전트 지능', autogenerate: { directory: '03-agent-intelligence' } },
        { label: '04. 권한과 보안', autogenerate: { directory: '04-permissions-security' } },
        { label: '05. 메모리와 컨텍스트', autogenerate: { directory: '05-memory-context' } },
        { label: '06. 인터페이스와 UI', autogenerate: { directory: '06-interface-ui' } },
        { label: '07. 인프라스트럭처', autogenerate: { directory: '07-infrastructure' } },
        { label: '08. 연결성과 확장', autogenerate: { directory: '08-connectivity' } },
        { label: '09. SDK와 프로그래매틱 사용', autogenerate: { directory: '09-sdk-programmatic' } },
        { label: '10. 미공개 기능과 전체 조망', autogenerate: { directory: '10-unreleased-bigpicture' } },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
    react(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
