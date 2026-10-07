// The Rime barrel. Screens compose these; they do not restyle them. Every
// component is documented at / (and /llms.txt), and themed by tokens.css.

export * from "./Icon/Icon";
export { Spinner, type SpinnerProps } from "./Spinner/Spinner";
export {
  Button,
  buttonClassName,
  buttonVariants,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from "./Button/Button";
export { IconButton, type IconButtonProps } from "./IconButton/IconButton";
export { GlassPanel, type GlassPanelProps } from "./GlassPanel/GlassPanel";
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, type CardProps } from "./Card/Card";
export { Field, useField, mergeDescribedBy, type FieldProps } from "./Field/Field";
export { TextInput, type TextInputProps } from "./TextInput/TextInput";
export { PrefixedInput, type PrefixedInputProps } from "./PrefixedInput/PrefixedInput";
export { codeBodyFrom, isCompleteCode, toPrefixedCode, type PrefixedFormat } from "./PrefixedInput/prefixed";
export { SearchField, type SearchFieldProps } from "./SearchField/SearchField";
export { NavSearch, type NavSearchItem, type NavSearchProps } from "./NavSearch/NavSearch";
export {
  SmartSearch,
  type SmartSearchGroup,
  type SmartSearchProps,
  type SmartSearchResult,
  type SmartSearchResultState,
  type SmartSearchSelectContext,
} from "./SmartSearch/SmartSearch";
export { prefixedIdVariants, highlightTokens, normalise, smartMatches, smartTokens } from "./SmartSearch/smart-match";
export { Textarea, type TextareaProps } from "./Textarea/Textarea";
export { Select, type SelectOption, type SelectProps } from "./Select/Select";
export { Checkbox, type CheckboxProps } from "./Checkbox/Checkbox";
export { RadioGroup, type RadioOption, type RadioGroupProps } from "./RadioGroup/RadioGroup";
export { Switch, type SwitchProps } from "./Switch/Switch";
export { OtpInput, type OtpInputProps } from "./OtpInput/OtpInput";
export { FileDrop, FileChip, formatBytes, type FileDropProps, type FileChipProps } from "./FileDrop/FileDrop";
export { Calendar, nextRange, type CalendarProps, type DateRange } from "./DateField/Calendar";
export { DateField, type DateFieldProps } from "./DateField/DateField";
export * from "./DateField/date-utils";
export { DateRangeFilter, type DateRangeFilterProps } from "./DateRangeFilter/DateRangeFilter";
export { TimeField, TimeRangeField, type TimeFieldProps, type TimeRangeFieldProps, type TimeRange } from "./TimeField/TimeField";
export * from "./TimeField/time-utils";
export {
  DEFAULT_DATE_RANGE_PRESETS,
  formatDateRange,
  type DateRangePreset,
} from "./DateRangeFilter/range-utils";
export {
  StatusPill,
  Badge,
  CountBadge,
  type Tone,
  type StatusPillProps,
  type BadgeProps,
  type CountBadgeProps,
} from "./Badge/Badge";
export {
  FolderTabs,
  SegmentedControl,
  type FolderTab,
  type FolderTabsProps,
  type TabColour,
  type SegmentedOption,
  type SegmentedControlProps,
} from "./Tabs/Tabs";
export { FilterChip, FilterSearch, type FilterChipProps, type FilterSearchProps } from "./FilterChip/FilterChip";
export { FilterBar, type FilterBarProps } from "./FilterBar/FilterBar";
export {
  Table,
  Pagination,
  type Column,
  type SortState,
  type SortDirection,
  type TableProps,
  type PaginationProps,
} from "./Table/Table";
export { Stepper, type StepperStep, type StepState, type StepperProps } from "./Stepper/Stepper";
export { Modal, ConfirmModal, type ModalProps, type ModalTone, type ConfirmModalProps } from "./Modal/Modal";
export { TypeToConfirmModal, type TypeToConfirmModalProps } from "./TypeToConfirm/TypeToConfirmModal";
export {
  ImpactPreview,
  type ImpactPreviewProps,
  type ImpactItem,
  type ImpactAffected,
  type ImpactSeverity,
} from "./ImpactPreview/ImpactPreview";
export { DangerZone,DangerZoneRow, type DangerZoneProps, type DangerZoneRowProps } from "./DangerZone/DangerZone";
export {
  ToastProvider,
  ToastStackPreview,
  useToast,
  type ToastApi,
  type ToastOptions,
  type ToastPreviewItem,
  type ToastTone,
} from "./Toast/Toast";
export { Tooltip, TooltipTarget, Toggletip, type TooltipProps, type TooltipSide, type ToggletipProps } from "./Tooltip/Tooltip";
export { Skeleton, SkeletonText, type SkeletonProps, type SkeletonTextProps } from "./Skeleton/Skeleton";
export { EmptyState, type EmptyStateProps } from "./EmptyState/EmptyState";
export { Meter, ProgressBar, type MeterProps, type ProgressBarProps } from "./Meter/Meter";
export {
  ProgressSteps,
  type ProgressStep,
  type ProgressStepState,
  type ProgressStepsProps,
} from "./ProgressSteps/ProgressSteps";
export { Alert, type AlertProps, type AlertTone } from "./Alert/Alert";
export { ErrorSummary, type ErrorSummaryProps, type FormError } from "./ErrorSummary/ErrorSummary";
export { Divider, type DividerProps } from "./Divider/Divider";
export { Avatar, initialsFrom, type AvatarProps } from "./Avatar/Avatar";
export { Menu, type MenuProps, type MenuEntry, type MenuAction, type MenuHeading, type MenuSeparator } from "./Menu/Menu";
export { ScrollArea, themedScrollClass, type ScrollAreaProps } from "./Scroll/ScrollArea";
export { useScrollEdges, type ScrollEdgesOptions } from "./Scroll/useScrollEdges";
export { useScrollLock, lockScroll, unlockScroll } from "./Scroll/scroll-lock";

// Added to match the shadcn/ui set, one barrel per group.
export * from "./_barrels/forms";
export * from "./_barrels/overlays";
export * from "./_barrels/layout";

// Helpers, shadcn names.
export { cn, cx } from "./_internal/cx";
export { Slot, type SlotProps } from "./_internal/slot";
