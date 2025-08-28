"use client"

import { Mail, Phone, MessageSquare } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface ContactButtonProps {
  email: string
  phone: string
  name: string
}

export function ContactButton({ email, phone, name }: ContactButtonProps) {
  const handleEmailClick = () => {
    window.location.href = `mailto:${email}?subject=Allstates Movers  - Moving Request`
  }

  const handlePhoneClick = () => {
    window.location.href = `tel:${phone}`
  }

  const handleWhatsAppClick = () => {
    // Format phone number for WhatsApp (remove non-digits)
    const formattedPhone = phone.replace(/\D/g, "")
    window.open(
      `https://wa.me/${formattedPhone}?text=Hello ${name}, this is Allstates Movers  regarding your moving request.`,
      "_blank",
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          Contact
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEmailClick}>
          <Mail className="mr-2 h-4 w-4" />
          <span>Email</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePhoneClick}>
          <Phone className="mr-2 h-4 w-4" />
          <span>Call</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleWhatsAppClick}>
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>WhatsApp</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
