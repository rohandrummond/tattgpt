export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/&/g, 'and') /* Remove & symbols*/
    .replace(/['’‘ʼ]/g, '') /* Remove apostrophes */
    .replace(/[^a-z0-9]+/g, '-'); /* Replace spaces with hyphens */
}
