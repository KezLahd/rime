import type { SVGProps } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookText,
  BuildingComplex,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUpDown,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock,
  Ellipsis,
  ExternalLink,
  Eye,
  EyeOff,
  File,
  Funnel,
  House,
  Inbox,
  Info,
  Lock,
  LogOut,
  Mail,
  Minus,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Search,
  ShieldCheck,
  Snowflake,
  TriangleAlert,
  Truck,
  Upload,
  User,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

/*
 * Lucide icons as drawn, at Lucide's own stroke (2) unless a call site sets
 * one. The Icon* names
 * are kept so no call site changes; each maps to its Lucide counterpart.
 * Default size 16 matches button and control text.
 */

export type IconProps = Omit<SVGProps<SVGSVGElement>, "children" | "ref"> & {
  size?: number;
  /** Accessible name. Omit for decorative icons (the default). */
  title?: string;
};

function make(name: string, Lucide: LucideIcon) {
  function IconComponent({ size = 16, title, ...rest }: IconProps) {
    return (
      <Lucide
        size={size}
        aria-hidden={title ? undefined : true}
        aria-label={title}
        role={title ? "img" : undefined}
        focusable="false"
        {...rest}
      />
    );
  }
  IconComponent.displayName = name;
  return IconComponent;
}

export const IconCheck = make("IconCheck", Check);
export const IconMinus = make("IconMinus", Minus);
export const IconX = make("IconX", X);
export const IconPlus = make("IconPlus", Plus);
export const IconChevronDown = make("IconChevronDown", ChevronDown);
export const IconChevronUp = make("IconChevronUp", ChevronUp);
export const IconChevronLeft = make("IconChevronLeft", ChevronLeft);
export const IconChevronRight = make("IconChevronRight", ChevronRight);
export const IconChevronsLeft = make("IconChevronsLeft", ChevronsLeft);
export const IconChevronsRight = make("IconChevronsRight", ChevronsRight);
export const IconChevronsUpDown = make("IconChevronsUpDown", ChevronsUpDown);
export const IconArrowLeft = make("IconArrowLeft", ArrowLeft);
export const IconArrowRight = make("IconArrowRight", ArrowRight);
export const IconSearch = make("IconSearch", Search);
export const IconInfo = make("IconInfo", Info);
export const IconAlertCircle = make("IconAlertCircle", CircleAlert);
export const IconAlertTriangle = make("IconAlertTriangle", TriangleAlert);
export const IconCheckCircle = make("IconCheckCircle", CircleCheck);
export const IconUpload = make("IconUpload", Upload);
export const IconFile = make("IconFile", File);
export const IconCalendar = make("IconCalendar", Calendar);
export const IconUser = make("IconUser", User);
export const IconUsers = make("IconUsers", Users);
export const IconBuilding = make("IconBuilding", BuildingComplex);
export const IconLogOut = make("IconLogOut", LogOut);
export const IconShield = make("IconShield", ShieldCheck);
export const IconLock = make("IconLock", Lock);
export const IconEye = make("IconEye", Eye);
export const IconEyeOff = make("IconEyeOff", EyeOff);
export const IconClipboard = make("IconClipboard", ClipboardList);
export const IconInbox = make("IconInbox", Inbox);
export const IconHome = make("IconHome", House);
export const IconBook = make("IconBook", BookText);
export const IconTruck = make("IconTruck", Truck);
export const IconSnowflake = make("IconSnowflake", Snowflake);
export const IconPlay = make("IconPlay", Play);
export const IconExternal = make("IconExternal", ExternalLink);
export const IconMail = make("IconMail", Mail);
export const IconFilter = make("IconFilter", Funnel);
export const IconMoreHorizontal = make("IconMoreHorizontal", Ellipsis);
export const IconPrinter = make("IconPrinter", Printer);
export const IconClock = make("IconClock", Clock);
export const IconRefresh = make("IconRefresh", RefreshCw);
