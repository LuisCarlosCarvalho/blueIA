export function isTextEditingTarget(target: Pick<HTMLElement, 'isContentEditable' | 'closest'>): boolean {
  return target.isContentEditable || Boolean(target.closest('input, textarea, select, [contenteditable="true"], [contenteditable=""]'))
}
