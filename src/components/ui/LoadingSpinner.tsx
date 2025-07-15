"use client";

import React from "react";
import { Loader2, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
  className?: string;
  text?: string;
  showText?: boolean;
  icon?: LucideIcon;
}

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const variantClasses = {
  default: "text-gray-600",
  primary: "text-blue-600",
  secondary: "text-gray-500",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
};

export function LoadingSpinner({
  size = "md",
  variant = "default",
  className,
  text,
  showText = false,
  icon: Icon = Loader2,
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="flex flex-col items-center space-y-2">
        <Icon
          className={cn(
            "animate-spin",
            sizeClasses[size],
            variantClasses[variant],
          )}
        />
        {showText && text && (
          <p className="text-sm text-gray-600 animate-pulse">{text}</p>
        )}
      </div>
    </div>
  );
}

// Full screen loading overlay
interface LoadingOverlayProps {
  text?: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error";
  showBackdrop?: boolean;
}

export function LoadingOverlay({
  text = "Loading...",
  variant = "default",
  showBackdrop = true,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        showBackdrop && "bg-black/20 backdrop-blur-sm",
      )}
    >
      <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col items-center space-y-4">
        <LoadingSpinner size="lg" variant={variant} />
        <p className="text-gray-600 font-medium">{text}</p>
      </div>
    </div>
  );
}

// Skeleton loading component
interface SkeletonProps {
  className?: string;
  lines?: number;
  height?: string;
}

export function Skeleton({
  className,
  lines = 1,
  height = "h-4",
}: SkeletonProps) {
  if (lines === 1) {
    return (
      <div
        className={cn("animate-pulse bg-gray-200 rounded", height, className)}
      />
    );
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn("animate-pulse bg-gray-200 rounded", height, className)}
        />
      ))}
    </div>
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div
      className="bg-white rounded-lg shadow-sm p-6 space-y-4"
      data-testid="card-skeleton"
    >
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
      </div>
    </div>
  );
}

// Email list skeleton
export function EmailListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-sm p-4 space-y-3"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-4 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Dashboard skeleton
export function DashboardSkeleton() {
  return (
    <div className="h-screen bg-gray-50" data-testid="dashboard-skeleton">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div
          className="w-64 bg-white border-r border-gray-200 p-4 space-y-4"
          data-testid="sidebar-skeleton"
        >
          <div className="space-y-2">
            <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-18 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Main content */}
        <div
          className="flex-1 p-6 space-y-6"
          data-testid="main-content-skeleton"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <CardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
