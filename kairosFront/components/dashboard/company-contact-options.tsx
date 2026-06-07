import { BadgeCheck, Building2, FileBadge, Mail, MapPin, MessageSquare, Phone, UserRound } from 'lucide-react'

import { Company } from '@/lib/types'

type ContactMethod = NonNullable<
  NonNullable<Company['digitalSignals']>[number]['metadata']['contactMethods']
>[number]

export function CompanyContactOptions({ company }: { company: Company }) {
  const contacts = collectContactMethods(company)

  if (contacts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No public corporate contact option is recorded yet.
      </p>
    )
  }

  return <ContactMethodList contacts={contacts} />
}

export function ContactMethodList({
  contacts,
}: {
  contacts: readonly ContactMethod[]
}) {
  return (
    <div className="grid gap-2">
      {contacts.map((contact) => (
        <ContactMethodItem
          key={`${contact.type}-${contact.value}`}
          contact={contact}
        />
      ))}
    </div>
  )
}

function collectContactMethods(company: Company): readonly ContactMethod[] {
  const contacts = new Map<string, ContactMethod>()

  for (const signal of company.digitalSignals ?? []) {
    for (const contact of signal.metadata.contactMethods ?? []) {
      contacts.set(`${contact.type}:${contact.value}`, contact)
    }
  }

  return [...contacts.values()]
}

function ContactIcon({ type }: { type: ContactMethod['type'] }) {
  if (type === 'phone') return <Phone className="h-4 w-4 text-muted-foreground" />
  if (type === 'email') return <Mail className="h-4 w-4 text-muted-foreground" />
  if (type === 'contact-form') return <MessageSquare className="h-4 w-4 text-muted-foreground" />
  if (type === 'address') return <MapPin className="h-4 w-4 text-muted-foreground" />
  if (type === 'agent') return <UserRound className="h-4 w-4 text-muted-foreground" />
  if (type === 'officer') return <Building2 className="h-4 w-4 text-muted-foreground" />
  return <FileBadge className="h-4 w-4 text-muted-foreground" />
}

function ContactMethodItem({ contact }: { contact: ContactMethod }) {
  const content = <ContactMethodContent contact={contact} />
  const href = buildContactHref(contact)

  if (href === null) {
    return <div className="rounded-lg border border-border px-3 py-2 text-sm">{content}</div>
  }

  return (
    <a href={href} className="rounded-lg border border-border px-3 py-2 text-sm hover:border-primary/50">
      {content}
    </a>
  )
}

function ContactMethodContent({ contact }: { contact: ContactMethod }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2 text-foreground">
        <ContactIcon type={contact.type} />
        <span className="break-all">{formatContactValue(contact)}</span>
      </span>
      <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
        <BadgeCheck className="h-3.5 w-3.5" />
        {contact.label ?? contact.source}, {contact.confidenceScore}%
      </span>
    </div>
  )
}

function buildContactHref(contact: ContactMethod): string | null {
  if (contact.type === 'phone') return `tel:${contact.value}`
  if (contact.type === 'email') return `mailto:${contact.value}`
  if (contact.type === 'contact-form') return contact.value
  return null
}

function formatContactValue(contact: ContactMethod): string {
  if (contact.type !== 'contact-form') {
    return contact.value
  }

  return contact.value.startsWith('http') ? contact.value : `Contact form: ${contact.value}`
}
