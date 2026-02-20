/**
 * Hook for retrieving waste type metadata (colors and labels).
 * Provides utility functions to get display information for waste types.
 */
export function useTypeMetadata() {
  /**
   * Gets the CSS classes for a waste type's badge color scheme.
   * @param type - Waste type identifier (plastic, glass, paper, metal)
   * @returns Tailwind CSS classes for background, text, and border colors
   */
  const getTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      plastic: 'bg-plastic-bg text-plastic border-plastic-border',
      glass: 'bg-glass-bg text-glass border-glass-border',
      paper: 'bg-paper-bg text-paper border-paper-border',
      metal: 'bg-metal-bg text-metal border-metal-border',
    }
    return colors[type] || ''
  }

  /**
   * Gets the human-readable label for a waste type.
   * @param type - Waste type identifier
   * @returns Translated label for display
   */
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      plastic: 'Plástico',
      glass: 'Vidro',
      paper: 'Papel',
      metal: 'Metal',
    }
    return labels[type] || type
  }

  return {
    getTypeColor,
    getTypeLabel,
  }
}
