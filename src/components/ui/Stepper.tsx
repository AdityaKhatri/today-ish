import styles from './Stepper.module.css'

export function Stepper({
  value,
  onChange,
  min = 1,
  max = 12,
  renderValue,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  renderValue?: (value: number) => string
}) {
  return (
    <div className={styles.wrap}>
      <button
        type="button"
        className={styles.btn}
        aria-label="Decrease"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        −
      </button>
      <span className={styles.value}>{renderValue ? renderValue(value) : value}</span>
      <button
        type="button"
        className={styles.btn}
        aria-label="Increase"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        +
      </button>
    </div>
  )
}
