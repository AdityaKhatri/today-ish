import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 24, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    ...props,
  }
}

/** Line icons inherit color via `currentColor`; set `color` on the parent. */

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M4 11L12 4L20 11V20H14V14H10V20H4V11Z"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinejoin="round"
    />
  </svg>
)

export const TasksIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="5" width="4" height="4" rx="1" stroke="currentColor" strokeWidth={1.6} />
    <line x1="10" y1="7" x2="20" y2="7" stroke="currentColor" strokeWidth={1.6} />
    <rect x="4" y="15" width="4" height="4" rx="1" stroke="currentColor" strokeWidth={1.6} />
    <line x1="10" y1="17" x2="20" y2="17" stroke="currentColor" strokeWidth={1.6} />
  </svg>
)

export const RoutinesIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M4 8H16L13 5M20 16H8L11 19"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.6} />
    <path
      d="M12 3V5.5M12 18.5V21M21 12H18.5M5.5 12H3M18.4 5.6L16.6 7.4M7.4 16.6L5.6 18.4M18.4 18.4L16.6 16.6M7.4 7.4L5.6 5.6"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </svg>
)

export const PlusIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
  </svg>
)

export const SparkleIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3L13.7 8.6L19 10L13.7 11.4L12 17L10.3 11.4L5 10L10.3 8.6L12 3Z" fill="currentColor" />
  </svg>
)

export const RefreshIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M4 4v5h5M20 20v-5h-5"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M5 12L10 17L19 7"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
  </svg>
)

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M12 4C9 4 7.5 6 7.5 9C7.5 14 5.5 15 5.5 16.5H18.5C18.5 15 16.5 14 16.5 9C16.5 6 15 4 12 4Z"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <path
      d="M10 18.5C10 19.6 10.9 20.5 12 20.5C13.1 20.5 14 19.6 14 18.5"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </svg>
)

export const ShareIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M12 3V15M12 3L8 7M12 3L16 7"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect x="5" y="14" width="14" height="7" rx="1.5" stroke="currentColor" strokeWidth={1.6} />
  </svg>
)

export const AddSquareIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth={1.6} />
    <path d="M9 12H15M12 9V15" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
  </svg>
)

export const FilterIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M4 6H20M7 12H17M10 18H14"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </svg>
)

export const SendIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path
      d="M4 12L20 4L14 20L11 13L4 12Z"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
  </svg>
)
