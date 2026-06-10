import Link from 'next/link'

export function LandingFooter() {
  return (
    <footer className="py-12 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">K</span>
              </div>
              <span className="text-xl font-semibold text-foreground">Kairos</span>
            </div>
            <p className="text-muted-foreground max-w-sm">
              Timing intelligence for B2B sales. Discover newly registered businesses 
              early and reach out when timing is right.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#why-timing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Why Timing
                </Link>
              </li>
              <li>
                <Link href="#timing-stages" className="text-muted-foreground hover:text-foreground transition-colors">
                  Stages
                </Link>
              </li>
              <li>
                <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
                  How it Works
                </Link>
              </li>
              <li>
                <Link href="#cta" className="text-muted-foreground hover:text-foreground transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Kairos. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made for B2B professionals who value better timing.
          </p>
        </div>
      </div>
    </footer>
  )
}
