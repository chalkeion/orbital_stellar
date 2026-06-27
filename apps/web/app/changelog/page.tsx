import fs from 'fs';
import path from 'path';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Project changelog',
};

async function getChangelog(): Promise<string> {
  const filePath = path.join(process.cwd(), 'CHANGELOG.md');
  return await fs.promises.readFile(filePath, 'utf8');
}

export default async function ChangelogPage() {
  const markdown = await getChangelog();
  return (
    <section className="prose prose-sm max-w-3xl mx-auto py-8">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]]}
      >
        {markdown}
      </ReactMarkdown>
    </section>
  );
}
