import type { ReactNode } from 'react'
import styles from './chat.module.css'

/** Inline **bold** only — the scripted replies never need more than this. */
function inline(text: string, keyPrefix: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).flatMap((part, index) => {
    if (!part) return []
    const key = `${keyPrefix}-${index}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return [<strong key={key}>{part.slice(2, -2)}</strong>]
    }
    return [<span key={key}>{part}</span>]
  })
}

/**
 * Minimal block renderer for the demo transcript: blank-line separated
 * paragraphs plus "- " bullet lists.
 */
export function RichText({ text, caret = false }: { text: string; caret?: boolean }) {
  const blocks = text.split(/\n{2,}/)

  return (
    <div className={styles.reply}>
      {blocks.map((block, blockIndex) => {
        const lines = block.split('\n')
        const isList = lines.every((line) => line.trimStart().startsWith('- '))
        const last = blockIndex === blocks.length - 1

        if (isList) {
          return (
            <ul key={blockIndex}>
              {lines.map((line, lineIndex) => (
                <li key={lineIndex}>
                  {inline(line.trimStart().slice(2), `${blockIndex}-${lineIndex}`)}
                  {caret && last && lineIndex === lines.length - 1 ? (
                    <span className={styles.caret} />
                  ) : null}
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={blockIndex}>
            {inline(block, String(blockIndex))}
            {caret && last ? <span className={styles.caret} /> : null}
          </p>
        )
      })}
    </div>
  )
}
