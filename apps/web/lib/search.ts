export type SearchResult = {
  url: string;
  title: string;
  excerpt: string;
};

let pagefind: any = null;

/** Load the Pagefind runtime */
export async function initSearch() {
  if (pagefind) return;
  await import('/pagefind/pagefind.js');
  pagefind = (window as any).pagefind;
}

/** Perform a search query */
export async function search(query: string): Promise<SearchResult[]> {
  await initSearch();
  if (!pagefind) return [];
  const results = await pagefind.search(query);
  const hits = await Promise.all(
    results.results.map(async (r: any) => {
      const { url, meta } = await r;
      const { title, description } = meta;
      return {
        url,
        title: title || '',
        excerpt: description || '',
      } as SearchResult;
    })
  );
  return hits;
}
