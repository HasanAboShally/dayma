// ============================================================
// Ramadan Companion — Centralized Icon Map
// Uses lucide-react icons for a polished UI
// ============================================================

import type { LucideProps } from "lucide-react";
import {
  AlarmClock,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  Brain,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleChevronRight,
  CirclePlus,
  Clock,
  Clock1,
  Clock2,
  Clock3,
  Clock4,
  CloudSun,
  Download,
  Eye,
  EyeOff,
  Flag,
  Flame,
  GraduationCap,
  Hand,
  HandHeart,
  Heart,
  HeartHandshake,
  Home,
  Info,
  Leaf,
  Lightbulb,
  List,
  Menu,
  MessageCircle,
  Minus,
  Moon,
  MoonStar,
  Pencil,
  Plus,
  RefreshCw,
  Repeat,
  Scroll,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Sprout,
  Star,
  Sun,
  Sunrise,
  Sunset,
  Target,
  Timer,
  TreeDeciduous,
  TrendingUp,
  Trophy,
  Upload,
  Users,
  Utensils,
  UtensilsCrossed,
  Wrench,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

// ── Types ────────────────────────────────────────────────────

export type IconName =
  // Categories
  | "quran"
  | "prayer"
  | "dhikr"
  | "charity"
  | "dua"
  | "fasting"
  | "learning"
  // Paths
  | "gentle"
  | "steady"
  | "devoted"
  | "custom"
  // Assessment - time
  | "time-10"
  | "time-20"
  | "time-30"
  | "time-45"
  | "time-60"
  // Assessment - experience
  | "exp-beginner"
  | "exp-intermediate"
  | "exp-experienced"
  | "exp-advanced"
  // Assessment - life
  | "life-student"
  | "life-working"
  | "life-homemaker"
  | "life-retired"
  | "life-flexible"
  // Assessment - goals
  | "goal-consistency"
  | "goal-quran"
  | "goal-prayer"
  | "goal-knowledge"
  | "goal-spirituality"
  | "goal-charity"
  // Navigation
  | "nav-home"
  | "nav-today"
  | "nav-progress"
  | "nav-settings"
  // UI
  | "moon"
  | "sparkles"
  | "wrench"
  | "flame"
  | "star"
  | "target"
  | "trending-up"
  | "calendar"
  | "bar-chart"
  | "upload"
  | "download"
  | "lightbulb"
  | "chat"
  | "check"
  | "heart"
  // Gallery / actions / navigation
  | "sunrise"
  | "sunset"
  | "sun"
  | "cloud-sun"
  | "users"
  | "alarm-clock"
  | "bell-ring"
  | "clock"
  | "circle-plus"
  | "smile"
  | "eye"
  | "eye-off"
  | "circle-chevron-right"
  | "search"
  | "close"
  | "x"
  | "alert"
  | "info"
  | "chevron-down"
  | "chevron-up"
  | "chevron-left"
  | "chevron-right"
  | "arrow-left"
  | "arrow-right"
  | "list"
  // Three-layer model icons
  | "shield-check"
  | "trophy"
  | "edit-3"
  | "moon-star"
  | "check-circle"
  | "brain"
  | "refresh-cw"
  | "repeat"
  | "heart-handshake"
  | "hand"
  | "menu"
  | "settings-2"
  | "share"
  | "scroll"
  | "book-open"
  | "book-open-check"
  | "utensils"
  | "utensils-crossed"
  | "graduation-cap"
  | "flag"
  | "plus"
  | "minus";

// ── Icon Registry ────────────────────────────────────────────

const ICON_MAP: Record<IconName, ComponentType<LucideProps>> = {
  // Categories (worship types)
  quran: BookOpen,
  prayer: HandHeart,
  dhikr: Repeat,
  charity: Heart,
  dua: Sparkles,
  fasting: Moon,
  learning: GraduationCap,

  // Paths (difficulty levels)
  gentle: Sprout,
  steady: Leaf,
  devoted: TreeDeciduous,
  custom: Pencil,

  // Assessment - time options
  "time-10": Timer,
  "time-20": Clock1,
  "time-30": Clock2,
  "time-45": Clock3,
  "time-60": Clock4,

  // Assessment - experience
  "exp-beginner": Sprout,
  "exp-intermediate": Leaf,
  "exp-experienced": TreeDeciduous,
  "exp-advanced": Star,

  // Assessment - life situation
  "life-student": BookOpenText,
  "life-working": Briefcase,
  "life-homemaker": Home,
  "life-retired": Sunset,
  "life-flexible": Target,

  // Assessment - goals
  "goal-consistency": Repeat,
  "goal-quran": BookOpen,
  "goal-prayer": HandHeart,
  "goal-knowledge": GraduationCap,
  "goal-spirituality": Sparkles,
  "goal-charity": Heart,

  // Navigation
  "nav-home": Home,
  "nav-today": Sun,
  "nav-progress": BarChart3,
  "nav-settings": Settings,

  // General UI
  moon: Moon,
  sparkles: Sparkles,
  wrench: Wrench,
  flame: Flame,
  star: Star,
  target: Target,
  "trending-up": TrendingUp,
  calendar: Calendar,
  "bar-chart": BarChart3,
  upload: Upload,
  download: Download,
  lightbulb: Lightbulb,
  chat: MessageCircle,
  check: Check,
  heart: Heart,

  // Gallery / actions / navigation
  sunrise: Sunrise,
  sunset: Sunset,
  sun: Sun,
  "cloud-sun": CloudSun,
  users: Users,
  "alarm-clock": AlarmClock,
  "bell-ring": BellRing,
  clock: Clock,
  "circle-plus": CirclePlus,
  smile: Smile,
  eye: Eye,
  "eye-off": EyeOff,
  "circle-chevron-right": CircleChevronRight,
  search: Search,
  close: X,
  x: X,
  alert: AlertTriangle,
  info: Info,
  "chevron-down": ChevronDown,
  "chevron-up": ChevronUp,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  list: List,

  // Three-layer model icons
  "shield-check": ShieldCheck,
  trophy: Trophy,
  "edit-3": Pencil,
  "moon-star": MoonStar,
  "check-circle": CheckCircle,
  brain: Brain,
  "refresh-cw": RefreshCw,
  repeat: Repeat,
  "heart-handshake": HeartHandshake,
  hand: Hand,
  menu: Menu,
  "settings-2": Settings,
  share: Share2,
  scroll: Scroll,
  "book-open": BookOpen,
  "book-open-check": BookOpenCheck,
  utensils: Utensils,
  "utensils-crossed": UtensilsCrossed,
  "graduation-cap": GraduationCap,
  flag: Flag,
  plus: Plus,
  minus: Minus,
};

// ── Public API ───────────────────────────────────────────────

interface IconProps extends LucideProps {
  name: IconName;
}

/**
 * Render a Lucide icon by name.
 *
 * Usage:
 *   <Icon name="quran" className="h-5 w-5" />
 *   <Icon name="nav-home" size={20} />
 */
export function Icon({ name, ...props }: IconProps) {
  const LucideIcon = ICON_MAP[name];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
}

/**
 * Get the Lucide component for a given icon name.
 * Useful when you need the raw component (e.g. for dynamic rendering).
 */
export function getIconComponent(name: IconName): ComponentType<LucideProps> {
  return ICON_MAP[name];
}
