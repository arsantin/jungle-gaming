import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
    shimmer?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, shimmer = true, ...props }) => {
    return (
        <div
            className={cn(
                'rounded-xl bg-[#1a1b26]/70',
                shimmer && 'shimmer',
                className
            )}
            {...props}
        />
    )
}
