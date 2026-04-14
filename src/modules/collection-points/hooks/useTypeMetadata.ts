/**
 * Hook for retrieving waste type metadata (colors and labels).
 * Provides utility functions to get display information for waste types.
 */
export function useTypeMetadata() {
  /**
   * Gets the CSS classes for a waste type's badge color scheme.
   * @param type - Waste type identifier
   * @returns Tailwind CSS classes for background, text, and border colors
   */
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      packaging: 'bg-paper-bg text-paper border-paper-border',
      plastic: 'bg-plastic-bg text-plastic border-plastic-border',
      glass: 'bg-glass-bg text-glass border-glass-border',
      paper: 'bg-paper-bg text-paper border-paper-border',
      metal: 'bg-metal-bg text-metal border-metal-border',
      batteries: 'bg-warning/10 text-warning border-warning/30',
    }
    if (type === 'plastic' || type === 'metal') {
      return colors.packaging
    }
    return colors[type] || 'bg-base-200 text-base-content border-base-300'
  }

  /**
   * Gets the human-readable label for a waste type.
   * @param type - Waste type identifier
   * @returns Translated label for display
   */
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      packaging: 'Embalagens',
      plastic: 'Embalagens',
      glass: 'Vidro',
      paper: 'Papel e Cartão',
      metal: 'Embalagens',
      batteries: 'Pilhas',
    }
    return labels[type] || type
  }

  return {
    getTypeColor,
    getTypeLabel,
  }
}
