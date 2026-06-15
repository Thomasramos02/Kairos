'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-white/90 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">K</span>
            </div>
            <span className="text-xl font-semibold text-foreground">Kairos</span>
          </div>

<<<<<<< HEAD
          <div className="hidden md:flex md:items-center md:gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Opportunity
=======
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <Link href="#why-timing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Why Timing
            </Link>
            <Link href="#timing-stages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Stages
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it Works
            </Link>
            <Link href="#dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
<<<<<<< HEAD
            <Link href="#use-cases" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Niches
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Beta
=======
            <Link href="#cta" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Get Started
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
<<<<<<< HEAD
              <Link href="/signup">Try now for free</Link>
=======
              <Link href="/signup">Sign Up</Link>
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
            </Button>
          </div>

          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-white py-4">
            <div className="flex flex-col gap-4">
<<<<<<< HEAD
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Opportunity
=======
              <Link href="#why-timing" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Why Timing
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
              </Link>
              <Link href="#timing-stages" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Stages
              </Link>
              <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                How it Works
              </Link>
              <Link href="#dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
<<<<<<< HEAD
              <Link href="#use-cases" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Niches
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Beta
=======
              <Link href="#cta" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Get Started
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button variant="ghost" asChild className="justify-start">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild>
<<<<<<< HEAD
                  <Link href="/signup">Try now for free</Link>
=======
                  <Link href="/signup">Sign Up</Link>
>>>>>>> 0cc7802447f0cee6ce7d46558eb5bd52beafc943
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
